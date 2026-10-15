import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminCall } from './api.js'
import { useAdminBase } from '../lib/adminGate.js'
import { formatDate } from '../data/blog.js'

const FILTERS = ['all', 'drafts', 'published']

export default function PostList({ draftsPrivate, onSignedOut, onSignOut }) {
  const base = useAdminBase()
  const [posts, setPosts] = useState(null)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [busy, setBusy] = useState('')

  const load = useCallback(async () => {
    setError('')
    try {
      const data = await adminCall('list')
      setPosts(data.posts)
    } catch (err) {
      if (err.signedOut) return onSignedOut()
      setError(err.message)
    }
  }, [onSignedOut])

  useEffect(() => {
    load()
  }, [load])

  const remove = async (post) => {
    const label = post.draft ? 'draft' : 'published post'
    if (!window.confirm(`Delete the ${label} "${post.title}"? This can only be undone from Git history.`)) return
    setBusy(post.path)
    try {
      await adminCall('delete', { store: post.store, path: post.path, sha: post.sha })
      await load()
    } catch (err) {
      if (err.signedOut) return onSignedOut()
      setError(err.message)
    } finally {
      setBusy('')
    }
  }

  const shown = (posts ?? []).filter(
    (p) => filter === 'all' || (filter === 'drafts' ? p.draft : !p.draft),
  )
  const count = (f) => (posts ?? []).filter((p) => f === 'all' || (f === 'drafts' ? p.draft : !p.draft)).length

  return (
    <div className="admin-page">
      <header className="admin-topbar">
        <div>
          <p className="admin-eyebrow">satwik.info</p>
          <h1>Posts</h1>
        </div>
        <div className="admin-row">
          <a className="admin-link" href="/blog" target="_blank" rel="noreferrer">
            View blog ↗
          </a>
          <button className="admin-link" onClick={onSignOut}>
            Sign out
          </button>
          <Link className="btn btn--primary admin-btn" to={`${base}/new`}>
            New post
          </Link>
        </div>
      </header>

      {!draftsPrivate && (
        <p className="admin-notice">
          Drafts are saved to the public site repo, so anyone browsing it on GitHub can read them. Set{' '}
          <code>DRAFTS_REPO</code> to a private repo to keep them hidden.
        </p>
      )}

      <div className="admin-tabs" role="tablist">
        {FILTERS.map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            className={filter === f ? 'is-active' : ''}
            onClick={() => setFilter(f)}
          >
            {f[0].toUpperCase() + f.slice(1)} <span>{posts ? count(f) : ''}</span>
          </button>
        ))}
      </div>

      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}
      {!posts && !error && <p className="admin-muted">Loading posts…</p>}
      {posts && shown.length === 0 && (
        <p className="admin-empty">
          {filter === 'all' ? 'No posts yet. ' : `No ${filter} posts. `}
          <Link to={`${base}/new`}>Write one</Link>
        </p>
      )}

      <ul className="admin-posts">
        {shown.map((post) => (
          <li key={`${post.store}:${post.path}`} className="admin-post">
            <Link
              className="admin-post-main"
              to={`${base}/edit?store=${post.store}&path=${encodeURIComponent(post.path)}`}
            >
              <span className={`admin-pill ${post.draft ? 'admin-pill--draft' : 'admin-pill--live'}`}>
                {post.draft ? 'Draft' : 'Published'}
              </span>
              <span className="admin-post-title">{post.title}</span>
              <span className="admin-post-meta">
                {post.date ? formatDate(post.date) : 'No date'} · /blog/{post.slug}
                {post.tags.length > 0 && ` · ${post.tags.map((t) => `#${t}`).join(' ')}`}
              </span>
            </Link>
            <div className="admin-post-actions">
              {!post.draft && (
                <a className="admin-link" href={`/blog/${post.slug}`} target="_blank" rel="noreferrer">
                  View
                </a>
              )}
              <button className="admin-link admin-link--danger" onClick={() => remove(post)} disabled={busy === post.path}>
                {busy === post.path ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
