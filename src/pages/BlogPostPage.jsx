import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Section from '../components/Section.jsx'
import NotFoundPage from './NotFoundPage.jsx'
import { usePageTitle } from '../hooks/usePageTitle.js'
import { formatDate, getPost, posts, renderPost } from '../data/blog.js'

export default function BlogPostPage() {
  const { slug } = useParams()
  const post = getPost(slug)
  // Hooks have to run unconditionally, so the title falls back to undefined
  // and NotFoundPage sets its own.
  usePageTitle(post?.title)
  const navigate = useNavigate()
  const html = useMemo(() => (post ? renderPost(post) : ''), [post])

  if (!post) return <NotFoundPage />

  // posts is newest-first, so the entry before this one is the newer post.
  const i = posts.indexOf(post)
  const newer = posts[i - 1]
  const older = posts[i + 1]

  // Links written in Markdown render as plain <a> tags. Route same-site ones
  // through the router so following them doesn't reload the whole app.
  const onBodyClick = (e) => {
    const a = e.target.closest('a')
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return
    const url = new URL(a.href, window.location.href)
    if (url.origin !== window.location.origin || a.target || url.pathname.startsWith('/api/')) return
    if (/\.\w+$/.test(url.pathname)) return // files like /resume.pdf
    e.preventDefault()
    navigate(url.pathname + url.search + url.hash)
  }

  return (
    <Section id="post" className="post">
      <Link to="/blog" className="post-back">
        ← All posts
      </Link>
      <header className="post-head">
        <p className="blog-meta">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.minutes} min read</span>
          {post.draft && <span className="blog-draft">Draft</span>}
        </p>
        <h1 className="post-title">{post.title}</h1>
        {post.summary && <p className="post-summary">{post.summary}</p>}
        {post.tags.length > 0 && (
          <p className="blog-card-tags">
            {post.tags.map((t) => (
              <Link key={t} to={`/blog?tag=${encodeURIComponent(t)}`}>
                #{t}
              </Link>
            ))}
          </p>
        )}
      </header>

      {post.cover && <img className="post-cover" src={post.cover} alt="" />}

      {/* Post bodies are Markdown files committed to this repo, not visitor
          input, so rendering their HTML directly is safe. */}
      <article className="post-body" onClick={onBodyClick} dangerouslySetInnerHTML={{ __html: html }} />

      {(newer || older) && (
        <nav className="post-pager" aria-label="More posts">
          {older ? (
            <Link to={`/blog/${older.slug}`} className="post-pager-link">
              <span className="page-next-label">Older</span>
              <span>{older.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {newer && (
            <Link to={`/blog/${newer.slug}`} className="post-pager-link post-pager-link--next">
              <span className="page-next-label">Newer</span>
              <span>{newer.title}</span>
            </Link>
          )}
        </nav>
      )}
    </Section>
  )
}
