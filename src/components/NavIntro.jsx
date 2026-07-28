import { useCallback, useEffect, useRef, useState } from 'react'

// One-time flag. Bump the suffix if the tour's steps change enough that
// returning visitors should be shown it again.
const SEEN_KEY = 'navTourSeen.v1'

// Each step spotlights a real header control. `targets` is tried in order and
// the first one actually on screen wins — that's how the same step covers both
// the desktop nav bar and the mobile hamburger, and how desktop-only controls
// (Resume lives inside the off-canvas drawer on phones) drop out on their own.
const STEPS = [
  {
    id: 'pages',
    title: 'Five pages, five chapters',
    targets: [
      {
        sel: '[data-tour="nav"]',
        body: 'Home, About, Work, Journey and Contact — this bar rides along at the top of all five.',
      },
      {
        sel: '[data-tour="menu"]',
        body: "Home, About, Work, Journey and Contact — tap here for the menu, it's at the top of all five.",
      },
    ],
  },
  {
    id: 'resume',
    title: 'Resume, one tap away',
    targets: [
      {
        sel: '[data-tour="resume"]',
        body: 'Opens the full PDF in a new tab, so you never lose your place here.',
      },
    ],
  },
  {
    id: 'spidey',
    title: 'Spidey mode',
    targets: [
      {
        sel: '[data-tour="spidey"]',
        body: 'Repaints the whole site in red and blue. It is the single most important button on this page.',
      },
    ],
  },
  {
    id: 'theme',
    title: 'Light or dark',
    targets: [
      {
        sel: '[data-tour="theme"]',
        body: 'Whatever you picked in the intro sticks, and this flips it any time you change your mind.',
      },
    ],
  },
]

const PAD = 8 // breathing room between the spotlight ring and the control

function onScreen(el) {
  if (!el) return false
  const cs = getComputedStyle(el)
  if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) < 0.05) return false
  const r = el.getBoundingClientRect()
  if (r.width < 4 || r.height < 4) return false
  // The mobile drawer is a fixed element parked off the right edge.
  return r.right > 0 && r.left < window.innerWidth && r.bottom > 0
}

// First on-screen target for a step, or null if the step doesn't apply here.
function resolve(step) {
  for (const t of step.targets) {
    const el = document.querySelector(t.sel)
    if (onScreen(el)) return { ...t, el }
  }
  return null
}

