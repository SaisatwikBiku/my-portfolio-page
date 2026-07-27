import JourneyMap from '../components/JourneyMap.jsx'
import PageNext from '../components/PageNext.jsx'
import { usePageTitle } from '../hooks/usePageTitle.js'

export default function JourneyPage() {
  usePageTitle('Journey')

  return (
    <>
      <JourneyMap />
      <PageNext
        to="/contact"
        title="Contact"
        blurb="Reached the last marker? The next one hasn't been placed yet — say hi."
      />
    </>
  )
}
