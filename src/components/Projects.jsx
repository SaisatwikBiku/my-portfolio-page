import { useState } from 'react'
import Section from './Section.jsx'
import { projects } from '../data/portfolio.js'

const filters = ['All', ...new Set(projects.map((p) => p.category))]

// 3D tilt that follows the cursor. Sets CSS vars consumed by .project-card:
// --rx/--ry for the rotation, --gx/--gy for the glare hotspot.
function tilt(e) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const card = e.currentTarget
  const rect = card.getBoundingClientRect()
  const px = (e.clientX - rect.left) / rect.width
  const py = (e.clientY - rect.top) / rect.height
  card.style.setProperty('--ry', `${(px - 0.5) * 10}deg`)
  card.style.setProperty('--rx', `${(0.5 - py) * 8}deg`)
  card.style.setProperty('--gx', `${px * 100}%`)
  card.style.setProperty('--gy', `${py * 100}%`)
}

function untilt(e) {
  const card = e.currentTarget
  card.style.setProperty('--ry', '0deg')
  card.style.setProperty('--rx', '0deg')
}

export default function Projects() {
  const [active, setActive] = useState('All')
  const shown = active === 'All' ? projects : projects.filter((p) => p.category === active)

  return (
    <Section id="projects" title="Projects" eyebrow="Things I've Built" className="projects">
      <div className="project-filters" role="tablist" aria-label="Filter projects by category">
        {filters.map((filter) => (
          <button
            key={filter}
            className={`project-filter ${filter === active ? 'active' : ''}`}
            onClick={() => setActive(filter)}
            role="tab"
            aria-selected={filter === active}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="projects-grid">
        {/* Keying by filter remounts the cards on every filter change so the
            staggered entrance animation replays. */}
        {shown.map((project, i) => (
          <article
            className="project-card"
            key={`${active}-${project.title}`}
            style={{ '--d': `${i * 70}ms` }}
            onMouseMove={tilt}
            onMouseLeave={untilt}
          >
            <div className="project-card-top">
              <span className="project-year">{project.year}</span>
              <h3>{project.title}</h3>
              <p className="project-subtitle">{project.subtitle}</p>
            </div>
            <p className="project-desc">{project.description}</p>
            <div className="project-tags">
              {project.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            {project.private ? (
              <span className="project-link project-link--private">🔒 Private · available on request</span>
            ) : (
              <a className="project-link" href={project.href} target="_blank" rel="noreferrer">
                View Project →
              </a>
            )}
          </article>
        ))}

        <article
          className="project-card project-card--more"
          key={`${active}-more`}
          style={{ '--d': `${shown.length * 70}ms` }}
          onMouseMove={tilt}
          onMouseLeave={untilt}
        >
          <h3>More on GitHub</h3>
          <p className="project-desc">
            News app (MERN), CommitMoji, web threat detection, and more experiments live on my profile.
          </p>
          <a className="project-link" href="https://github.com/SaisatwikBiku" target="_blank" rel="noreferrer">
            Browse GitHub →
          </a>
        </article>
      </div>
    </Section>
  )
}
