import { profile, socials } from '../data/portfolio.js'
import { useTyped } from '../hooks/useTyped.js'

export default function Home() {
  const typed = useTyped(profile.typedRoles)

  return (
    <section className="home" id="home">
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

      <div className="profile-photo">
        <div className="profile-photo-ring">
          <img src="/profile-photo.jpeg" alt={profile.name} />
        </div>
      </div>
    </section>
  )
}
