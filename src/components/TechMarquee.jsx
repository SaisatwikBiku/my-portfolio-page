import { skillGroups } from '../data/portfolio.js'

// Only logo-bearing skills belong in the visual ticker.
const items = skillGroups.flatMap((group) => group.skills).filter((skill) => skill.icon)

// Full-width infinite logo ticker between the hero and About. The item list is
// rendered twice so the -50% translate loop is seamless; hovering pauses it.
export default function TechMarquee() {
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {[...items, ...items].map((skill, i) => (
          <span className="marquee-item" key={i}>
            <img src={skill.icon} alt="" loading="lazy" />
            {skill.name}
          </span>
        ))}
      </div>
    </div>
  )
}
