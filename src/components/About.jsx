import Section from './Section.jsx'
import { about } from '../data/portfolio.js'

export default function About() {
  return (
    <Section id="about" title="About Me" eyebrow="Who I Am" className="about">
      <div className="about-grid">
        <div className="about-image">
          <img src="/about-image.png" alt="Sai Satwik Bikumandla" />
        </div>
        <div className="about-content">
          {about.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <div className="about-highlights">
            {about.highlights.map((h) => (
              <div className="about-stat" key={h.label}>
                <span className="about-stat-value">{h.value}</span>
                <span className="about-stat-label">{h.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}
