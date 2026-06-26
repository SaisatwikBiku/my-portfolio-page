import { useEffect, useState } from 'react'

// Lightweight typing effect — cycles through a list of strings.
export function useTyped(strings, { typeSpeed = 90, backSpeed = 45, pause = 1400 } = {}) {
  const [text, setText] = useState('')
  const [index, setIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = strings[index % strings.length]
    let delay = deleting ? backSpeed : typeSpeed

    if (!deleting && text === current) {
      delay = pause
    } else if (deleting && text === '') {
      setDeleting(false)
      setIndex((i) => i + 1)
      delay = typeSpeed
    }

    const timer = setTimeout(() => {
      if (!deleting && text === current) {
        setDeleting(true)
      } else {
        const next = deleting
          ? current.slice(0, text.length - 1)
          : current.slice(0, text.length + 1)
        setText(next)
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [text, deleting, index, strings, typeSpeed, backSpeed, pause])

  return text
}
