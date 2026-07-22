import { useEffect, useState } from 'react'

// Sun/moon button that flips the data-theme attribute on <html> and persists
// the choice. The inline script in index.html applies the saved theme before
// first paint, so this component just mirrors and updates it.
export default function ThemeToggle() {
  const [theme, setTheme] = useState(() =>
    document.documentElement.dataset.theme === 'light' ? 'light' : 'dark',
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('theme', theme)
    } catch {
      /* private browsing — theme just won't persist */
    }
  }, [theme])

  // Re-sync if something else changes the theme (e.g. the intro mode picker).
  useEffect(() => {
    const sync = () =>
      setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark')
    window.addEventListener('theme:sync', sync)
    return () => window.removeEventListener('theme:sync', sync)
  }, [])

  const next = theme === 'dark' ? 'light' : 'dark'

  return (
    <button
      className="theme-toggle"
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      onClick={() => setTheme(next)}
    >
      {theme === 'dark' ? (
        // Sun — clicking switches to light.
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        // Moon — clicking switches to dark.
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  )
}
