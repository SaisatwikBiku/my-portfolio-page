import { useScrollSpy } from '../hooks/useScrollSpy.js'

// Sticky in-page wayfinding for pages that stack more than one <Section>.
// `items` is [{ id, label }] in page order; reuses useScrollSpy exactly as the
// old single-page header nav did, just scoped to this page's own section ids.
export default function PageSubNav({ items }) {
  const ids = items.map((item) => item.id)
  // Matches scroll-padding-top: a section counts as "current" once its top
  // reaches the underside of the header + this sticky bar.
  const active = useScrollSpy(ids, 150)

  return (
    <nav className="page-subnav" aria-label="Sections on this page">
      <div className="page-subnav-inner">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={active === item.id ? 'active' : ''}
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  )
}
