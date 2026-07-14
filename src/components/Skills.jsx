import Section from './Section.jsx'
import { skillGroups } from '../data/portfolio.js'

const allSkills = skillGroups.flatMap((group) => group.skills)

// Six logos for the spinning cube faces.
const cubeFaces = ['React', 'Python', 'TypeScript', 'Node.js', 'TensorFlow', 'Docker']
  .map((name) => allSkills.find((skill) => skill.name === name))
  .filter(Boolean)

const HALF_EDGE = 60 // px — half the cube's edge length
const faceTransforms = [
  `rotateY(0deg) translateZ(${HALF_EDGE}px)`,
  `rotateY(90deg) translateZ(${HALF_EDGE}px)`,
  `rotateY(180deg) translateZ(${HALF_EDGE}px)`,
  `rotateY(270deg) translateZ(${HALF_EDGE}px)`,
  `rotateX(90deg) translateZ(${HALF_EDGE}px)`,
  `rotateX(-90deg) translateZ(${HALF_EDGE}px)`,
]

export default function Skills() {
  return (
    <Section
      id="skills"
      title="Skills & Tooling"
      eyebrow="What I Work With"
      num="02"
      lead="Collected project by project, sharpened bug by bug."
      className="skills"
    >
      <div className="tech-cube-stage" aria-hidden="true">
        <div className="tech-cube">
          {cubeFaces.map((skill, i) => (
            <div className="cube-face" key={skill.name} style={{ transform: faceTransforms[i] }}>
              <img src={skill.icon} alt="" loading="lazy" />
            </div>
          ))}
        </div>
      </div>

      <div className="skill-groups">
        {skillGroups.map((group, gi) => (
          <div className="skill-group" key={group.title} style={{ '--d': `${gi * 90}ms` }}>
            <h3 className="skill-group-title">{group.title}</h3>
            <div className="skill-chips">
              {group.skills.map((skill, i) => (
                <div
                  className={`skill-chip${skill.icon ? '' : ' skill-chip--text'}`}
                  key={skill.name}
                  style={{ '--d': `${gi * 90 + i * 50}ms` }}
                >
                  {skill.icon && <img src={skill.icon} alt="" loading="lazy" />}
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
