import { Link } from 'react-router-dom'
import Section from '../components/Section.jsx'
import { usePageTitle } from '../hooks/usePageTitle.js'

export default function NotFoundPage() {
  usePageTitle('Page Not Found')

  return (
    <Section id="not-found" className="not-found">
      <p className="not-found-code">404</p>
      <h1 className="not-found-title">This page swung off somewhere else.</h1>
      <p className="not-found-lead">
        The link you followed doesn't match anything here. Let's get you back on solid ground.
      </p>
      <Link className="btn btn--primary" to="/">
        Back to Home
      </Link>
    </Section>
  )
}
