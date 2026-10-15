---
title: Hello, blog
date: 2026-10-15
summary: This site has a blog now. Posts are Markdown files in the repo, and this is the first one.
tags: [meta, react]
draft: true
---

This site has a blog now. Each post is a Markdown file in `src/content/blog`,
and Vite bundles them into the site at build time, so there's no CMS or
database behind it.

## How a post gets published

1. Write a `.md` file with a short header for the title, date, summary and tags.
2. Push it.
3. Vercel rebuilds the site, and the post shows up at `/blog` and in the [RSS feed](/rss.xml).

Code blocks render the way you'd expect:

```js
const posts = import.meta.glob('../content/blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})
```

More soon.
