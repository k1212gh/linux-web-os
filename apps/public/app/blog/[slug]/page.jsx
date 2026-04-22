import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllPosts, getPostBySlug, renderMarkdown } from '@/../lib/blog'

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }) {
  const post = getPostBySlug(params.slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: 'article',
      publishedTime: post.date,
      tags: post.tags,
    },
  }
}

export default async function BlogPost({ params }) {
  const post = getPostBySlug(params.slug)
  if (!post) notFound()
  const contentHtml = await renderMarkdown(post.body)

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '80px 24px 120px', color: '#e6edf3', fontFamily: 'Geist, system-ui, sans-serif' }}>
      <Link href="/blog/" style={{ fontSize: 13, color: '#8b95a9', textDecoration: 'none' }}>← 블로그</Link>
      <article style={{ marginTop: 16 }}>
        <header style={{ marginBottom: 36 }}>
          <time style={{ fontSize: 12, color: '#8b95a9', fontFamily: 'JetBrains Mono, monospace' }}>{post.date}</time>
          <h1 style={{ fontSize: 34, fontWeight: 700, margin: '6px 0 14px', lineHeight: 1.3 }}>{post.title}</h1>
          {post.summary && <p style={{ color: '#b1bac4', fontSize: 15, lineHeight: 1.65 }}>{post.summary}</p>}
          {post.tags?.length > 0 && (
            <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {post.tags.map((t) => (
                <span key={t} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 12, background: 'rgba(59,130,246,0.1)', color: '#79c0ff', fontFamily: 'JetBrains Mono, monospace' }}>
                  #{t}
                </span>
              ))}
            </div>
          )}
        </header>
        <div
          className="prose"
          style={{ fontSize: 15, lineHeight: 1.75, color: '#d1d5db' }}
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </article>
    </main>
  )
}
