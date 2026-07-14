import { lazy, Suspense, useEffect, useRef } from 'react'
import { profile, socials, heroBadges } from '../data/portfolio.js'
import { useTyped } from '../hooks/useTyped.js'

// Lazy-loaded so three.js lands in its own chunk after first paint — the hero
// is fully usable while the 3D backdrop streams in.
const Hero3D = lazy(() => import('./Hero3D.jsx'))

export default function Home() {
  const typed = useTyped(profile.typedRoles)
  const heroRef = useRef(null)
  const photoRef = useRef(null)

  // Subtle mouse parallax on the photo — desktop pointers only, and skipped
  // entirely for users who prefer reduced motion.
  useEffect(() => {
    const hero = heroRef.current
    const photo = photoRef.current
    if (!hero || !photo) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!window.matchMedia('(pointer: fine)').matches) return

    const onMove = (e) => {
      const rect = hero.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      photo.style.setProperty('--px', `${x * 18}px`)
      photo.style.setProperty('--py', `${y * 18}px`)
    }
    const onLeave = () => {
      photo.style.setProperty('--px', '0px')
      photo.style.setProperty('--py', '0px')
    }

    hero.addEventListener('mousemove', onMove)
    hero.addEventListener('mouseleave', onLeave)
    return () => {
      hero.removeEventListener('mousemove', onMove)
      hero.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <section className="home" id="home" ref={heroRef}>
      <Suspense fallback={null}>
        <Hero3D />
      </Suspense>
      <div className="home-content">
        <p className="home-greeting">Hello, it's me</p>
        <h1 className="home-name">{profile.name}</h1>
        <h2 className="home-role">
          {profile.role}, also a{' '}
          <span className="typing-wrap">
            <span className="typing-text">{typed}</span>
            <span className="caret">|</span>
          </span>
        </h2>
        <p className="home-tagline">{profile.tagline}</p>

        <div className="home-meta">
          <span>📍 {profile.location}</span>
          <span>✉️ {profile.email}</span>
        </div>

        <div className="home-actions">
          <a className="btn btn--primary" href={profile.resume} target="_blank" rel="noreferrer">
            View Résumé
          </a>
          <a className="btn btn--ghost" href="#projects">
            See My Work
          </a>
        </div>

        <div className="home-sci">
          {socials.map((s) => (
            <a key={s.name} href={s.href} target="_blank" rel="noreferrer" title={s.name} aria-label={s.name}>
              <img src={s.icon} alt={s.name} />
            </a>
          ))}
        </div>
      </div>

      <div className="profile-photo" ref={photoRef}>
        <div className="profile-photo-ring">
          <img src="/profile-photo.jpeg" alt={profile.name} />
        </div>
        {heroBadges.map((badge, i) => (
          <span className={`float-badge float-badge--${i + 1}`} key={badge.name}>
            <img src={badge.icon} alt="" aria-hidden="true" />
            {badge.name}
          </span>
        ))}
      </div>

      <a className="scroll-cue" href="#about" aria-label="Scroll to the About section">
        <span className="scroll-cue-wheel" />
      </a>
    </section>
  )
}
