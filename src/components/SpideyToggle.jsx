import { useEffect, useState } from 'react'

// Opt-in Spider-Man accent mode. Flips data-spidey on <html> (an overlay on top
// of light/dark) and persists it. The inline script in index.html applies the
// saved value before first paint so accents don't flash. Sits next to the
// light/dark toggle in the header. Switching it *on* fires a welcome toast.
export default function SpideyToggle() {
  const [on, setOn] = useState(
    () => document.documentElement.dataset.spidey === 'on',
  )
  // Bumped each time Spidey mode is switched on; also used as the toast's React
  // key so a repeat activation remounts it and restarts the fade animation.
  // 0 means no toast is showing.
  const [welcomeKey, setWelcomeKey] = useState(0)

  useEffect(() => {
    document.documentElement.dataset.spidey = on ? 'on' : 'off'
    try {
      localStorage.setItem('spidey', on ? 'on' : 'off')
    } catch {
      /* private browsing — choice just won't persist */
    }
  }, [on])

  // Auto-dismiss the welcome toast a beat after it appears.
  useEffect(() => {
    if (!welcomeKey) return
    const t = setTimeout(() => setWelcomeKey(0), 3600)
    return () => clearTimeout(t)
  }, [welcomeKey])

  // Re-sync if something else changes the mode (e.g. the intro mode picker).
  useEffect(() => {
    const sync = () => setOn(document.documentElement.dataset.spidey === 'on')
    window.addEventListener('theme:sync', sync)
    return () => window.removeEventListener('theme:sync', sync)
  }, [])

  const toggle = () => {
    const next = !on
    setOn(next)
    setWelcomeKey((k) => (next ? k + 1 : 0))
  }

  const label = on ? 'Turn off Spidey mode' : 'Turn on Spidey mode'

  return (
    <>
      <button
        className={`theme-toggle spidey-toggle ${on ? 'is-on' : ''}`}
        aria-label={label}
        aria-pressed={on}
        title={label}
        onClick={toggle}
      >
        {/* Spider emblem */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <ellipse cx="12" cy="13" rx="2.6" ry="3.2" />
          <circle cx="12" cy="8.9" r="1.7" />
          <g stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none">
            <path d="M9.4 11.2 4.8 8.4" />
            <path d="M9.2 13 4 13" />
            <path d="M9.4 14.8 4.8 17.6" />
            <path d="M10 16.2 6.8 19.6" />
            <path d="M14.6 11.2 19.2 8.4" />
            <path d="M14.8 13 20 13" />
            <path d="M14.6 14.8 19.2 17.6" />
            <path d="M14 16.2 17.2 19.6" />
          </g>
        </svg>
      </button>

      {welcomeKey > 0 && (
        <div
          key={welcomeKey}
          className="spidey-toast spidey-toast--welcome"
          role="status"
          aria-live="polite"
        >
          <span aria-hidden="true">🕷️</span>
          <span>
            <strong>Spidey mode activated.</strong> Welcome to your friendly
            neighborhood theme.
          </span>
        </div>
      )}
    </>
  )
}
