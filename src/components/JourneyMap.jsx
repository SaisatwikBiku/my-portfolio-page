import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Section from './Section.jsx'
import CrossingMap from './CrossingMap.jsx'
import { WORLD, SPAWN, NEAR_RADIUS, PLACES } from '../data/journey.js'
import { props as PROPS, propIndexAtY, sparkles, isWalkable } from '../lib/journeyWorld.js'
import {
  makePalette, bakeTerrain, drawProp, drawMarkerPad, drawMarkerPin, drawWalker,
  drawClouds, drawSparkles, drawDust, drawBirds, tint,
} from '../lib/journeyPaint.js'

// The Journey — a small top-down game that happens to be a résumé.
//
// The world is no longer a picture. src/lib/journeyWorld.js grows the island,
// its forests, its towns and its roads from a seeded noise field, and
// journeyPaint.js paints it into an offscreen canvas once per theme. This
// component owns the parts that move: input, the camera, the simulation, and
// the HUD.
//
// Rendering is canvas rather than DOM. With ~1,500 props, animated water,
// weather and particles, one canvas draw beats fifteen hundred layout-affecting
// elements by an order of magnitude — and it lets the character be sorted
// between the trees instead of always on top of them. The accessible path
// through the section is unchanged and does not require playing: every chapter
// is a real button in the list underneath the map.
//
// React state is reserved for the six things the UI actually re-renders on:
// control, proximity, the open card, progress, touch, and fullscreen. Everything
// per-frame is written straight to refs and the canvas.

const SPEED = 0.27 // world px per ms
const HALF_W = 13 // collision box is the character's feet, not the whole sprite
const HALF_H = 9
const WALK_CYCLE = 480 // ms for a full two-step gait

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

const HEX = /^#[0-9a-f]{6}$/i
function readAccent() {
  if (typeof window === 'undefined') return '#007bff'
  const v = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()
  return HEX.test(v) ? v : '#007bff'
}

// Native fullscreen is unavailable for arbitrary elements on iPhone Safari, so
// the button falls back to a fixed-position "fill the window" mode. Both end up
// as the same `is-full` class; only the exit path differs.
const NATIVE_FS =
  typeof document !== 'undefined' &&
  (document.fullscreenEnabled || document.webkitFullscreenEnabled) &&
  typeof Element !== 'undefined' &&
  !!(Element.prototype.requestFullscreen || Element.prototype.webkitRequestFullscreen)

