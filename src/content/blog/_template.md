---
title: Post title
date: 2026-10-15
summary: One or two sentences shown on the blog index and in the RSS feed.
tags: [tag-one, tag-two]
draft: true
---

Copy this file to a new name without the leading underscore, for example
`2026-10-15-my-post.md`. The URL comes from the filename with the date prefix
removed, so that file is served at `/blog/my-post`. Set `slug:` in the header
to override it.

Fields:

- `title`, `date` (YYYY-MM-DD) and `summary` are what the index shows.
- `tags` is a bracketed, comma-separated list. Each tag gets a filter chip on `/blog`.
- `draft: true` keeps the post visible under `npm run dev` and out of production builds and the feed.
- `cover` (optional) is an image path shown above the post, such as `/blog/my-post/cover.jpg`.

Put images in `public/blog/<slug>/` and reference them as `![alt text](/blog/<slug>/photo.jpg)`.

Everything below the header is GitHub-flavored Markdown: headings, lists,
tables, `inline code`, fenced code blocks and plain links.
