import { Link, useSearchParams } from 'react-router-dom'
import Section from '../components/Section.jsx'
import { usePageTitle } from '../hooks/usePageTitle.js'
import { allTags, formatDate, posts } from '../data/blog.js'

// The post index. Filtering by tag lives in the query string (/blog?tag=react)
// so a filtered list is linkable and the post page's tag chips can point here.
export default function BlogPage() {
  usePageTitle('Blog')
  const [params, setParams] = useSearchParams()
  const active = params.get('tag')
  const shown = active ? posts.filter((p) => p.tags.includes(active)) : posts

  const pickTag = (tag) => {
    setParams(tag && tag !== active ? { tag } : {}, { replace: true })
  }

  return (
    <Section
      id="blog"
      title="Blog"
      lead="Notes on what I'm building, what broke, and what I learned fixing it."
      className="blog"
    >
      {allTags.length > 0 && (
        <div className="blog-tags" role="group" aria-label="Filter posts by tag">
          <button
            type="button"
            className={`blog-tag ${!active ? 'is-active' : ''}`}
            onClick={() => pickTag(null)}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`blog-tag ${tag === active ? 'is-active' : ''}`}
              aria-pressed={tag === active}
              onClick={() => pickTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {shown.length === 0 ? (
        <p className="blog-empty">
          {active ? `No posts tagged "${active}" yet.` : 'No posts yet. The first one is on its way.'}
        </p>
      ) : (
        <ul className="blog-list">
          {shown.map((post) => (
            <li key={post.slug}>
              <Link to={`/blog/${post.slug}`} className="blog-card">
                <p className="blog-meta">
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                  <span aria-hidden="true">·</span>
                  <span>{post.minutes} min read</span>
                  {post.draft && <span className="blog-draft">Draft</span>}
                </p>
                <h3>{post.title}</h3>
                {post.summary && <p className="blog-summary">{post.summary}</p>}
                {post.tags.length > 0 && (
                  <p className="blog-card-tags">
                    {post.tags.map((t) => (
                      <span key={t}>#{t}</span>
                    ))}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="blog-rss">
        <a href="/rss.xml">RSS feed</a>
      </p>
    </Section>
  )
}
