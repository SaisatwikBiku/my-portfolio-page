import { useEffect, useMemo, useState } from 'react'

// Hidden reward for the curious. Fires on either the Konami code or a click on
// the footer spider (which dispatches a 'spidey:egg' event): web strands shoot
// in from the four corners and a suit-quote toast appears, then it all fades.
const KONAMI = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a',
]

// One corner of webbing on a 0..100 unit grid, corner at the origin: radial
// strands plus three connecting arcs. The four corners reuse it via transforms.
function useCornerWeb() {
  return useMemo(() => {
    const angles = [0, 18, 36, 54, 72, 90]
    const R = 46
    const spokes = angles.map((deg) => {
      const r = (deg * Math.PI) / 180
      return `M0 0 L${(R * Math.cos(r)).toFixed(1)} ${(R * Math.sin(r)).toFixed(1)}`
    })
    const arcs = [16, 28, 40].map((rad) => {
      const pts = angles.map((deg) => {
        const r = (deg * Math.PI) / 180
        return `${(rad * Math.cos(r)).toFixed(1)} ${(rad * Math.sin(r)).toFixed(1)}`
      })
      return 'M' + pts.map((p, i) => (i ? 'L' + p : p)).join(' ')
    })
    return [...spokes, ...arcs]
  }, [])
}

export default function SpideyEgg() {
  const [active, setActive] = useState(false)
  const paths = useCornerWeb()

  useEffect(() => {
    let idx = 0
    const onKey = (e) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      idx = key === KONAMI[idx] ? idx + 1 : key === KONAMI[0] ? 1 : 0
      if (idx === KONAMI.length) {
        idx = 0
        setActive(true)
      }
    }
    const onEgg = () => setActive(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener('spidey:egg', onEgg)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('spidey:egg', onEgg)
    }
  }, [])

  useEffect(() => {
    if (!active) return
    const t = setTimeout(() => setActive(false), 4000)
    return () => clearTimeout(t)
  }, [active])

  if (!active) return null

  const corners = [
    '', // top-left
    'translate(100,0) scale(-1,1)', // top-right
    'translate(0,100) scale(1,-1)', // bottom-left
    'translate(100,100) scale(-1,-1)', // bottom-right
  ]

  return (
    <div className="spidey-egg" role="status" aria-live="polite">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        {corners.map((tf, ci) => (
          <g key={ci} transform={tf}>
            {paths.map((d, i) => (
              <path
                className="web-stroke"
                d={d}
                key={i}
                style={{ animationDelay: `${i * 20}ms` }}
              />
            ))}
          </g>
        ))}
      </svg>
      <div className="spidey-toast">
        <span aria-hidden="true">🕸️</span>
        With great power comes great responsibility.
      </div>
    </div>
  )
}