// First-visit coach marks over the real header: a dimmed page with a hole cut
// around one control at a time, plus a tooltip explaining it. Waits for the
// intro takeover to finish so the two never overlap, and remembers that it has
// run. Click anywhere, press Enter/→, or use the buttons to advance.
export default function NavIntro() {
  const [running, setRunning] = useState(false)
  const [i, setI] = useState(0)
  const [pos, setPos] = useState(null)
  const done = useRef(false)
  const tipRef = useRef(null)

  const finish = useCallback(() => {
    if (done.current) return
    done.current = true
    setRunning(false)
    try {
      localStorage.setItem(SEEN_KEY, '1')
    } catch {
      /* private browsing — the tour will just show again next time */
    }
  }, [])

  // Kick off once the intro takeover has left the screen. If the takeover isn't
  // mounted at all, start on our own short delay instead.
  useEffect(() => {
    let seen = false
    try {
      seen = localStorage.getItem(SEEN_KEY) === '1'
    } catch {
      /* no storage — treat as a first visit */
    }
    if (seen) return

    let timer
    let tries = 0
    // Don't spotlight a header that isn't measurable yet — a backgrounded tab
    // reports a zero-size viewport, and a slow first paint can leave the
    // controls momentarily unresolvable. Look again a few times before giving
    // up; giving up leaves the flag unset, so the next visit gets another go.
    const attempt = () => {
      if (window.innerWidth > 0 && STEPS.some(resolve)) setRunning(true)
      else if (++tries < 12) timer = setTimeout(attempt, 400)
    }
    const start = () => {
      timer = setTimeout(attempt, 500)
    }

    if (document.querySelector('.intro')) {
      window.addEventListener('intro:done', start, { once: true })
    } else {
      start()
    }
    return () => {
      clearTimeout(timer)
      window.removeEventListener('intro:done', start)
    }
  }, [])

  // Land on the first step that has something to point at.
  useEffect(() => {
    if (!running) return
    const first = STEPS.findIndex(resolve)
    if (first === -1) finish()
    else setI(first)
  }, [running, finish])

  const go = useCallback(
    (dir) => {
      for (let n = i + dir; n >= 0 && n < STEPS.length; n += dir) {
        if (resolve(STEPS[n])) {
          setI(n)
          return
        }
      }
      if (dir > 0) finish()
    },
    [i, finish],
  )

  // Measure the current target and park the ring + tooltip on it. Re-runs on
  // resize because the nav collapses into the hamburger at 900px.
  useEffect(() => {
    if (!running) return

    const measure = () => {
      const target = resolve(STEPS[i])
      if (!target) {
        // The control this step described just went away (a resize across the
        // breakpoint, usually). Move on rather than pointing at nothing.
        go(1)
        return
      }
      const r = target.el.getBoundingClientRect()
      const vw = window.innerWidth
      const tipW = Math.min(340, vw - 24)
      const centre = r.left + r.width / 2
      const left = Math.min(Math.max(12, centre - tipW / 2), Math.max(12, vw - tipW - 12))
      setPos({
        top: r.top - PAD,
        left: r.left - PAD,
        width: r.width + PAD * 2,
        height: r.height + PAD * 2,
        tipTop: r.top - PAD + r.height + PAD * 2 + 14,
        tipLeft: left,
        tipW,
        // Arrow sits under the control's centre, but never past the tooltip's
        // own rounded corners.
        arrow: Math.min(Math.max(centre - left, 22), tipW - 22),
      })
    }

    measure()
    window.addEventListener('resize', measure)
    // The header shrinks when the page is scrolled, which moves every target.
    window.addEventListener('scroll', measure, { passive: true })
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure)
    }
  }, [running, i, go])

  // Keyboard: advance, go back, or bail out.
  useEffect(() => {
    if (!running) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        finish()
      } else if (['Enter', ' ', 'ArrowRight', 'ArrowDown'].includes(e.key)) {
        e.preventDefault()
        go(1)
      } else if (['ArrowLeft', 'ArrowUp'].includes(e.key)) {
        e.preventDefault()
        go(-1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [running, go, finish])

  // Pull focus into the tooltip so screen readers and keyboards follow along.
  useEffect(() => {
    if (running) tipRef.current?.focus()
  }, [running, i])

  if (!running || !pos) return null

  const target = resolve(STEPS[i])
  if (!target) return null

  const step = STEPS[i]
  const shown = STEPS.filter(resolve)
  const at = shown.indexOf(step)
  const last = at === shown.length - 1

  return (
    <div className="tour">
      {/* Swallows every click on the page beneath, and doubles as "next". */}
      <button className="tour-catch" aria-hidden="true" tabIndex={-1} onClick={() => go(1)} />

      <span className="tour-ring" style={{ top: pos.top, left: pos.left, width: pos.width, height: pos.height }} />

      <div
        className="tour-tip"
        style={{ top: pos.tipTop, left: pos.tipLeft, width: pos.tipW, '--arrow': `${pos.arrow}px` }}
        role="dialog"
        aria-modal="true"
        aria-label={`Site tour, step ${at + 1} of ${shown.length}`}
        ref={tipRef}
        tabIndex={-1}
      >
        <p className="tour-tip-title">{step.title}</p>
        <p className="tour-tip-body">{target.body}</p>

        <div className="tour-tip-foot">
          <span className="tour-dots" aria-hidden="true">
            {shown.map((s, n) => (
              <i key={s.id} className={n === at ? 'is-on' : ''} />
            ))}
          </span>
          <span className="tour-actions">
            <button className="tour-btn" onClick={finish}>
              {last ? 'Close' : 'Skip'}
            </button>
            {!last && (
              <button className="tour-btn tour-btn--go" onClick={() => go(1)}>
                Next
              </button>
            )}
          </span>
        </div>
      </div>
    </div>
  )
}
