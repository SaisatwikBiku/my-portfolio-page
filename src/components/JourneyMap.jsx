import { useEffect, useRef, useState, useCallback } from 'react'
import Section from './Section.jsx'
import WalkerSprite from './WalkerSprite.jsx'
import { WORLD, SPAWN, PLACES, NEAR_RADIUS, isWalkable } from '../data/journey.js'

// An explorable top-down world built from the experience letters and resume:
// arrow keys / WASD walk the character between every city he has studied or
// worked in, and standing on a marker opens that chapter.
//
// The world itself is one hand-illustrated background image (public/map/world.jpg)
// rather than a scene composited from dozens of separate pieces — one AI
// generation covering the whole journey in a single consistent art style.
// Walkability is read off that same image (see isWalkable in journey.js), so
// collision matches the actual coastline instead of a hand-fitted rectangle
// approximation of it.
//
// Rendering is still DOM, not canvas — one composited transform on the world
// layer per frame keeps the SVG walker crisp and every place label real,
// selectable text. The loop writes straight to refs/DOM; React state is
// reserved for the four things the UI actually re-renders on: control,
// proximity, open card, progress.

const SPEED = 0.24 // world px per ms (~14 px/frame at 60fps)
const HALF_W = 15 // collision box is the character's feet, not the whole sprite
const HALF_H = 11

