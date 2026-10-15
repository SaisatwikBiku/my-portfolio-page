import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { marked } from 'marked'
import { AdminError, adminCall, prepareImage } from './api.js'
import { useAdminBase } from '../lib/adminGate.js'
import { FORMATS, SHORTCUTS, insertImage } from './markdown.js'
import { SLUG_RE, readingMinutes, slugify } from '../lib/frontmatter.js'

const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const emptyPost = () => ({ title: '', slug: '', date: today(), summary: '', tags: [], cover: '', body: '' })
const POST_FIELDS = ['title', 'slug', 'date', 'summary', 'tags', 'cover', 'body']
const snapshot = (post) => JSON.stringify(POST_FIELDS.map((k) => post[k]))
const backupKey = (path) => `blog-admin:backup:${path || 'new'}`

const TOOLBAR = [
  { id: 'h2', label: 'H2', title: 'Heading' },
  { id: 'h3', label: 'H3', title: 'Subheading' },
  null,
  { id: 'bold', label: 'B', title: 'Bold (Ctrl+B)', className: 'is-bold' },
  { id: 'italic', label: 'I', title: 'Italic (Ctrl+I)', className: 'is-italic' },
  { id: 'strike', label: 'S', title: 'Strikethrough', className: 'is-strike' },
  { id: 'code', label: '</>', title: 'Inline code (Ctrl+E)' },
  { id: 'link', label: 'Link', title: 'Link (Ctrl+K)' },
  null,
  { id: 'ul', label: '• List', title: 'Bulleted list' },
  { id: 'ol', label: '1. List', title: 'Numbered list' },
  { id: 'task', label: '☐ Tasks', title: 'Checklist' },
  { id: 'quote', label: '“ Quote', title: 'Quote' },
  null,
  { id: 'codeblock', label: '{ } Code', title: 'Code block' },
  { id: 'table', label: 'Table', title: 'Table' },
  { id: 'hr', label: '―', title: 'Divider' },
]

const storage = {
  get(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || 'null')
    } catch {
      return null
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* private mode or full: the backup is a convenience */
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
  },
}

