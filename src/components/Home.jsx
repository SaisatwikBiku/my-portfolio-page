import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { profile, socials, heroBadges } from '../data/portfolio.js'
import { useTyped } from '../hooks/useTyped.js'
import Magnetic from './Magnetic.jsx'

// Lazy-loaded so three.js lands in its own chunk after first paint — the hero
// is fully usable while the 3D backdrop streams in.
const Hero3D = lazy(() => import('./Hero3D.jsx'))

// The greeting cycles through the four languages Sai speaks — English, Telugu,
// Hindi, and German — a small story beat that pays off in the Languages section.
const GREETINGS = ['Hello', 'నమస్తే', 'नमस्ते', 'Hallo']

export default function Home() {
  const typed = useTyped(profile.typedRoles)
  const [greetIdx, setGreetIdx] = useState(0)
  const heroRef = useRef(null)
  const photoRef = useRef(null)

  useEffect(() => {
    const timer = setInterval(() => setGreetIdx((i) => (i + 1) % GREETINGS.length), 2600)
    return () => clearInterval(timer)
  }, [])

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
        <p className="home-greeting">
          <span className="greet-word" key={greetIdx}>
            {GREETINGS[greetIdx]}
          </span>
          , it's me
        </p>
        <h1 className="home-name">{profile.name}</h1>
        <svg className="name-swoosh" viewBox="0 0 220 14" fill="none" preserveAspectRatio="none" aria-hidden="true">
          <path d="M3 10 C 60 2, 140 2, 217 8" stroke="var(--blue)" strokeWidth="4" strokeLinecap="round" />
        </svg>
        <h2 className="home-role">
          {profile.role}, also a{' '}
          <span className="typing-wrap">
            <span className="typing-text">{typed}</span>
            <span className="caret">|</span>
          </span>
        </h2>
        <p className="home-tagline">{profile.tagline}</p>

        <div className="home-meta">
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {profile.location}
          </span>
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
            {profile.email}
          </span>
        </div>

        <div className="home-actions">
          <Magnetic>
            <a className="btn btn--primary" href={profile.resume} target="_blank" rel="noreferrer">
              View Résumé
            </a>
          </Magnetic>
          <Magnetic>
            <a className="btn btn--ghost" href="#projects">
              See My Work
            </a>
          </Magnetic>
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
