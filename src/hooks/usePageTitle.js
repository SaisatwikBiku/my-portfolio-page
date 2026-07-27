import { useEffect } from 'react'
import { profile } from '../data/portfolio.js'

// Sets the browser tab title per route. Runs on mount/when `title` changes;
// restores the default on unmount so a fast back-navigation never flashes a
// stale title from the page being left.
export function usePageTitle(title) {
  useEffect(() => {
    const previous = document.title
    document.title = title ? `${title} · ${profile.shortName}` : previous
    return () => {
      document.title = previous
    }
  }, [title])
}
