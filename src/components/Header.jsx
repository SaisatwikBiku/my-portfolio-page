import { useEffect, useState } from 'react'
import { profile, navLinks, site } from '../data/portfolio.js'
import { useScrollSpy } from '../hooks/useScrollSpy.js'
import ThemeToggle from './ThemeToggle.jsx'

const sectionIds = navLinks.map((link) => link.href.slice(1))

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const active = useScrollSpy(sectionIds)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <a href="#home" className="logo" onClick={close}>
        {site.domain}
      </a>

      <nav className={`navbar ${open ? 'navbar--open' : ''}`}>
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={close}
            className={active === link.href.slice(1) ? 'active' : ''}
          >
            {link.label}
          </a>
        ))}
        <a className="navbar-cta" href={profile.resume} target="_blank" rel="noreferrer" onClick={close}>
          Resume
        </a>
      </nav>

      <div className="header-tools">
        <ThemeToggle />
        <button
          className={`hamburger ${open ? 'active' : ''}`}
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  )
}