const DIRS = {
  ArrowUp: 'up', w: 'up', W: 'up',
  ArrowDown: 'down', s: 'down', S: 'down',
  ArrowLeft: 'left', a: 'left', A: 'left',
  ArrowRight: 'right', d: 'right', D: 'right',
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

// A spot is standable when all four corners of the feet box land on walkable
// ground (they overlap, so straddling a seam is fine).
function standable(x, y) {
  return (
    isWalkable(x - HALF_W, y - HALF_H) &&
    isWalkable(x + HALF_W, y - HALF_H) &&
    isWalkable(x - HALF_W, y + HALF_H) &&
    isWalkable(x + HALF_W, y + HALF_H)
  )
}

const KIND_ICON = {
  school: <path d="M2 8 12 3l10 5-10 5L2 8Zm4 4v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" />,
  work: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" /></>,
  travel: <path d="M2 13l20-7-7 20-3-8-8-3 -2-2Z" />,
  now: <><path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z" /><circle cx="12" cy="10" r="2.6" /></>,
}

// Dashed route threading the chapters together, so the journey reads even
// before you start walking.
const ROUTE = PLACES.map((p) => `${p.x},${p.y}`).join(' ')

export default function JourneyMap() {
  const [active, setActive] = useState(false) // does the map own the arrow keys?
  const [near, setNear] = useState(null)
  const [open, setOpen] = useState(null)
  const [found, setFound] = useState(() => new Set())
  const [touch, setTouch] = useState(false) // show the D-pad?

  const stageRef = useRef(null)
  const worldRef = useRef(null)
  const walkerRef = useRef(null)
  const dotRef = useRef(null)
  const arrowRef = useRef(null)
  const keys = useRef(new Set()) // held keyboard directions
  const pad = useRef(new Set()) // held touch D-pad directions
  const pos = useRef({ ...SPAWN })
  const face = useRef(1)
  const wasMoving = useRef(false)
  const nearRef = useRef(null)
  const activeRef = useRef(false)
  const openRef = useRef(null)
  const seen = useRef(new Set())
  const visible = useRef(true)

  openRef.current = open

  const openPlace = useCallback((id) => {
    setOpen(id)
    keys.current.clear()
    pad.current.clear()
  }, [])

  // Legend entries double as fast travel — the whole map stays usable with a
  // mouse, on touch, and for anyone who would rather read than walk.
  const travelTo = useCallback(
    (id) => {
      const p = PLACES.find((q) => q.id === id)
      if (!p) return
      pos.current = { x: p.x, y: p.y }
      face.current = 1
      seen.current.add(id)
      setFound(new Set(seen.current))
      setNear(id)
      nearRef.current = id
      openPlace(id)
      stageRef.current?.focus({ preventScroll: true })
    },
    [openPlace],
  )

  // There are no arrow keys on a phone, so the D-pad is the only way in. Decide
  // in JS rather than with a `hover: none` media query — touch laptops and
  // hybrid devices report a fine pointer and would have been left with no
  // controls at all.
  useEffect(() => {
    if (window.matchMedia?.('(pointer: coarse)').matches) setTouch(true)
    const onTouch = () => setTouch(true)
    window.addEventListener('touchstart', onTouch, { once: true, passive: true })
    return () => window.removeEventListener('touchstart', onTouch)
  }, [])

  // Pause the loop while the section is off-screen.
  useEffect(() => {
    const el = stageRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([e]) => { visible.current = e.isIntersecting },
      { rootMargin: '120px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    let raf = 0
    let last = performance.now()

    const frame = (now) => {
      const dt = Math.min(34, now - last)
      last = now
      raf = requestAnimationFrame(frame)
      if (!visible.current) return

      const stage = stageRef.current
      const world = worldRef.current
      const walker = walkerRef.current
      if (!stage || !world || !walker) return

      // Zoom out a touch on narrow viewports so the world still reads.
      const scale = stage.clientWidth < 640 ? 0.72 : 1
      const viewW = stage.clientWidth / scale
      const viewH = stage.clientHeight / scale

      // Focus is the single source of truth for "the map has the keyboard".
      // Deriving the veil from it here (rather than from focus/blur handlers)
      // keeps the two from ever disagreeing, and dropping held keys the moment
      // focus leaves stops the character walking on a direction whose keyup
      // never arrived — an arrow pressed and then Cmd-Tabbed away from.
      const focused = document.activeElement === stage
      if (!focused && keys.current.size) keys.current.clear()
      if (focused !== activeRef.current) {
        activeRef.current = focused
        setActive(focused)
      }

      const held = (dir) => keys.current.has(dir) || pad.current.has(dir)
      let dx = (held('right') ? 1 : 0) - (held('left') ? 1 : 0)
      let dy = (held('down') ? 1 : 0) - (held('up') ? 1 : 0)
      if (openRef.current) { dx = 0; dy = 0 }

      const moving = dx !== 0 || dy !== 0
      if (moving) {
        if (dx && dy) { const inv = Math.SQRT1_2; dx *= inv; dy *= inv }
        const dist = SPEED * dt
        const p = pos.current
        // Resolve one axis at a time so the character slides along walls
        // instead of sticking to them.
        const nx = clamp(p.x + dx * dist, HALF_W, WORLD.w - HALF_W)
        if (dx && standable(nx, p.y)) p.x = nx
        const ny = clamp(p.y + dy * dist, HALF_H, WORLD.h - HALF_H)
        if (dy && standable(p.x, ny)) p.y = ny
        if (dx > 0) face.current = 1
        else if (dx < 0) face.current = -1
      }

      if (moving !== wasMoving.current) {
        walker.classList.toggle('is-walking', moving)
        wasMoving.current = moving
      }

      const { x, y } = pos.current
      // 2D transforms only: a translate3d here would promote the world to a
      // compositor layer at its full 2752×1536 size. See .journey-world.
      walker.style.transform = `translate(${x}px, ${y}px) scaleX(${face.current})`

      const camX = clamp(x - viewW / 2, 0, Math.max(0, WORLD.w - viewW))
      const camY = clamp(y - viewH / 2, 0, Math.max(0, WORLD.h - viewH))
      world.style.transform = `scale(${scale}) translate(${-camX}px, ${-camY}px)`

      const dot = dotRef.current
      if (dot) {
        dot.style.left = `${(x / WORLD.w) * 100}%`
        dot.style.top = `${(y / WORLD.h) * 100}%`
      }

      // Compass arrow to the next undiscovered chapter, in story order — so
      // wandering the map never means missing one. Pinned to the edge of the
      // stage (not the world), pointing at wherever that chapter's marker
      // currently sits relative to the camera. Hidden once the marker is
      // already on screen (nothing left to point at) or while a card is open.
      const arrow = arrowRef.current
      if (arrow) {
        const next = openRef.current ? null : PLACES.find((p) => !seen.current.has(p.id))
        if (!next) {
          arrow.style.opacity = '0'
        } else {
          const stageW = stage.clientWidth
          const stageH = stage.clientHeight
          const cx = stageW / 2
          const cy = stageH / 2
          const dx = (next.x - camX) * scale - cx
          const dy = (next.y - camY) * scale - cy
          const margin = 34
          const halfW = Math.max(1, stageW / 2 - margin)
          const halfH = Math.max(1, stageH / 2 - margin)
          const sx = dx !== 0 ? halfW / Math.abs(dx) : Infinity
          const sy = dy !== 0 ? halfH / Math.abs(dy) : Infinity
          const s = Math.min(sx, sy)
          if (!Number.isFinite(s) || s >= 1) {
            arrow.style.opacity = '0'
          } else {
            const angle = Math.atan2(dy, dx) * (180 / Math.PI)
            arrow.style.opacity = '1'
            arrow.style.transform = `translate(${cx + dx * s}px, ${cy + dy * s}px) rotate(${angle}deg)`
          }
        }
      }

      // Nearest marker within the trigger radius wins.
      let hit = null
      let bestSq = NEAR_RADIUS * NEAR_RADIUS
      for (const p of PLACES) {
        const sq = (p.x - x) ** 2 + (p.y - y) ** 2
        if (sq < bestSq) { bestSq = sq; hit = p.id }
      }
      if (hit !== nearRef.current) {
        nearRef.current = hit
        setNear(hit)
        // First arrival opens the chapter unprompted, so walking into a place
        // always pays off; later visits just show the prompt.
        if (hit && !seen.current.has(hit)) {
          seen.current.add(hit)
          setFound(new Set(seen.current))
          setOpen(hit)
          keys.current.clear()
          pad.current.clear()
        }
      }
    }

    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [])

  const onKeyDown = (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return
    if (e.key === 'Escape') {
      if (open) setOpen(null)
      else stageRef.current?.blur()
      return
    }
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E') {
      e.preventDefault()
      if (open) setOpen(null)
      else if (nearRef.current) openPlace(nearRef.current)
      return
    }
    const dir = DIRS[e.key]
    if (!dir) return
    e.preventDefault() // arrows would otherwise scroll the page out from under you
    keys.current.add(dir)
  }

  const onKeyUp = (e) => {
    const dir = DIRS[e.key]
    if (dir) keys.current.delete(dir)
  }

  // Touch D-pad: press-and-hold. Kept in its own set because it works without
  // focus, and releasing on leave/cancel too means a finger sliding off a
  // button can never leave the character walking forever.
  const padPress = (dir) => (e) => {
    // preventDefault stops the button taking focus off the stage, which the
    // loop reads to decide whether the map is in control.
    e.preventDefault()
    stageRef.current?.focus({ preventScroll: true })
    pad.current.add(dir)
  }
  const padRelease = (dir) => () => pad.current.delete(dir)

  const openPlaceData = PLACES.find((p) => p.id === open)
  const nearPlaceData = PLACES.find((p) => p.id === near)
  const pct = Math.round((found.size / PLACES.length) * 100)

  return (
    <Section
      id="journey"
      title="The Journey"
      eyebrow="Playable"
      num="06"
      lead="Four cities, Multiple experiences, one very long flight — walk it yourself."
      className="journey"
    >
      <div className="journey-hud-top">
        <p className="journey-help">
          <kbd>←</kbd> <kbd>↑</kbd> <kbd>↓</kbd> <kbd>→</kbd> or <kbd>WASD</kbd> to walk ·{' '}
          <kbd>Enter</kbd> to read · <kbd>Esc</kbd> to let go
        </p>
        <div className="journey-progress">
          <span className="journey-progress-track">
            <span className="journey-progress-fill" style={{ width: `${pct}%` }} />
          </span>
          <span className="journey-progress-text">
            <strong>{found.size}</strong> / {PLACES.length} chapters
          </span>
        </div>
      </div>

      <div
        className={`journey-stage ${active ? 'is-active' : ''} ${open ? 'is-reading' : ''}`}
        ref={stageRef}
        tabIndex={0}
        role="application"
        aria-label="Walkable map of Sai's education and work history. Use the arrow keys to move and Enter to read a place. Every place is also listed as a button below the map."
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onClick={() => stageRef.current?.focus({ preventScroll: true })}
      >
        <div
          className="journey-world"
          ref={worldRef}
          style={{ width: WORLD.w, height: WORLD.h, backgroundImage: 'url(/map/world.jpg)' }}
        >
          <svg className="jw-route" viewBox={`0 0 ${WORLD.w} ${WORLD.h}`} aria-hidden="true">
            <polyline points={ROUTE} />
          </svg>

          {PLACES.map((p) => (
            <div
              key={p.id}
              className={`jw-marker jw-marker--${p.kind} ${found.has(p.id) ? 'is-found' : ''} ${near === p.id ? 'is-near' : ''}`}
              style={{ left: p.x, top: p.y }}
              aria-hidden="true"
            >
              <span className="jw-marker-pin">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  {KIND_ICON[p.kind]}
                </svg>
              </span>
              <span className="jw-marker-chapter">{p.chapter}</span>
              <span className="jw-marker-name">{p.short}</span>
            </div>
          ))}

          <div className="jw-walker" ref={walkerRef} aria-hidden="true">
            <span className="jw-shadow" />
            <WalkerSprite className="jw-walker-svg" />
          </div>
        </div>

        {/* The whole world at a glance — a 2752×1536 map seen one ~1060×560
            slice at a time is easy to get lost in. Uses a small copy of the
            same illustration as its background, so it reads as an actual map
            rather than a schematic. */}
        <div className="journey-minimap" aria-hidden="true">
          <svg viewBox={`0 0 ${WORLD.w} ${WORLD.h}`} preserveAspectRatio="none">
            <polyline points={ROUTE} className="jw-mini-route" />
            {PLACES.map((p) => (
              <circle
                key={p.id}
                cx={p.x}
                cy={p.y}
                r="34"
                className={found.has(p.id) ? 'is-found' : ''}
              />
            ))}
          </svg>
          <span className="journey-minimap-dot" ref={dotRef} />
        </div>

        {/* Points at whichever chapter is next in story order, whenever it's
            off screen — a compass, not a marker, so it lives in stage/screen
            space and is positioned by the loop rather than by the camera
            transform. */}
        <div className="journey-arrow" ref={arrowRef} aria-hidden="true">
          <span className="journey-arrow-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12h15M14 6l6 6-6 6" />
            </svg>
          </span>
        </div>

        {/* Take-control veil. Focus is the switch, so the page never loses its
            own arrow-key scrolling to a map the visitor is not playing. */}
        {!active && (
          <div className="journey-veil">
            <span className="journey-veil-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 11h4M8 9v4M15.5 12h.01M18 10h.01" />
                <rect x="2" y="6" width="20" height="12" rx="5" />
              </svg>
              {touch ? 'Tap to take control' : 'Click to take control'}
            </span>
            <span className="journey-veil-sub">
              {touch ? 'Use the D-pad' : 'Arrow keys or WASD'} · {PLACES.length} chapters to find
            </span>
          </div>
        )}

        {near && !open && (
          <div className="journey-prompt" aria-hidden="true">
            <span className="journey-prompt-dot" />
            <strong>{nearPlaceData.name}</strong>
            <span>
              <kbd>Enter</kbd> to read
            </span>
          </div>
        )}

        {openPlaceData && (
          <div className="journey-card" role="dialog" aria-label={openPlaceData.name}>
            <button className="journey-card-close" onClick={() => setOpen(null)} aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M3 3l6 6M9 3l-6 6" />
              </svg>
            </button>
            <span className="journey-card-chapter">Chapter {openPlaceData.chapter}</span>
            <h3>{openPlaceData.name}</h3>
            <p className="journey-card-role">{openPlaceData.role}</p>
            <p className="journey-card-meta">
              {openPlaceData.period} · {openPlaceData.place}
            </p>
            <ul>
              {openPlaceData.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
            {openPlaceData.cta && (
              <a className="btn btn--primary journey-card-cta" href="#contact">
                Get in touch
              </a>
            )}
          </div>
        )}

        <div className="journey-pad" aria-hidden="true" hidden={!touch}>
          {[
            ['up', 'M12 5v14M5 12l7-7 7 7'],
            ['left', 'M19 12H5M12 5l-7 7 7 7'],
            ['down', 'M12 5v14M5 12l7 7 7-7'],
            ['right', 'M5 12h14M12 5l7 7-7 7'],
          ].map(([dir, d]) => (
            <button
              key={dir}
              className={`journey-pad-btn journey-pad-btn--${dir}`}
              onPointerDown={padPress(dir)}
              onPointerUp={padRelease(dir)}
              onPointerLeave={padRelease(dir)}
              onPointerCancel={padRelease(dir)}
              onContextMenu={(e) => e.preventDefault()}
              tabIndex={-1}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d={d} />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* The same eight chapters as plain buttons: the accessible path through
          this section, and fast travel for anyone already playing. */}
      <ol className="journey-legend">
        {PLACES.map((p) => (
          <li key={p.id}>
            <button
              className={`journey-legend-btn ${found.has(p.id) ? 'is-found' : ''} ${open === p.id ? 'is-open' : ''}`}
              onClick={() => travelTo(p.id)}
            >
              <span className="journey-legend-num">{p.chapter}</span>
              <span className="journey-legend-text">
                <strong>{p.name}</strong>
                <em>
                  {p.role} · {p.period}
                </em>
              </span>
              <span className="journey-legend-place">{p.city}</span>
            </button>
          </li>
        ))}
      </ol>
    </Section>
  )
}
