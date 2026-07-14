import Section from './Section.jsx'
import { education, languages, certifications } from '../data/portfolio.js'

export default function Education() {
  return (
    <Section
      id="education"
      title="Education"
      eyebrow="Background"
      num="05"
      lead="The foundation everything above stands on."
      className="education"
    >
      <div className="education-grid">
        {education.map((edu, i) => (
          <article className="education-card" key={edu.school} style={{ '--d': `${i * 140}ms` }}>
            <div className="education-head">
              <h3>{edu.degree}</h3>
              <span className="education-period">{edu.period}</span>
            </div>
            <p className="education-school">
              {edu.school} · {edu.location}
            </p>
            <p className="education-course">
              <strong>Coursework:</strong> {edu.coursework}
            </p>
          </article>
        ))}
      </div>

      <div className="certifications">
        <h3 className="certifications-title">Certifications &amp; Achievements</h3>
        <div className="cert-grid">
          {certifications.map((cert, i) => (
            <article className="cert-card" key={cert.name} style={{ '--d': `${i * 120}ms` }}>
              <span className="cert-badge" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="6" />
                  <path d="M8.21 13.89 7 22l5-3 5 3-1.21-8.11" />
                </svg>
              </span>
              <div className="cert-body">
                <h4>{cert.name}</h4>
                <p>
                  {cert.issuer} · {cert.date}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="languages">
        <h3 className="languages-title">Languages</h3>
        <div className="language-chips">
          {languages.map((lang, i) => (
            <span className="language-chip" key={lang.name} style={{ '--d': `${i * 80}ms` }}>
              {lang.name}
              <em>{lang.level}</em>
            </span>
          ))}
        </div>
      </div>
    </Section>
  )
}
