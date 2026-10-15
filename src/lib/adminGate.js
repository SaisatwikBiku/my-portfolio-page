import { createContext, useContext, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { navLinks } from '../data/portfolio.js'

// The blog editor has no fixed URL. Its address is the ADMIN_PATH variable set
// in Vercel, and the build only ships a SHA-256 of it (vite.config.js), so the
// path appears nowhere in this public repo or in the JavaScript the site serves.
// The browser hashes the first segment of the current URL and opens the editor
// only on a match. This keeps the editor out of sight; the emailed sign-in code
// on the server is still what keeps people out.
// eslint-disable-next-line no-undef
const ADMIN_HASH = __ADMIN_PATH_HASH__

// Segments that belong to the public site skip the hash check, so ordinary
// pages render on the first pass with no async wait.
const PUBLIC_SEGMENTS = new Set(navLinks.map((l) => l.to.split('/')[1]))

async function sha256(text) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

// '/<secret>' when the URL is the editor's, null when it isn't, and undefined
// for the moment it takes to find out.
export function useAdminGate() {
  const segment = useLocation().pathname.split('/')[1] || ''
  const skip = !ADMIN_HASH || PUBLIC_SEGMENTS.has(segment) || !globalThis.crypto?.subtle
  const [result, setResult] = useState({ segment: null, base: null })

  useEffect(() => {
    if (skip || result.segment === segment) return
    let live = true
    sha256(segment).then((hash) => {
      if (live) setResult({ segment, base: hash === ADMIN_HASH ? `/${segment}` : null })
    })
    return () => {
      live = false
    }
  }, [segment, skip, result.segment])

  if (skip) return null
  return result.segment === segment ? result.base : undefined
}

// The editor's own links are built from this, never from a hard-coded path.
export const AdminBaseContext = createContext('')
export const useAdminBase = () => useContext(AdminBaseContext)
