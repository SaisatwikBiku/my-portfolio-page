import Section from './Section.jsx'
import { education, languages } from '../data/portfolio.js'

export default function Education() {
  return (
    <Section id="education" title="Education" eyebrow="Background" className="education">
      <div className="education-grid">
        {education.map((edu) => (
          <article className="education-card" key={edu.school}>
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

      <div className="languages">
        <h3 className="languages-title">Languages</h3>
        <div className="language-chips">
          {languages.map((lang) => (
            <span className="language-chip" key={lang.name}>
              {lang.name}
              <em>{lang.level}</em>
            </span>
          ))}
        </div>
      </div>
    </Section>
  )
}
