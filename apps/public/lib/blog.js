import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

const BLOG_DIR = path.join(process.cwd(), '..', '..', 'content', 'blog')

/**
 * Read all markdown files, return published posts sorted by date desc.
 * Frontmatter with `published: true` is required for inclusion.
 */
export function getAllPosts() {
  if (!fs.existsSync(BLOG_DIR)) return []
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'))
  const posts = files
    .map((file) => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8')
      const { data, content } = matter(raw)
      return {
        ...data,
        slug: data.slug || file.replace(/\.md$/, ''),
        body: content,
      }
    })
    .filter((p) => p.published === true)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
  return posts
}

export function getPostBySlug(slug) {
  const posts = getAllPosts()
  return posts.find((p) => p.slug === slug) || null
}

export async function renderMarkdown(md) {
  const processed = await remark().use(html).process(md)
  return processed.toString()
}
