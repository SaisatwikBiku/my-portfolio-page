import Section from './Section.jsx'
import { about } from '../data/portfolio.js'
import { useReveal } from '../hooks/useReveal.js'
import { useCountUp } from '../hooks/useCountUp.js'

// One stat card whose numeric part counts up from zero when scrolled into view.
function Stat({ value, label, start }) {
  const match = /^(\d+)(.*)$/.exec(value)
  const target = match ? Number(match[1]) : 0
  const count = useCountUp(target, start)

  return (
    <div className="about-stat">
      <span className="about-stat-value">{match ? `${count}${match[2]}` : value}</span>
      <span className="about-stat-label">{label}</span>
    </div>
  )
}

export default function About() {
  const [statsRef, statsVisible] = useReveal()

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
          <div className="about-highlights" ref={statsRef}>
            {about.highlights.map((h) => (
              <Stat key={h.label} value={h.value} label={h.label} start={statsVisible} />
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}
