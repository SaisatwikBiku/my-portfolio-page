import { useReveal } from '../hooks/useReveal.js'

// Section wrapper that fades its content in on scroll and renders an optional
// heading: a title plus a one-line narrative hook. Kept deliberately to those
// two elements — the site used to stack a chapter number and an uppercase
// eyebrow above them too, which was a lot of chrome to read past before any
// actual content, and the 01–07 numbering stopped meaning anything once the
// single scroll became five separate pages.
export default function Section({ id, title, lead, className = '', children }) {
  const [ref, visible] = useReveal()

  return (
    <section
      id={id}
      ref={ref}
      className={`section ${className} ${visible ? 'is-visible' : ''}`}
    >
      {title && (
        <header className="section-head">
          <h2 className="section-title">{title}</h2>
          {lead && <p className="section-lead">{lead}</p>}
        </header>
      )}
      {children}
    </section>
  )
}
