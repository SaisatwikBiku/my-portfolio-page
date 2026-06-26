import Section from './Section.jsx'
import { projects } from '../data/portfolio.js'

export default function Projects() {
  return (
    <Section id="projects" title="Projects" eyebrow="Things I've Built" className="projects">
      <div className="projects-grid">
        {projects.map((project) => (
          <article className="project-card" key={project.title}>
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

        <article className="project-card project-card--more">
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
