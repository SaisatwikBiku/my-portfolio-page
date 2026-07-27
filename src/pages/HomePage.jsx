import Home from '../components/Home.jsx'
import TechMarquee from '../components/TechMarquee.jsx'
import Explore from '../components/Explore.jsx'
import { usePageTitle } from '../hooks/usePageTitle.js'

export default function HomePage() {
  usePageTitle(null)

  return (
    <>
      <Home />
      <TechMarquee />
      <Explore />
    </>
  )
}
