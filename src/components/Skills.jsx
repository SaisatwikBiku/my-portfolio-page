import Section from './Section.jsx'
import { skillGroups } from '../data/portfolio.js'

export default function Skills() {
  return (
    <Section id="skills" title="Skills & Tooling" eyebrow="What I Work With" className="skills">
      <div className="skill-groups">
        {skillGroups.map((group) => (
          <div className="skill-group" key={group.title}>
            <h3 className="skill-group-title">{group.title}</h3>
            <div className="skill-chips">
              {group.skills.map((skill) => (
                <div className="skill-chip" key={skill.name}>
                  <img src={skill.icon} alt={skill.name} loading="lazy" />
                  <span>{skill.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
