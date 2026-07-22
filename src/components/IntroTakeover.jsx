import { useEffect, useRef, useState } from 'react'
import { profile } from '../data/portfolio.js'

// What the avatar promises visitors — mirrors the site's sections.
const OVERVIEW = [
  { icon: '🧑‍💻', label: 'Who I am' },
  { icon: '🛠️', label: 'Skills & tooling' },
  { icon: '🚀', label: "Projects I've built" },
  { icon: '💼', label: 'Experience' },
  { icon: '✉️', label: 'Say hello' },
]

// The three ways to experience the site. Each card previews its palette and,
// when picked, sets that mode before entering.
const MODES = [
  { id: 'dark', emoji: '🌙', title: 'Dark', sub: 'Sleek & focused', bg: '#0a0f1e', bar: 'rgba(255,255,255,0.22)', accents: ['#2492ff'] },
  { id: 'light', emoji: '☀️', title: 'Light', sub: 'Clean & bright', bg: '#eef3fb', bar: 'rgba(15,23,38,0.16)', accents: ['#007bff'] },
  { id: 'spidey', emoji: '🕷️', title: 'Spidey', sub: 'Red-and-blue twist', bg: '#0a0f1e', bar: 'rgba(255,255,255,0.2)', accents: ['#ff3b4e', '#4f9bff'] },
]

// Connection-dot network coordinates (1000×1000 space, kept to the edges).
const NODES = [
  [120, 170], [300, 110], [250, 330], [150, 520],
  [830, 150], [910, 350], [770, 300], [870, 610],
]
const LINKS = [[0, 1], [1, 2], [2, 3], [0, 2], [4, 6], [6, 5], [5, 7], [4, 5]]

// Apply a mode (theme + spidey overlay) and persist it, then tell the header
// toggles to re-sync from the DOM.
function applyMode(id) {
  const root = document.documentElement
  const theme = id === 'light' ? 'light' : 'dark'
  const spidey = id === 'spidey'
  root.dataset.theme = theme
  root.dataset.spidey = spidey ? 'on' : 'off'
  try {
    localStorage.setItem('theme', theme)
    localStorage.setItem('spidey', spidey ? 'on' : 'off')
  } catch {
    /* private browsing — choice just won't persist */
  }
  window.dispatchEvent(new Event('theme:sync'))
}

