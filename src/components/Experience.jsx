import Section from './Section.jsx'
import { experience } from '../data/portfolio.js'

export default function Experience() {
  return (
    <Section id="experience" title="Experience" eyebrow="Where I've Worked" className="experience">
      <div className="timeline">
        {experience.map((job) => (
          <article className="timeline-item" key={job.company}>
            <div className="timeline-marker" />
            <div className="timeline-body">
              <div className="timeline-head">
                <h3>
                  {job.role} <span className="timeline-company">· {job.company}</span>
                </h3>
                <span className="timeline-period">{job.period}</span>
              </div>
              <ul>
                {job.points.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </Section>
  )
}
