import { Link, useLocation } from 'react-router-dom'
import { PLACES } from '../data/journey.js'

// A site-wide invitation to the playable map. Deliberately NOT the real thing:
// the Journey canvas bakes a 2500×1500 world before it can draw a single frame,
// which is far too much to pay on every page just to advertise itself. This is
// the same character (walker.png) under the same motion rules as the canvas
// version — whole-body bounce, a little rock, a squash on the footfall, and a
// counter-phase shadow — done in CSS, so it costs a transform per frame.
export default function JourneyGlimpse() {
  const { pathname } = useLocation()

  // Never advertise the map on the map's own page.
  if (pathname === '/journey') return null

  // Only the chapter count is derived. A "cities" tally would have to decide
  // whether The Crossing (a flight, not a place) counts, and the map's own
  // copy already commits to a number — no second, conflicting one here.
  const chapters = PLACES.length

  return (
    <aside className="glimpse" aria-labelledby="glimpse-title">
      <div className="glimpse-inner">
        <div className="glimpse-copy">
          <h2 className="glimpse-title" id="glimpse-title">
            My résumé, but you walk it
          </h2>
          <p className="glimpse-lead">
            {chapters} chapters, two continents and one very long flight, laid out as a
            little top-down world. Walk up to a marker and it tells you what happened there.
          </p>
          <Link className="btn btn--primary glimpse-cta" to="/journey">
            Play the Journey →
          </Link>
        </div>

        {/* Decorative: the copy above already says everything this conveys. */}
        <div className="glimpse-stage" aria-hidden="true">
          <div className="glimpse-ground" />
          <span className="glimpse-marker glimpse-marker--1" />
          <span className="glimpse-marker glimpse-marker--2" />
          <span className="glimpse-marker glimpse-marker--3" />
          <div className="glimpse-walker">
            <span className="glimpse-shadow" />
            <img src="/walker.png" alt="" width="120" height="286" loading="lazy" />
          </div>
        </div>
      </div>
    </aside>
  )
}
