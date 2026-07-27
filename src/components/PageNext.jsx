import { Link } from 'react-router-dom'

// The hand-off at the foot of a page. On the old single-page site the next
// chapter simply followed on scroll; now it has to be an explicit door, so it
// names where it goes rather than just saying "next".
export default function PageNext({ to, title, blurb }) {
  return (
    <div className="page-next">
      <Link to={to}>
        <span>
          <span className="page-next-label">Next</span>
          <span className="page-next-title">{title}</span>
          {blurb && <span className="page-next-blurb">{blurb}</span>}
        </span>
        <span className="page-next-arrow" aria-hidden="true">
          →
        </span>
      </Link>
    </div>
  )
}