// Full-screen illustrated welcome shown on load. Step 1 introduces Sai; the
// first scroll advances to step 2 (same background) inviting visitors to pick
// one of three modes to explore in. Scroll again — or click a mode / Skip — to
// enter the site. Body scroll is locked while it's up.
export default function IntroTakeover() {
  const [active, setActive] = useState(true)
  const [step, setStep] = useState('welcome') // welcome → modes
  const [leaving, setLeaving] = useState(false)
  const stepRef = useRef('welcome')
  const busy = useRef(false) // brief cooldown so one gesture can't skip a step
  const exited = useRef(false)
  const contentRef = useRef(null)

  const exit = () => {
    if (exited.current) return
    exited.current = true
    setLeaving(true)
    setTimeout(() => {
      setActive(false) // unmount → effect cleanup restores body overflow
      // Land on the hero (top). The scroll gesture that dismissed the intro can
      // still have momentum when the page unlocks — block scrolling briefly so
      // it doesn't carry the page down into the About section.
      const toTop = () => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      const block = (e) => e.preventDefault()
      toTop()
      window.addEventListener('wheel', block, { passive: false })
      window.addEventListener('touchmove', block, { passive: false })
      setTimeout(() => {
        window.removeEventListener('wheel', block)
        window.removeEventListener('touchmove', block)
        toTop()
      }, 500)
    }, 700)
  }

  // Route a scroll/key/touch gesture: welcome → modes, then modes → enter.
  const advance = () => {
    if (busy.current || exited.current) return
    if (stepRef.current === 'welcome') {
      busy.current = true
      stepRef.current = 'modes'
      setStep('modes')
      setTimeout(() => { busy.current = false }, 900)
    } else {
      exit()
    }
  }

  const chooseMode = (id) => {
    applyMode(id)
    exit()
  }

  useEffect(() => {
    window.scrollTo(0, 0)
    // Lock the page firmly. overflow:hidden on <body> alone is unreliable (the
    // real scroller is <html>), so lock both AND preventDefault on the gestures
    // we read — otherwise the dismiss scroll scrolls the page beneath the fixed
    // overlay and it's revealed parked on a lower section instead of the hero.
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    const onWheel = (e) => {
      e.preventDefault()
      if (Math.abs(e.deltaY) > 4) advance()
    }
    const onTouch = (e) => {
      e.preventDefault()
      advance()
    }
    const onKey = (e) => {
      if (['ArrowDown', 'PageDown', 'End', ' ', 'Spacebar', 'Enter'].includes(e.key)) {
        e.preventDefault()
        advance()
      }
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchmove', onTouch, { passive: false })
    window.addEventListener('keydown', onKey)

    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchmove', onTouch)
      window.removeEventListener('keydown', onKey)
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [])

  // Move focus into each step for keyboard users.
  useEffect(() => {
    contentRef.current?.querySelector('button')?.focus()
  }, [step])

  if (!active) return null

  return (
    <div className={`intro ${leaving ? 'intro--leaving' : ''}`} role="dialog" aria-label="Welcome — intro">
      <div className="intro-scene" aria-hidden="true">
        <span className="intro-blob intro-blob--green" />
        <span className="intro-blob intro-blob--gold" />
        <span className="intro-blob intro-blob--blue" />

        <svg className="intro-net" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
          {LINKS.map(([a, b], i) => (
            <line key={i} x1={NODES[a][0]} y1={NODES[a][1]} x2={NODES[b][0]} y2={NODES[b][1]} />
          ))}
          {NODES.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="6" />
          ))}
        </svg>

        <svg className="intro-skyline" viewBox="0 0 1200 200" preserveAspectRatio="xMidYMax slice">
          <path d="M0 200 V120 H60 V90 H110 V140 H160 V70 H210 V110 H250 V150 H300 V50 H340 V95 H390 V130 H440 V80 H500 V120 H540 V40 H580 V100 H630 V150 H690 V85 H740 V125 H790 V60 H840 V110 H890 V145 H950 V75 H1000 V120 H1050 V95 H1110 V135 H1160 V100 H1200 V200 Z" />
        </svg>

        <span className="intro-ic intro-ic--code">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 8l-4 4 4 4M15 8l4 4-4 4" /></svg>
        </span>
        <span className="intro-ic intro-ic--bulb">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.6.6 1 1.3 1 2.1V16h6v-.4c0-.8.4-1.5 1-2.1A6 6 0 0 0 12 3z" /></svg>
        </span>
        <span className="intro-ic intro-ic--mail">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
        </span>
      </div>

      <button className="intro-skip" onClick={exit}>Skip intro</button>

      <div className="intro-content" key={step} ref={contentRef}>
        {step === 'welcome' ? (
          <>
            <figure className="intro-portrait">
              <img src="/avatar-illustration.jpg" width="787" height="900" alt={`Illustrated portrait of ${profile.name}`} />
            </figure>

            <div className="intro-copy">
              <p className="intro-hi">Hey there, I'm</p>
              <h1 className="intro-name">{profile.name}</h1>
              <p className="intro-role">{profile.role} · full-stack &amp; ML / computer vision</p>
              <p className="intro-lead">Welcome to my corner of the web — here's what you'll find:</p>

              <ul className="intro-chips">
                {OVERVIEW.map((o, i) => (
                  <li key={o.label} style={{ '--d': `${0.7 + i * 0.1}s` }}>
                    <span aria-hidden="true">{o.icon}</span> {o.label}
                  </li>
                ))}
              </ul>

              <button className="intro-enter" onClick={advance}>
                <span className="intro-mouse" aria-hidden="true"><span /></span>
                Scroll to continue
              </button>
            </div>
          </>
        ) : (
          <div className="intro-modes-wrap">
            <p className="intro-hi">Before you dive in</p>
            <h1 className="intro-name intro-name--sm">Experience it in three modes</h1>
            <p className="intro-lead">Pick how you'd like to explore — you can switch anytime from the header.</p>

            <div className="intro-modes">
              {MODES.map((m, i) => (
                <button
                  key={m.id}
                  className="intro-mode"
                  style={{ '--d': `${0.25 + i * 0.12}s` }}
                  onClick={() => chooseMode(m.id)}
                >
                  <span className="intro-mode-prev" style={{ background: m.bg }}>
                    <i className="intro-mode-bar" style={{ background: m.bar }} />
                    <span className="intro-mode-dots">
                      {m.accents.map((a, idx) => (
                        <i key={idx} style={{ background: a }} />
                      ))}
                    </span>
                  </span>
                  <span className="intro-mode-label">
                    <span aria-hidden="true">{m.emoji}</span> {m.title}
                  </span>
                  <span className="intro-mode-sub">{m.sub}</span>
                </button>
              ))}
            </div>

            <button className="intro-enter" onClick={advance}>
              <span className="intro-mouse" aria-hidden="true"><span /></span>
              Scroll to enter
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
