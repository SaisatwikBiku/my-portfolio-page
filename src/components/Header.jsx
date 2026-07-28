import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { profile, navLinks, site } from '../data/portfolio.js'
import ThemeToggle from './ThemeToggle.jsx'
import SpideyToggle from './SpideyToggle.jsx'

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    // Trips just before the in-page sub-nav sticks (it pins at the compact
    // header height), so the two meet flush with no gap in between.
    const onScroll = () => setScrolled(window.scrollY > 10)
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
      <Link to="/" className="logo" onClick={close}>
        {site.domain}
      </Link>

      <nav className={`navbar ${open ? 'navbar--open' : ''}`} data-tour="nav">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            onClick={close}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            {link.label}
          </NavLink>
        ))}
        <a className="navbar-cta" data-tour="resume" href={profile.resume} target="_blank" rel="noreferrer" onClick={close}>
          Resume
        </a>
      </nav>

      <div className="header-tools">
        <SpideyToggle />
        <ThemeToggle />
        <button
          className={`hamburger ${open ? 'active' : ''}`}
          data-tour="menu"
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
