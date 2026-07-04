import { profile, socials, navLinks, site } from '../data/portfolio.js'

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
              <img src={s.icon} alt={s.name} />
            </a>
          ))}
        </div>
      </div>
      <p className="footer-copy">
        © {new Date().getFullYear()} {profile.name} ·{' '}
        <a href={site.url}>{site.domain}</a> · Built with React &amp; Vite.
      </p>
    </footer>
  )
}
