import { profile, socials, navLinks, site } from '../data/portfolio.js'

// Inline single-path brand glyphs, keyed by social name. Devicon's colored
// SVGs can't be safely whitened for the dark footer — e.g. linkedin-original
// paints the "in" as solid white over a blue square, so filtering to monochrome
// collapses it into a blank square. These currentColor glyphs render crisply.
const BRAND_GLYPHS = {
  LinkedIn:
    'M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.07 2.07 0 11 0-4.14 2.07 2.07 0 01 0 4.14zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.8 0 0 .78 0 1.75v20.5C0 23.2.8 24 1.77 24h20.45c.98 0 1.78-.8 1.78-1.75V1.75C24 .78 23.2 0 22.22 0z',
  GitHub:
    'M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.21.7.82.58A12 12 0 0024 12.5C24 5.87 18.63.5 12 .5z',
}

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <a href="#home" className="logo">{site.domain}</a>
          <p>{profile.name} · {profile.role}</p>
        </div>
        <nav className="footer-nav">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href}>{link.label}</a>
          ))}
        </nav>
        <div className="footer-socials">
          {socials.map((s) => (
            <a key={s.name} href={s.href} target="_blank" rel="noreferrer" aria-label={s.name}>
              {BRAND_GLYPHS[s.name] ? (
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d={BRAND_GLYPHS[s.name]} />
                </svg>
              ) : (
                <img src={s.icon} alt={s.name} />
              )}
            </a>
          ))}
        </div>
      </div>
      <p className="footer-copy">
        © {new Date().getFullYear()} {profile.name} ·{' '}
        <a href={site.url}>{site.domain}</a> · Built with React &amp; Vite · Spidy keeps watch{' '}
        <button
          type="button"
          className="footer-spider"
          aria-label="Say hi to Spidy"
          title="Say hi to Spidy"
          onClick={() => window.dispatchEvent(new Event('spidey:egg'))}
        >
          🕷️
        </button>
      </p>
    </footer>
  )
}
