import { useEffect, useRef, useState } from 'react'
import { profile } from '../data/portfolio.js'
import SaiAvatar from './SaiAvatar.jsx'

const FIRST_NAME = profile.name.split(' ')[0]
const GREETING = `Hey, I'm ${FIRST_NAME} — welcome! 👋`
const CHARS = Array.from(GREETING) // code-point safe (keeps the emoji intact)

const APPEAR_DELAY = 1800 // ms after load before the avatar slides in
const LINGER = 7000 // ms the finished greeting stays before auto-dismissing

// A friendly 2D avatar of Sai that waves in from the bottom-right a beat after
// the page loads and types out a greeting, then bows out on its own. Sits
// opposite the chatbot (bottom-left) and dismisses on scroll so it never
// collides with the back-to-top button. Shows every visit; fully dismissible.
export default function Greeter() {
  const [phase, setPhase] = useState('hidden') // hidden → in → out
  const [typed, setTyped] = useState('')
  const timers = useRef([])
  const reduced = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  const dismiss = () => setPhase((p) => (p === 'in' ? 'out' : p))

  useEffect(() => {
    const t = timers.current
    const push = (fn, ms) => t.push(setTimeout(fn, ms))

    push(() => {
      setPhase('in')

      if (reduced.current) {
        setTyped(GREETING)
        push(dismiss, LINGER)
        return
      }

      let i = 0
      const type = () => {
        i += 1
        setTyped(CHARS.slice(0, i).join(''))
        if (i < CHARS.length) push(type, 45)
        else push(dismiss, LINGER)
      }
      push(type, 350)
    }, APPEAR_DELAY)

    const onScroll = () => {
      if (window.scrollY > 120) dismiss()
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      t.forEach(clearTimeout)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  // Unmount a beat after the exit animation starts.
  useEffect(() => {
    if (phase !== 'out') return
    const t = setTimeout(() => setPhase('hidden'), 420)
    return () => clearTimeout(t)
  }, [phase])

  if (phase === 'hidden') return null

  return (
    <div className={`greeter greeter--${phase}`} role="status" aria-live="polite">
      <div className="greeter-bubble">
        <span className="greeter-typed">{typed || ' '}</span>
        <button
          className="greeter-close"
          aria-label="Dismiss greeting"
          title="Dismiss"
          onClick={dismiss}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M3 3l6 6M9 3l-6 6" />
          </svg>
        </button>
      </div>

      <div className="greeter-avatar">
        <SaiAvatar className="greeter-avatar-svg" />
        <span className="greeter-wave" aria-hidden="true">👋</span>
      </div>
    </div>
  )
}