export default function JourneyMap() {
  const [active, setActive] = useState(false) // does the map own the arrow keys?
  const [near, setNear] = useState(null)
  const [open, setOpen] = useState(null)
  const [found, setFound] = useState(() => new Set())
  const [touch, setTouch] = useState(false) // show the D-pad?
  const [nativeFull, setNativeFull] = useState(false)
  const [faux, setFaux] = useState(false) // fallback "fill the window" mode
  const [ready, setReady] = useState(false)
  const full = nativeFull || faux

  const frameRef = useRef(null)
  const stageRef = useRef(null)
  const canvasRef = useRef(null)
  const miniRef = useRef(null)

  const bakedRef = useRef(null)
  const palRef = useRef(null)
  const imgRef = useRef(null)

  const keys = useRef(new Set()) // held keyboard directions
  const pad = useRef(new Set()) // held touch D-pad directions
  const pos = useRef({ ...SPAWN })
  const cam = useRef({ x: SPAWN.x, y: SPAWN.y })
  const face = useRef(1)
  const phase = useRef(0)
  const nearRef = useRef(null)
  const activeRef = useRef(false)
  const openRef = useRef(null)
  const seen = useRef(new Set())
  const visible = useRef(true)
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 })
  const dust = useRef([])
  const clouds = useRef([])
  const birds = useRef([])

  openRef.current = open

  const reduced = useRef(false)

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
      // Just south of the pin, so the character isn't standing on top of it —
      // unless that spot is off the path, which it is at the crossing, where
      // 40px south of the marker is open water and would strand the walker.
      pos.current = standable(p.x, p.y + 40) ? { x: p.x, y: p.y + 40 } : { x: p.x, y: p.y }
      cam.current = { x: p.x, y: p.y }
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

  /* ---------------- fullscreen ---------------- */

  const grab = useCallback(() => {
    requestAnimationFrame(() => stageRef.current?.focus({ preventScroll: true }))
  }, [])

  const toggleFull = useCallback(() => {
    const el = frameRef.current
    if (!el) return
    if (faux) { setFaux(false); grab(); return }
    const fsEl = document.fullscreenElement || document.webkitFullscreenElement
    if (fsEl) {
      ;(document.exitFullscreen || document.webkitExitFullscreen).call(document)
      return
    }
    if (!NATIVE_FS) { setFaux(true); grab(); return }
    const req = el.requestFullscreen || el.webkitRequestFullscreen
    // navigationUI: 'hide' is ignored where unsupported. Two things can go
    // wrong beyond an outright rejection: an embedded frame without the
    // fullscreen permission resolves the promise and then simply doesn't go
    // fullscreen. So rather than trust the promise, check whether it actually
    // happened, and fall back to the fixed overlay if it didn't.
    const fall = () => {
      if (!(document.fullscreenElement || document.webkitFullscreenElement)) {
        setFaux(true)
        grab()
      }
    }
    try {
      Promise.resolve(req.call(el, { navigationUI: 'hide' })).catch(fall)
    } catch {
      fall()
      return
    }
    setTimeout(fall, 260)
  }, [faux, grab])

  useEffect(() => {
    const onChange = () => {
      const on = !!(document.fullscreenElement || document.webkitFullscreenElement)
      setNativeFull(on)
      if (on) { setFaux(false); grab() }
    }
    document.addEventListener('fullscreenchange', onChange)
    document.addEventListener('webkitfullscreenchange', onChange)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      document.removeEventListener('webkitfullscreenchange', onChange)
    }
  }, [grab])

  // The fallback mode is a fixed overlay, so the page behind it must not scroll.
  useEffect(() => {
    if (!faux) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [faux])

  /* ---------------- setup ---------------- */

  // There are no arrow keys on a phone, so the D-pad is the only way in. Decide
  // in JS rather than with a `hover: none` media query — touch laptops and
  // hybrid devices report a fine pointer and would have been left with no
  // controls at all.
  useEffect(() => {
    if (window.matchMedia?.('(pointer: coarse)').matches) setTouch(true)
    const onTouch = () => setTouch(true)
    window.addEventListener('touchstart', onTouch, { once: true, passive: true })
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    reduced.current = !!mq?.matches
    const onMq = (e) => { reduced.current = e.matches }
    mq?.addEventListener?.('change', onMq)
    return () => {
      window.removeEventListener('touchstart', onTouch)
      mq?.removeEventListener?.('change', onMq)
    }
  }, [])

  useEffect(() => {
    const img = new Image()
    img.src = '/walker.png'
    img.decoding = 'async'
    imgRef.current = img
  }, [])

  // Bake the world once the section is in reach, and again whenever the theme
  // or Spidey mode changes — the map is painted from the same tokens as the
  // rest of the site, so it flips with it instead of staying stubbornly light.
  useEffect(() => {
    let cancelled = false
    let armed = false

    const bake = () => {
      if (cancelled) return
      const dark = document.documentElement.dataset.theme !== 'light'
      const pal = makePalette(dark, readAccent())
      palRef.current = pal
      bakedRef.current = bakeTerrain(pal)
      setReady(true)
    }

    // Deferred to idle so a 2500×1500 paint never lands inside the page's
    // first interaction window.
    const schedule = () => {
      if (armed) return
      armed = true
      if (window.requestIdleCallback) window.requestIdleCallback(bake, { timeout: 800 })
      else setTimeout(bake, 60)
    }

    const el = stageRef.current
    if (el && typeof IntersectionObserver !== 'undefined') {
      const io = new IntersectionObserver(
        ([e]) => {
          visible.current = e.isIntersecting
          if (e.isIntersecting) schedule()
        },
        { rootMargin: '400px' },
      )
      io.observe(el)
      // Re-bake on theme / Spidey changes, but only once we have baked at all.
      const mo = new MutationObserver(() => { if (armed) bake() })
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-spidey'] })
      return () => { cancelled = true; io.disconnect(); mo.disconnect() }
    }
    schedule()
    return () => { cancelled = true }
  }, [])

  // Weather, seeded once. Clouds wrap around the world; birds patrol the coast.
  useEffect(() => {
    const c = []
    for (let i = 0; i < 10; i++) {
      c.push({
        x: (i * 977) % WORLD.w,
        y: ((i * 613) % WORLD.h),
        r: 220 + ((i * 71) % 160),
        vx: 0.006 + (i % 3) * 0.002,
      })
    }
    clouds.current = c
    birds.current = [0, 1, 2, 3, 4].map((i) => ({
      x: 400 + i * 430,
      y: 200 + ((i * 271) % 900),
      vx: 0.03 + (i % 2) * 0.012,
      vy: (i % 2 ? 1 : -1) * 0.008,
      ph: i * 1.7,
    }))
  }, [])

  // Canvas backing store follows the stage, capped at 2× so a 4K monitor does
  // not quadruple the fill cost for no visible gain.
  useEffect(() => {
    const stage = stageRef.current
    const canvas = canvasRef.current
    if (!stage || !canvas) return
    const fit = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const w = stage.clientWidth
      const h = stage.clientHeight
      if (!w || !h) return
      sizeRef.current = { w, h, dpr }
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(stage)
    return () => ro.disconnect()
  }, [])

  /* ---------------- the loop ---------------- */

  useEffect(() => {
    let raf = 0
    let last = performance.now()
    let dustTimer = 0

    const frame = (now) => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min(34, now - last)
      last = now
      if (!visible.current && !full) return

      const stage = stageRef.current
      const canvas = canvasRef.current
      const baked = bakedRef.current
      const pal = palRef.current
      if (!stage || !canvas || !baked || !pal) return

      const { w: cssW, h: cssH, dpr } = sizeRef.current
      if (!cssW || !cssH) return

      /* ---- input & control ---- */

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
        phase.current = (phase.current + dt / WALK_CYCLE) % 1
      } else {
        phase.current = (phase.current + dt / 3600) % 1
      }

      const { x, y } = pos.current

      /* ---- camera ---- */

      // Frame-rate independent smoothing: an exponential approach, so the
      // camera lags the character just enough to feel like a camera.
      const zoom = clamp(Math.min(cssW / 880, cssH / 500), 0.78, 1.9)
      const viewW = cssW / zoom
      const viewH = cssH / zoom
      const k = reduced.current ? 1 : 1 - Math.exp(-dt / 90)
      cam.current.x += (x - cam.current.x) * k
      cam.current.y += (y - cam.current.y) * k
      const camX = clamp(cam.current.x - viewW / 2, 0, Math.max(0, WORLD.w - viewW))
      const camY = clamp(cam.current.y - viewH / 2, 0, Math.max(0, WORLD.h - viewH))
      const view = { x: camX, y: camY, w: viewW, h: viewH }

      /* ---- simulation ---- */

      if (!reduced.current) {
        for (const c of clouds.current) {
          c.x += c.vx * dt
          if (c.x - c.r > WORLD.w) c.x = -c.r
        }
        for (const b of birds.current) {
          b.x += b.vx * dt
          b.y += b.vy * dt
          if (b.x > WORLD.w + 40) b.x = -40
          if (b.y < 60 || b.y > WORLD.h - 60) b.vy *= -1
        }
        // Puff of dust off the back foot, twice per gait.
        dustTimer -= dt
        if (moving && dustTimer <= 0) {
          dustTimer = WALK_CYCLE / 2
          dust.current.push({
            x: x - face.current * 6 + (Math.random() - 0.5) * 6,
            y: y + 1,
            vx: -face.current * 0.012 + (Math.random() - 0.5) * 0.01,
            vy: -0.012 - Math.random() * 0.01,
            r: 3 + Math.random() * 3,
            t: 0,
            life: 420,
          })
        }
        for (let i = dust.current.length - 1; i >= 0; i--) {
          const d = dust.current[i]
          d.t += dt
          d.x += d.vx * dt
          d.y += d.vy * dt
          if (d.t >= d.life) dust.current.splice(i, 1)
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

      /* ---- render ---- */

      const ctx = canvas.getContext('2d')
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = pal.deep
      ctx.fillRect(0, 0, cssW, cssH)

      ctx.save()
      ctx.scale(zoom, zoom)
      ctx.translate(-camX, -camY)

      // Terrain: copy only the visible rectangle out of the baked world.
      const sx = clamp(camX, 0, WORLD.w)
      const sy = clamp(camY, 0, WORLD.h)
      const sw = Math.min(viewW, WORLD.w - sx)
      const sh = Math.min(viewH, WORLD.h - sy)
      if (sw > 0 && sh > 0) ctx.drawImage(baked.base, sx, sy, sw, sh, sx, sy, sw, sh)

      drawSparkles(ctx, sparkles, view, pal, now)
      drawClouds(ctx, clouds.current, view, pal)

      for (const p of PLACES) {
        if (p.x < camX - 140 || p.x > camX + viewW + 140) continue
        if (p.y < camY - 140 || p.y > camY + viewH + 140) continue
        drawMarkerPad(ctx, p, { found: seen.current.has(p.id), near: nearRef.current === p.id }, pal, now)
      }

      // Depth sorting: props, markers and the character all go into one list
      // ordered by ground y, so the walker passes behind a tree that is south
      // of it and in front of one that is north.
      const list = []
      const top = camY - 220
      const bottom = camY + viewH + 120
      for (let i = propIndexAtY(top); i < PROPS.length; i++) {
        const p = PROPS[i]
        if (p.y > bottom) break
        if (p.x < camX - 120 || p.x > camX + viewW + 120) continue
        list.push(p)
      }
      const marks = []
      for (const p of PLACES) {
        if (p.y < top || p.y > bottom) continue
        if (p.x < camX - 160 || p.x > camX + viewW + 160) continue
        marks.push({ x: p.x, y: p.y, type: '@marker', place: p })
        list.push(marks[marks.length - 1])
      }
      const me = { x, y, type: '@walker' }
      list.push(me)
      list.sort((a, b) => a.y - b.y)

      const t = reduced.current ? 0 : now
      for (const item of list) {
        if (item.type === '@walker') {
          drawWalker(ctx, {
            x, y, face: face.current, phase: phase.current, moving, img: imgRef.current,
          }, pal)
        } else if (item.type === '@marker') {
          const p = item.place
          drawMarkerPin(ctx, p, { found: seen.current.has(p.id), near: nearRef.current === p.id }, pal, t)
        } else {
          drawProp(ctx, item, pal, t)
        }
      }

      drawDust(ctx, dust.current, pal)
      drawBirds(ctx, birds.current, view, pal, t)
      ctx.restore()

      /* ---- screen space: labels, compass, vignette ---- */

      const px = (wx) => (wx - camX) * zoom
      const py = (wy) => (wy - camY) * zoom

      ctx.save()
      ctx.font = '600 12.5px Inter, system-ui, -apple-system, sans-serif'
      ctx.textBaseline = 'middle'
      for (const p of PLACES) {
        const lx = px(p.x)
        const ly = py(p.y) - 68 * zoom
        if (lx < -140 || lx > cssW + 140 || ly < -40 || ly > cssH + 40) continue
        const isFound = seen.current.has(p.id)
        const isNear = nearRef.current === p.id
        const label = `${p.chapter} · ${p.short}`
        const w = ctx.measureText(label).width + 22
        const h = 24
        ctx.globalAlpha = isNear ? 1 : isFound ? 0.94 : 0.8
        ctx.fillStyle = isNear ? pal.accent : pal.labelBg
        roundPath(ctx, lx - w / 2, ly - h / 2, w, h, 12)
        ctx.fill()
        ctx.strokeStyle = isNear ? pal.accent : pal.labelEdge
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.fillStyle = isNear ? '#ffffff' : pal.label
        ctx.textAlign = 'center'
        ctx.fillText(label, lx, ly + 0.5)
      }
      ctx.restore()

      // Compass to the next undiscovered chapter, in story order — so wandering
      // the map never means missing one. Hidden once its marker is on screen.
      const nextPlace = openRef.current ? null : PLACES.find((p) => !seen.current.has(p.id))
      if (nextPlace) {
        const cx = cssW / 2
        const cy = cssH / 2
        const ax = px(nextPlace.x) - cx
        const ay = py(nextPlace.y) - cy
        // Push the heading out to whichever edge of the stage it crosses first.
        // s >= 1 means the marker is already inside the frame — nothing to
        // point at, so the compass stays off.
        const margin = 44
        const halfW = Math.max(1, cssW / 2 - margin)
        const halfH = Math.max(1, cssH / 2 - margin)
        const s = Math.min(ax !== 0 ? halfW / Math.abs(ax) : Infinity, ay !== 0 ? halfH / Math.abs(ay) : Infinity)
        if (Number.isFinite(s) && s < 1) {
          const nudge = reduced.current ? 0 : Math.sin(now * 0.005) * 3
          ctx.save()
          ctx.translate(cx + ax * s, cy + ay * s)
          ctx.rotate(Math.atan2(ay, ax))
          ctx.translate(nudge, 0)
          ctx.fillStyle = pal.accent
          ctx.beginPath()
          ctx.arc(0, 0, 19, 0, Math.PI * 2)
          ctx.fill()
          ctx.strokeStyle = '#ffffff'
          ctx.lineWidth = 2.6
          ctx.lineCap = 'round'
          ctx.lineJoin = 'round'
          ctx.beginPath()
          ctx.moveTo(-7, 0)
          ctx.lineTo(6, 0)
          ctx.moveTo(1, -5)
          ctx.lineTo(6, 0)
          ctx.lineTo(1, 5)
          ctx.stroke()
          ctx.restore()
        }
      }

      // Vignette last: a soft darkening at the edges that pulls the eye to the
      // middle of the frame, where the character is.
      const vg = ctx.createRadialGradient(
        cssW / 2, cssH / 2, Math.min(cssW, cssH) * 0.34,
        cssW / 2, cssH / 2, Math.max(cssW, cssH) * 0.78,
      )
      vg.addColorStop(0, 'rgba(0,0,0,0)')
      vg.addColorStop(1, pal.vignette)
      ctx.fillStyle = vg
      ctx.fillRect(0, 0, cssW, cssH)

      /* ---- minimap ---- */
      drawMinimap(miniRef.current, baked.low, pal, pos.current, view, seen.current)
    }

    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [full])

  /* ---------------- input handlers ---------------- */

  const onKeyDown = (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return
    if (e.key === 'Escape') {
      if (open) setOpen(null)
      else if (full) toggleFull()
      else stageRef.current?.blur()
      return
    }
    if (e.key === 'f' || e.key === 'F') {
      e.preventDefault()
      toggleFull()
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
      lead="Four cities, multiple experiences, one very long flight — walk it yourself."
      className="journey"
    >
      <div
        className={`journey-frame ${full ? 'is-full' : ''} ${faux ? 'is-faux-full' : ''}`}
        ref={frameRef}
      >
        <div className="journey-hud">
          <div className="journey-hud-group">
            <span className="journey-badge">
              <span className="journey-badge-dot" />
              Chapter map
            </span>
            <div className="journey-progress">
              <span className="journey-progress-track">
                <span className="journey-progress-fill" style={{ width: `${pct}%` }} />
              </span>
              <span className="journey-progress-text">
                <strong>{found.size}</strong>/{PLACES.length}
              </span>
            </div>
          </div>

          <div className="journey-hud-group">
            <p className="journey-help">
              <kbd>WASD</kbd> move · <kbd>E</kbd> read · <kbd>F</kbd> fullscreen
            </p>
            <button
              type="button"
              className="journey-icon-btn"
              onClick={toggleFull}
              aria-pressed={full}
              title={full ? 'Exit fullscreen (F)' : 'Play fullscreen (F)'}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {full
                  ? <path d="M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6" />
                  : <path d="M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6" />}
              </svg>
              <span className="sr-only">{full ? 'Exit fullscreen' : 'Play fullscreen'}</span>
            </button>
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
          onPointerDown={() => stageRef.current?.focus({ preventScroll: true })}
        >
          <canvas className="journey-canvas" ref={canvasRef} aria-hidden="true" />

          {!ready && (
            <div className="journey-boot" aria-hidden="true">
              <span className="journey-boot-spin" />
              Building the world…
            </div>
          )}

          {/* The whole island at a glance — a 2500×1500 world seen one screen at
              a time is easy to get lost in. Painted from the same thumbnail the
              terrain bake produced, so it is the actual map, not a schematic. */}
          <canvas className="journey-minimap" ref={miniRef} aria-hidden="true" />

          {/* Take-control veil. Focus is the switch, so the page never loses its
              own arrow-key scrolling to a map the visitor is not playing. */}
          {!active && ready && (
            <div className="journey-veil">
              <span className="journey-veil-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 11h4M8 9v4M15.5 12h.01M18 10h.01" />
                  <rect x="2" y="6" width="20" height="12" rx="5" />
                </svg>
                {touch ? 'Tap to play' : 'Click to play'}
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
              <span><kbd>E</kbd></span>
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
              <p className="journey-card-meta">{openPlaceData.period} · {openPlaceData.place}</p>
              {/* The crossing is the one chapter whose subject is a distance,
                  so it gets the real world instead of another bullet list. */}
              {openPlaceData.kind === 'travel' && <CrossingMap />}
              <ul>
                {openPlaceData.notes.map((n) => <li key={n}>{n}</li>)}
              </ul>
              {openPlaceData.cta && (
                <Link className="btn btn--primary journey-card-cta" to="/contact" onClick={() => full && toggleFull()}>
                  Get in touch
                </Link>
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

          {touch && (
            <button
              type="button"
              className="journey-action"
              aria-label={open ? 'Close chapter' : 'Read chapter'}
              onPointerDown={(e) => {
                e.preventDefault()
                if (open) setOpen(null)
                else if (nearRef.current) openPlace(nearRef.current)
              }}
              hidden={!near && !open}
            >
              {open ? '✕' : 'Read'}
            </button>
          )}
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
                <em>{p.role} · {p.period}</em>
              </span>
              <span className="journey-legend-place">{p.city}</span>
            </button>
          </li>
        ))}
      </ol>
    </Section>
  )
}

/* ------------------------------------------------------------------ */

function roundPath(ctx, x, y, w, h, r) {
  const k = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + k, y)
  ctx.arcTo(x + w, y, x + w, y + h, k)
  ctx.arcTo(x + w, y + h, x, y + h, k)
  ctx.arcTo(x, y + h, x, y, k)
  ctx.arcTo(x, y, x + w, y, k)
  ctx.closePath()
}

// The minimap is the terrain thumbnail the bake already produced, plus the four
// things worth knowing: where the chapters are, which ones you have, where you
// are, and how much of the world the screen is currently showing.
function drawMinimap(canvas, low, pal, me, view, seenSet) {
  if (!canvas) return
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  const w = canvas.clientWidth
  const h = canvas.clientHeight
  if (!w || !h) return
  if (canvas.width !== Math.round(w * dpr)) {
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
  }
  const ctx = canvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)
  ctx.imageSmoothingEnabled = true
  ctx.drawImage(low, 0, 0, w, h)

  const sx = w / WORLD.w
  const sy = h / WORLD.h

  ctx.save()
  ctx.strokeStyle = tint(pal.accent, 0.55)
  ctx.lineWidth = 1.4
  ctx.setLineDash([3, 3])
  ctx.beginPath()
  PLACES.forEach((p, i) => {
    const x = p.x * sx
    const y = p.y * sy
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
  })
  ctx.stroke()
  ctx.restore()

  for (const p of PLACES) {
    ctx.fillStyle = seenSet.has(p.id) ? pal.accent : 'rgba(255,255,255,0.55)'
    ctx.beginPath()
    ctx.arc(p.x * sx, p.y * sy, 2.6, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.strokeStyle = 'rgba(255,255,255,0.8)'
  ctx.lineWidth = 1
  ctx.strokeRect(view.x * sx, view.y * sy, view.w * sx, view.h * sy)

  ctx.fillStyle = '#ffffff'
  ctx.strokeStyle = pal.accent
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(me.x * sx, me.y * sy, 3.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
}