export default function PostEditor({ onSignedOut }) {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const base = useAdminBase()
  const editing = params.get('path') ? { store: params.get('store'), path: params.get('path') } : null

  const [post, setPost] = useState(emptyPost)
  const [original, setOriginal] = useState(null) // { store, path, sha, draft } once it exists on GitHub
  const [savedSnap, setSavedSnap] = useState(() => snapshot(emptyPost()))
  const [slugTouched, setSlugTouched] = useState(false)
  const [loadState, setLoadState] = useState(editing ? 'loading' : 'ready')
  const [loadError, setLoadError] = useState('')
  const [backup, setBackup] = useState(null)
  const [busy, setBusy] = useState('') // '' | 'draft' | 'publish' | 'unpublish'
  const [notice, setNotice] = useState(null) // { kind: 'ok' | 'error', text }
  const [uploads, setUploads] = useState(0)
  const [localImages, setLocalImages] = useState({}) // uploaded url -> object URL, until the deploy serves it
  const [view, setView] = useState(() => (window.innerWidth >= 1100 ? 'split' : 'write'))
  const [tagDraft, setTagDraft] = useState('')

  const taRef = useRef(null)
  const previewRef = useRef(null)
  const loadedKey = useRef(null)

  const isPublished = Boolean(original) && !original.draft
  const dirty = snapshot(post) !== savedSnap
  const key = editing ? `${editing.store}:${editing.path}` : 'new'

  const fail = useCallback(
    (err) => {
      if (err instanceof AdminError && err.signedOut) onSignedOut()
      else setNotice({ kind: 'error', text: err.message })
    },
    [onSignedOut],
  )

  // Load the post named in the URL. Skipped when the URL changed because this
  // editor just saved the post under a new path.
  useEffect(() => {
    if (loadedKey.current === key) return
    loadedKey.current = key
    const offerBackup = (serverPost, path) => {
      const saved = storage.get(backupKey(path))
      if (saved && snapshot(saved.post) !== snapshot(serverPost)) setBackup(saved)
    }
    if (!editing) {
      const fresh = emptyPost()
      setPost(fresh)
      setOriginal(null)
      setSavedSnap(snapshot(fresh))
      setSlugTouched(false)
      setLoadState('ready')
      offerBackup(fresh, null)
      return
    }
    setLoadState('loading')
    adminCall('get', editing)
      .then(({ post: p }) => {
        const loaded = { title: p.title, slug: p.slug, date: p.date || today(), summary: p.summary, tags: p.tags, cover: p.cover, body: p.body }
        setPost(loaded)
        setOriginal({ store: p.store, path: p.path, sha: p.sha, draft: p.draft })
        setSavedSnap(snapshot(loaded))
        setSlugTouched(true)
        setLoadState('ready')
        offerBackup(loaded, p.path)
      })
      .catch((err) => {
        if (err.signedOut) return onSignedOut()
        setLoadError(err.message)
        setLoadState('error')
      })
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  // Keep a copy of unsaved work in this browser, so a closed tab or an expired
  // session doesn't cost the text.
  useEffect(() => {
    if (loadState !== 'ready' || !dirty) return
    const id = setTimeout(() => storage.set(backupKey(original?.path), { post, at: Date.now() }), 500)
    return () => clearTimeout(id)
  }, [post, dirty, loadState, original?.path])

  useEffect(() => {
    if (!dirty) return
    const warn = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const update = (field, value) => {
    setPost((p) => {
      const next = { ...p, [field]: value }
      if (field === 'title' && !slugTouched && !isPublished) next.slug = slugify(value)
      return next
    })
  }

  // ---------- saving ----------

  const save = async (mode) => {
    if (busy) return
    if (mode === 'publish' && !isPublished && !window.confirm(`Publish "${post.title || 'Untitled'}" to satwik.info/blog?`)) return
    if (mode === 'unpublish' && !window.confirm('Unpublish this post? It moves back to drafts and leaves the site on the next deploy.')) return
    setBusy(mode)
    setNotice(null)
    const publish = mode === 'publish'
    try {
      const { saved } = await adminCall('save', { original, post, publish })
      storage.remove(backupKey(original?.path))
      storage.remove(backupKey(null))
      setOriginal(saved)
      setSavedSnap(snapshot(post))
      setSlugTouched(true)
      setBackup(null)
      const nextKey = `${saved.store}:${saved.path}`
      if (nextKey !== key) {
        loadedKey.current = nextKey
        navigate(`${base}/edit?store=${saved.store}&path=${encodeURIComponent(saved.path)}`, { replace: true })
      }
      setNotice({
        kind: 'ok',
        text:
          mode === 'draft'
            ? 'Draft saved.'
            : mode === 'unpublish'
              ? 'Moved back to drafts. The post disappears from the site after the next deploy (about a minute).'
              : isPublished
                ? 'Updated. The change goes live after Vercel redeploys, usually within a minute or two.'
                : `Published. It goes live at /blog/${post.slug} once Vercel redeploys, usually within a minute or two.`,
      })
    } catch (err) {
      fail(err)
    } finally {
      setBusy('')
    }
  }

  // Ctrl/Cmd+S saves in place: a draft stays a draft, a live post updates.
  const saveRef = useRef(save)
  saveRef.current = save
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        saveRef.current(isPublished ? 'publish' : 'draft')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isPublished])

  // ---------- images ----------

  const uploadFile = async (file) => {
    if (!post.slug || !SLUG_RE.test(post.slug)) throw new AdminError('Give the post a title (or slug) before adding images.')
    const img = await prepareImage(file)
    const { url } = await adminCall('upload', { slug: post.slug, filename: img.filename, data: img.data })
    setLocalImages((m) => ({ ...m, [url]: URL.createObjectURL(img.blob) }))
    return url
  }

  const addImages = async (files) => {
    const images = [...files].filter((f) => f.type.startsWith('image/'))
    if (!images.length) return
    setNotice(null)
    setUploads((n) => n + images.length)
    for (const file of images) {
      try {
        const url = await uploadFile(file)
        const alt = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'image'
        insertImage(taRef.current, alt, url)
      } catch (err) {
        fail(err)
      } finally {
        setUploads((n) => n - 1)
      }
    }
  }

  const setCover = async (file) => {
    if (!file) return
    setUploads((n) => n + 1)
    try {
      update('cover', await uploadFile(file))
    } catch (err) {
      fail(err)
    } finally {
      setUploads((n) => n - 1)
    }
  }

  // ---------- tags ----------

  const addTag = (raw) => {
    const tag = slugify(raw).slice(0, 30)
    if (tag && !post.tags.includes(tag) && post.tags.length < 12) update('tags', [...post.tags, tag])
    setTagDraft('')
  }

  const onTagKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(tagDraft)
    } else if (e.key === 'Backspace' && !tagDraft && post.tags.length) {
      update('tags', post.tags.slice(0, -1))
    }
  }

  // ---------- textarea ----------

  const format = (id) => FORMATS[id](taRef.current)

  const onEditorKey = (e) => {
    const mod = e.metaKey || e.ctrlKey
    if (mod && !e.shiftKey && SHORTCUTS[e.key.toLowerCase()]) {
      e.preventDefault()
      format(SHORTCUTS[e.key.toLowerCase()])
    }
  }

  const onPaste = (e) => {
    const files = [...(e.clipboardData?.files ?? [])].filter((f) => f.type.startsWith('image/'))
    if (files.length) {
      e.preventDefault()
      addImages(files)
    }
  }

  const onDrop = (e) => {
    if (e.dataTransfer?.files?.length) {
      e.preventDefault()
      addImages(e.dataTransfer.files)
    }
  }

  // Keeps the preview roughly in step with where you're typing.
  const syncScroll = () => {
    const ta = taRef.current
    const pv = previewRef.current
    if (!ta || !pv || view !== 'split') return
    const ratio = ta.scrollTop / Math.max(1, ta.scrollHeight - ta.clientHeight)
    pv.scrollTop = ratio * (pv.scrollHeight - pv.clientHeight)
  }

  const previewHtml = useMemo(() => {
    let html = marked.parse(post.body || '', { gfm: true })
    for (const [url, local] of Object.entries(localImages)) html = html.split(`src="${url}"`).join(`src="${local}"`)
    return html
  }, [post.body, localImages])

  const words = post.body.trim() ? post.body.trim().split(/\s+/).length : 0

  // ---------- render ----------

  if (loadState === 'loading') return <div className="admin-center admin-muted">Loading post…</div>
  if (loadState === 'error') {
    return (
      <div className="admin-center">
        <p className="admin-error">{loadError}</p>
        <Link to={base}>Back to posts</Link>
      </div>
    )
  }

  const leave = (e) => {
    if (dirty && !window.confirm('Leave without saving? Your changes stay backed up in this browser.')) e.preventDefault()
  }
  const slugChangedLive = isPublished && original && !original.path.endsWith(`-${post.slug}.md`)
  const coverSrc = post.cover ? localImages[post.cover] || post.cover : ''

  return (
    <div className="admin-editor">
      <header className="admin-editor-bar">
        <Link to={base} className="admin-link" onClick={leave}>
          ← Posts
        </Link>
        <span className={`admin-pill ${isPublished ? 'admin-pill--live' : 'admin-pill--draft'}`}>
          {isPublished ? 'Published' : original ? 'Draft' : 'New draft'}
        </span>
        <span className="admin-status" aria-live="polite">
          {busy ? 'Saving…' : uploads ? `Uploading ${uploads} image${uploads === 1 ? '' : 's'}…` : dirty ? 'Unsaved changes' : original ? 'All changes saved' : ''}
        </span>
        <div className="admin-editor-actions">
          {isPublished ? (
            <>
              <a className="admin-link" href={`/blog/${post.slug}`} target="_blank" rel="noreferrer">
                View live ↗
              </a>
              <button className="btn btn--ghost admin-btn" onClick={() => save('unpublish')} disabled={!!busy || !!uploads}>
                Unpublish
              </button>
              <button className="btn btn--primary admin-btn" onClick={() => save('publish')} disabled={!!busy || !!uploads || !dirty}>
                {busy === 'publish' ? 'Updating…' : 'Update'}
              </button>
            </>
          ) : (
            <>
              <button className="btn btn--ghost admin-btn" onClick={() => save('draft')} disabled={!!busy || !!uploads || (!dirty && !!original)}>
                {busy === 'draft' ? 'Saving…' : 'Save draft'}
              </button>
              <button className="btn btn--primary admin-btn" onClick={() => save('publish')} disabled={!!busy || !!uploads}>
                {busy === 'publish' ? 'Publishing…' : 'Publish'}
              </button>
            </>
          )}
        </div>
      </header>

      {backup && (
        <div className="admin-notice admin-notice--row">
          <span>Found unsaved changes from {new Date(backup.at).toLocaleString()} in this browser.</span>
          <span className="admin-row">
            <button
              className="admin-link"
              onClick={() => {
                setPost(backup.post)
                setSlugTouched(true)
                setBackup(null)
              }}
            >
              Restore
            </button>
            <button
              className="admin-link"
              onClick={() => {
                storage.remove(backupKey(original?.path))
                setBackup(null)
              }}
            >
              Discard
            </button>
          </span>
        </div>
      )}
      {notice && (
        <p className={notice.kind === 'error' ? 'admin-error admin-banner' : 'admin-success admin-banner'} role={notice.kind === 'error' ? 'alert' : 'status'}>
          {notice.text}
        </p>
      )}

      <div className="admin-editor-grid">
        <section className="admin-compose">
          <input
            className="admin-title-input"
            placeholder="Post title"
            value={post.title}
            onChange={(e) => update('title', e.target.value)}
            aria-label="Title"
          />

          <div className="admin-toolbar" role="toolbar" aria-label="Formatting">
            <div className="admin-toolbar-buttons">
              {TOOLBAR.map((b, i) =>
                b ? (
                  <button
                    key={b.id}
                    type="button"
                    className={b.className}
                    title={b.title}
                    aria-label={b.title}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => format(b.id)}
                    disabled={view === 'preview'}
                  >
                    {b.label}
                  </button>
                ) : (
                  <span key={`sep${i}`} className="admin-toolbar-sep" aria-hidden="true" />
                ),
              )}
              <label className={`admin-toolbar-file ${view === 'preview' ? 'is-disabled' : ''}`} title="Insert image (or paste / drop one)">
                Image
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                  multiple
                  disabled={view === 'preview'}
                  onChange={(e) => {
                    addImages(e.target.files)
                    e.target.value = ''
                  }}
                />
              </label>
            </div>
            <div className="admin-view-toggle" role="group" aria-label="View">
              {['write', 'split', 'preview'].map((v) => (
                <button key={v} type="button" aria-pressed={view === v} className={view === v ? 'is-active' : ''} onClick={() => setView(v)}>
                  {v[0].toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className={`admin-panes admin-panes--${view}`}>
            {view !== 'preview' && (
              <textarea
                ref={taRef}
                className="admin-textarea"
                value={post.body}
                onChange={(e) => update('body', e.target.value)}
                onKeyDown={onEditorKey}
                onPaste={onPaste}
                onDrop={onDrop}
                onDragOver={(e) => e.preventDefault()}
                onScroll={syncScroll}
                placeholder={'Write in Markdown.\n\n## A heading\n\nA paragraph with **bold**, _italics_ and a [link](https://satwik.info).\n\nPaste or drop images straight in.'}
                spellCheck
                aria-label="Post body (Markdown)"
              />
            )}
            {view !== 'write' && (
              <div
                className="admin-preview"
                ref={previewRef}
                onClick={(e) => {
                  // Links in the preview open in a new tab instead of leaving the editor.
                  const a = e.target.closest('a[href]')
                  if (!a) return
                  e.preventDefault()
                  window.open(a.href, '_blank', 'noopener')
                }}
              >
                {post.cover && view === 'preview' && <img className="post-cover" src={coverSrc} alt="" />}
                {view === 'preview' && <h1 className="post-title">{post.title || 'Untitled'}</h1>}
                {post.body.trim() ? (
                  <article className="post-body" dangerouslySetInnerHTML={{ __html: previewHtml }} />
                ) : (
                  <p className="admin-muted">The preview shows up here as you write.</p>
                )}
              </div>
            )}
          </div>

          <p className="admin-stats">
            {words.toLocaleString()} words · {readingMinutes(post.body || ' ')} min read · Ctrl+S saves
          </p>
        </section>

        <aside className="admin-details" aria-label="Post details">
          <h2>Details</h2>

          <label className="admin-field">
            <span>URL</span>
            <div className="admin-slug">
              <span>/blog/</span>
              <input
                value={post.slug}
                onChange={(e) => {
                  setSlugTouched(true)
                  update('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-{2,}/g, '-'))
                }}
                onBlur={() => update('slug', slugify(post.slug))}
                placeholder="post-url"
              />
            </div>
            {slugChangedLive && <small className="admin-warn">Changing a live post's URL breaks links to the old one.</small>}
          </label>

          <label className="admin-field">
            <span>Date</span>
            <input type="date" value={post.date} onChange={(e) => update('date', e.target.value)} />
          </label>

          <label className="admin-field">
            <span>Summary</span>
            <textarea
              rows={3}
              maxLength={500}
              value={post.summary}
              onChange={(e) => update('summary', e.target.value)}
              placeholder="One or two sentences for the blog index and RSS."
            />
            <small>{post.summary.length}/500</small>
          </label>

          <div className="admin-field">
            <span>Tags</span>
            <div className="admin-tags" onClick={(e) => e.currentTarget.querySelector('input')?.focus()}>
              {post.tags.map((t) => (
                <span key={t} className="admin-tag">
                  #{t}
                  <button type="button" aria-label={`Remove tag ${t}`} onClick={() => update('tags', post.tags.filter((x) => x !== t))}>
                    ×
                  </button>
                </span>
              ))}
              <input
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={onTagKey}
                onBlur={() => tagDraft && addTag(tagDraft)}
                placeholder={post.tags.length ? '' : 'Add a tag, press Enter'}
                aria-label="Add tag"
              />
            </div>
          </div>

          <div className="admin-field">
            <span>Cover image</span>
            {post.cover ? (
              <div className="admin-cover">
                <img src={coverSrc} alt="" />
                <button type="button" className="admin-link admin-link--danger" onClick={() => update('cover', '')}>
                  Remove
                </button>
              </div>
            ) : (
              <label className="admin-dropzone">
                Choose an image
                <input type="file" accept="image/png,image/jpeg,image/webp,image/avif" onChange={(e) => setCover(e.target.files[0])} />
              </label>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
