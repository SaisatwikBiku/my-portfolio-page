import { useEffect, useRef } from 'react'

// Two layered cursor effects, desktop-only and skipped for reduced motion:
//  1. a soft spotlight that trails the pointer (pure atmosphere), and
//  2. a fading "web" filament — a thwip trail of the pointer's recent path,
//     drawn on a canvas in the current accent colour (blue, or red in Spidey
//     mode). Short perpendicular ticks along the strand read as webbing.
export default function CursorGlow() {
  const glowRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!window.matchMedia('(pointer: fine)').matches) return

    const glow = glowRef.current
    const canvas = canvasRef.current
    if (!glow || !canvas) return

    const ctx = canvas.getContext('2d')
    let dpr = Math.min(window.devicePixelRatio || 1, 2)

    // Read the live accent colour off the CSS custom property, re-reading when
    // the theme / Spidey mode flips (both live on <html>'s attributes).
    let accent = '#2492ff'
    const readAccent = () => {
      const v = getComputedStyle(document.documentElement)
        .getPropertyValue('--accent')
        .trim()
      if (v) accent = v
    }
    readAccent()
    const themeObserver = new MutationObserver(readAccent)
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'data-spidey'],
    })

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    // Glow position (eased) + a ring buffer of recent points for the trail.
    let gx = window.innerWidth / 2
    let gy = window.innerHeight / 3
    let tx = gx
    let ty = gy
    const points = []
    const MAX_POINTS = 18
    let raf = 0

    const onMove = (e) => {
      tx = e.clientX
      ty = e.clientY
      glow.style.opacity = '1'
      points.push({ x: e.clientX, y: e.clientY, t: performance.now() })
      if (points.length > MAX_POINTS) points.shift()
    }

    const tick = () => {
      gx += (tx - gx) * 0.1
      gy += (ty - gy) * 0.1
      glow.style.transform = `translate(${gx - 300}px, ${gy - 300}px)`

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      const now = performance.now()
      const LIFE = 320 // ms a point stays visible
      // Drop expired points from the tail.
      while (points.length && now - points[0].t > LIFE) points.shift()

      for (let i = 1; i < points.length; i++) {
        const p = points[i]
        const prev = points[i - 1]
        const age = (now - p.t) / LIFE
        const alpha = (1 - age) * 0.5
        if (alpha <= 0) continue
        ctx.globalAlpha = alpha
        ctx.strokeStyle = accent
        ctx.lineWidth = (1 - age) * 1.6 + 0.3
        ctx.beginPath()
        ctx.moveTo(prev.x, prev.y)
        ctx.lineTo(p.x, p.y)
        ctx.stroke()

        // A short cross-tick every few segments makes the strand read as web.
        if (i % 3 === 0) {
          const dx = p.x - prev.x
          const dy = p.y - prev.y
          const len = Math.hypot(dx, dy) || 1
          const nx = -dy / len
          const ny = dx / len
          const r = 3 * (1 - age)
          ctx.globalAlpha = alpha * 0.7
          ctx.beginPath()
          ctx.moveTo(p.x - nx * r, p.y - ny * r)
          ctx.lineTo(p.x + nx * r, p.y + ny * r)
          ctx.stroke()
        }
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('resize', resize, { passive: true })
    raf = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(raf)
      themeObserver.disconnect()
    }
  }, [])

  return (
    <>
      <canvas className="cursor-web-canvas" ref={canvasRef} aria-hidden="true" />
      <div className="cursor-glow" ref={glowRef} aria-hidden="true" />
    </>
  )
}
