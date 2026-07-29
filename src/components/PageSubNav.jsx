import { NavLink } from 'react-router-dom'

// Tab strip for the two sections of the site that split into several pages.
// `items` is [{ to, label }] in page order.
//
// These used to be #anchors into one long page, with useScrollSpy lighting up
// whichever section you had scrolled past. They're real routes now — a tab is a
// destination, not a jump — so the active state comes from the router and the
// scrollspy is gone.
//
// They look like tabs, but they are links that change the URL — so they keep
// link semantics. role="tab"/"tablist" would be a downgrade here: it promises a
// screen reader arrow-key navigation and an aria-controls'd tabpanel that don't
// exist, and it overrides the link role the behaviour actually matches.
// NavLink already marks the current one with aria-current="page".
export default function PageSubNav({ items }) {
  return (
    <nav className="page-subnav" aria-label="Sections">
      <div className="page-subnav-inner">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            // Without `end`, the index tab ("/about") would stay active on every
            // child route, because its path prefixes all of them.
            end
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
