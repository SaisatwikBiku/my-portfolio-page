import { Link } from 'react-router-dom'
import Section from './Section.jsx'
import { usePageTitle } from '../hooks/usePageTitle.js'
import { jobAgent } from '../data/portfolio.js'

// Case study for the self-hosted job agent. Lives under /work so it keeps the
// Work tab strip and the "next chapter" hand-off. Every screenshot is taken
// from the real panel running on made-up data, so none of my own job search
// (companies, emails, profile) is on the site.
function Shot({ shot, className = '' }) {
  return (
    <figure className={`cs-shot ${className}`}>
      <img src={shot.src} alt={shot.alt} loading="lazy" decoding="async" />
      {shot.caption && <figcaption>{shot.caption}</figcaption>}
    </figure>
  )
}

export default function JobAgent() {
  usePageTitle('Job Agent')
  const p = jobAgent

  return (
    <Section id="job-agent" title={p.title} lead={p.lead} className="case-study">
      <Link className="cs-back" to="/work">
        ← All projects
      </Link>

      <Shot shot={p.hero} className="cs-shot--hero" />

      <div className="cs-metrics">
        {p.metrics.map((m) => (
          <div className="cs-metric" key={m.label}>
            <span className="cs-metric-value">{m.value}</span>
            <span className="cs-metric-label">{m.label}</span>
          </div>
        ))}
      </div>

      <div className="cs-body">
        {p.sections.map((s) => (
          <section className="cs-block" key={s.heading}>
            <h3>{s.heading}</h3>
            {s.text && <p>{s.text}</p>}
            {s.points && (
              <ul className="cs-points">
                {s.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <h3 className="cs-subhead">A look inside</h3>
      <div className="cs-gallery">
        {p.gallery.map((shot) => (
          <Shot shot={shot} key={shot.src} />
        ))}
      </div>
      <div className="cs-phones">
        {p.phones.map((shot) => (
          <Shot shot={shot} key={shot.src} className="cs-shot--phone" />
        ))}
        <p className="cs-phones-note">{p.phonesNote}</p>
      </div>

      <Link className="cs-callout" to={p.incident.to}>
        <span className="cs-callout-title">{p.incident.title} →</span>
        <span className="cs-callout-text">{p.incident.text}</span>
      </Link>

      <div className="project-tags cs-tags">
        {p.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>

      <div className="cs-actions">
        <a className="btn btn--primary" href={p.href} target="_blank" rel="noreferrer">
          View the code on GitHub →
        </a>
        <Link className="btn btn--ghost" to="/work">
          Back to projects
        </Link>
      </div>
      <p className="cs-note">{p.note}</p>
    </Section>
  )
}
