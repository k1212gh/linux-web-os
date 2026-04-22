import { getAllPosts } from '@/../lib/blog'

const SITE = 'https://k1212gh.dev'

export default function sitemap() {
  const posts = getAllPosts()
  const staticRoutes = [
    { url: `${SITE}/`,       lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${SITE}/blog/`,  lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
  ]
  const blogRoutes = posts.map((p) => ({
    url: `${SITE}/blog/${p.slug}/`,
    lastModified: new Date(p.date),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))
  return [...staticRoutes, ...blogRoutes]
}
