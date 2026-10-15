import { useCallback, useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { adminCall } from './api.js'
import AdminLogin from './AdminLogin.jsx'
import PostList from './PostList.jsx'
import PostEditor from './PostEditor.jsx'
import { usePageTitle } from '../hooks/usePageTitle.js'
import './admin.css'

// /admin, outside the site Layout: no header, chatbot or tour, just the tool.
// Loaded lazily from App.jsx, so visitors never download the editor.
export default function AdminApp() {
  usePageTitle('Blog editor')
  const [session, setSession] = useState({ state: 'checking' })

  // Keep the editor out of search results.
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])

  const check = useCallback(async () => {
    try {
      const data = await adminCall('session')
      setSession({ state: data.signedIn ? 'in' : 'out', draftsPrivate: data.draftsPrivate })
    } catch (err) {
      setSession({ state: 'error', error: err.message })
    }
  }, [])

  useEffect(() => {
    check()
  }, [check])

  // Any call that comes back 401 drops the user to the sign-in screen.
  const onSignedOut = useCallback(() => setSession((s) => ({ ...s, state: 'out' })), [])

  const signOut = async () => {
    await adminCall('sign-out').catch(() => {})
    onSignedOut()
  }

  if (session.state === 'checking') return <div className="admin-shell admin-center admin-muted">Loading…</div>
  if (session.state === 'error') {
    return (
      <div className="admin-shell admin-center">
        <p className="admin-error">{session.error}</p>
      </div>
    )
  }
  if (session.state === 'out') return <AdminLogin onSignedIn={check} />

  return (
    <div className="admin-shell">
      <Routes>
        <Route
          index
          element={<PostList draftsPrivate={session.draftsPrivate} onSignedOut={onSignedOut} onSignOut={signOut} />}
        />
        <Route path="new" element={<PostEditor onSignedOut={onSignedOut} />} />
        <Route path="edit" element={<PostEditor onSignedOut={onSignedOut} />} />
      </Routes>
    </div>
  )
}
