import { useMemo } from 'react'
import { coastRings, ORIGIN, DESTINATION, VIEW } from '../data/worldCoast.js'

// The one real map on this site.
//
// Chapter six is a number — "~8,000 miles" — sitting next to a footbridge on an
// invented island. This puts the actual flight on the actual planet: real
// coastlines from Natural Earth, real coordinates for both ends, and a real
// great-circle arc between them, which is why the route bows north over Europe
// instead of running straight across the page. That northward bow *is* the
// point; it is the shape of the shortest path on a sphere, and it is the shape
// the plane actually flew.
//
// SVG rather than canvas: it is a few hundred points drawn once, it scales to
// any card width for free, and every colour is a CSS custom property, so it
// follows light, dark and Spidey mode with the rest of the site.

// Equirectangular. Honest for a corridor this wide and this far from the poles,
// and it keeps the projection to two subtractions so the arc maths stays
// readable.
const px = (lon) => lon
const py = (lat) => -lat

const VB = {
  x: px(VIEW.lon0),
  y: py(VIEW.lat1),
  w: px(VIEW.lon1) - px(VIEW.lon0),
  h: py(VIEW.lat0) - py(VIEW.lat1),
}

const RAD = Math.PI / 180
const DEG = 180 / Math.PI

// Spherical linear interpolation between two points on the globe. Straight
// interpolation of longitude and latitude would draw the flat-map straight line
// — the thing this component exists to not draw.
function greatCircle(a, b, steps = 96) {
  const toVec = (p) => {
    const la = p.lat * RAD
    const lo = p.lon * RAD
    return [Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la)]
  }
  const v1 = toVec(a)
  const v2 = toVec(b)
  const dot = Math.max(-1, Math.min(1, v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]))
  const d = Math.acos(dot)
  const sin = Math.sin(d)
  const out = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    // Degenerate case (same point) would divide by zero; nothing on this map is
    // that close together, but the guard costs nothing.
    const k1 = sin < 1e-9 ? 1 - t : Math.sin((1 - t) * d) / sin
    const k2 = sin < 1e-9 ? t : Math.sin(t * d) / sin
    const x = k1 * v1[0] + k2 * v2[0]
    const y = k1 * v1[1] + k2 * v2[1]
    const z = k1 * v1[2] + k2 * v2[2]
    const lat = Math.asin(z / Math.hypot(x, y, z)) * DEG
    const lon = Math.atan2(y, x) * DEG
    out.push([lon, lat])
  }
  return out
}

// Great-circle distance, so the figure in the caption is derived rather than
// typed in and left to rot.
function haversineKm(a, b) {
  const dLat = (b.lat - a.lat) * RAD
  const dLon = (b.lon - a.lon) * RAD
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * RAD) * Math.cos(b.lat * RAD) * Math.sin(dLon / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(s))
}

const toPath = (pts) => `M${pts.map(([lon, lat]) => `${px(lon).toFixed(1)},${py(lat).toFixed(1)}`).join('L')}`

export default function CrossingMap() {
  const { land, route, mid, angle, miles } = useMemo(() => {
    const arc = greatCircle(ORIGIN, DESTINATION)
    const half = arc[arc.length >> 1]
    const next = arc[(arc.length >> 1) + 1]
    const kmDist = haversineKm(ORIGIN, DESTINATION)
    return {
      land: coastRings().map((r) => `${toPath(r)}Z`),
      route: toPath(arc),
      mid: [px(half[0]), py(half[1])],
      // Heading of the plane at the midpoint, in screen space.
      angle: Math.atan2(py(next[1]) - py(half[1]), px(next[0]) - px(half[0])) * DEG,
      miles: Math.round((kmDist * 0.621371) / 100) * 100,
    }
  }, [])

  const fmt = (n) => n.toLocaleString('en-US')

  return (
    <figure className="crossing-map">
      <svg
        viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
        role="img"
        aria-label={`World map showing the flight from Hyderabad, India to Albany, New York — about ${fmt(miles)} miles.`}
      >
        <g className="cm-land">
          {land.map((d) => (
            <path key={d.slice(0, 24)} d={d} />
          ))}
        </g>

        {/* Two strokes on the same path: a soft wide one for the glow, and the
            dashed one on top that animates itself in. */}
        <path className="cm-route-glow" d={route} />
        <path className="cm-route" d={route} />

        <g transform={`translate(${mid[0]} ${mid[1]}) rotate(${angle})`}>
          <path className="cm-plane" d="M-4.4 0 5 0M2.4 0-1.6-3.4M2.4 0-1.6 3.4M-1.2 0-3.4-2.2M-1.2 0-3.4 2.2" />
        </g>

        <g className="cm-ends">
          <circle cx={px(ORIGIN.lon)} cy={py(ORIGIN.lat)} r="2.4" />
          <circle cx={px(DESTINATION.lon)} cy={py(DESTINATION.lat)} r="2.4" />
        </g>
      </svg>

      {/* Labels are HTML, positioned as a percentage of the same viewBox, so
          they stay at a readable size however wide the card gets — text scaled
          by an SVG viewBox would be four pixels tall on a phone. */}
      <span className="cm-label cm-label--from" style={labelPos(ORIGIN)}>
        {ORIGIN.name}
      </span>
      <span className="cm-label cm-label--to" style={labelPos(DESTINATION)}>
        {DESTINATION.name}
      </span>

      {/* The distance is already on the line above, in his own words — repeating
          a derived figure next to an authored one just invites the two to
          disagree. It stays in the aria-label, where nothing else carries it. */}
      <figcaption>Great-circle route · the shortest path over a sphere</figcaption>
    </figure>
  )
}

function labelPos(p) {
  return {
    left: `${((px(p.lon) - VB.x) / VB.w) * 100}%`,
    top: `${((py(p.lat) - VB.y) / VB.h) * 100}%`,
  }
}
