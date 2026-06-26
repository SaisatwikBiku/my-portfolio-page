import { useEffect, useRef, useState } from 'react'

// Reveals an element with a fade/slide-up the first time it scrolls into view.
export function useReveal(options = {}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    // Respect users who prefer reduced motion.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return
    }

    // Use threshold 0 + a bottom rootMargin so the reveal fires as soon as the
    // element's top edge scrolls a little into view. A fixed ratio threshold is
    // unreliable for sections taller than the viewport (common on mobile, where
    // everything stacks) — those can never reach a high intersection ratio.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0, rootMargin: '0px 0px -12% 0px', ...options },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [options])

  return [ref, visible]
}
