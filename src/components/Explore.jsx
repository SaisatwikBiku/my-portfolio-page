import { Link } from 'react-router-dom'
import Section from './Section.jsx'

// The landing page's routing hub. The old site answered "where do I go next?"
// by scrolling; a four-page site has to answer it with real doors.
const DESTINATIONS = [
  {
    num: '01',
    to: '/about',
    title: 'About',
    blurb:
      'Who I am, the stack I actually reach for, and the degrees and certifications behind it.',
  },
  {
    num: '02',
    to: '/work',
    title: 'Work',
    blurb:
      'Shipped projects, a peer-reviewed paper, work experience — and a playable map of how I got here.',
  },
  {
    num: '03',
    to: '/contact',
    title: 'Contact',
    blurb:
      'Hiring, collaborating, or just saying hi — the fastest ways to reach me.',
  },
]

export default function Explore() {
  return (
    <Section
      id="explore"
      title="Where to next?"
      eyebrow="Explore"
      lead="Three doors — take whichever one you came for."
      className="explore"
    >
      <div className="explore-grid">
        {DESTINATIONS.map((destination, i) => (
          <Link
            className="explore-card"
            key={destination.to}
            to={destination.to}
            style={{ '--d': `${i * 90}ms` }}
          >
            <span className="explore-card-num">{destination.num}</span>
            <h3>{destination.title}</h3>
            <p>{destination.blurb}</p>
            <span className="explore-card-go">Open {destination.title} →</span>
          </Link>
        ))}
      </div>
    </Section>
  )
}
