import { Outlet } from 'react-router-dom'
import PageSubNav from '../components/PageSubNav.jsx'
import PageNext from '../components/PageNext.jsx'

// Tabs are routes: /about, /about/skills, /about/education. This shell holds
// the tab strip and the hand-off; the active tab's own section renders into the
// <Outlet/> between them.
const TABS = [
  { to: '/about', label: 'About' },
  { to: '/about/skills', label: 'Skills' },
  { to: '/about/education', label: 'Education' },
]

export default function AboutPage() {
  return (
    <>
      <PageSubNav items={TABS} />
      <Outlet />
      <PageNext
        to="/work"
        title="Work"
        blurb="Projects, published research, experience — and a playable map of the journey."
      />
    </>
  )
}
