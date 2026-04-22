import Link from 'next/link'
import { getAllPosts } from '@/../lib/blog'

export const metadata = {
  title: '블로그',
  description: '김건희의 개발 일지. 프로젝트 로그, 기술 노트, 실패와 배움.',
  openGraph: { title: '블로그 | 김건희', description: '개발 일지' },
}

export default function BlogIndex() {
  const posts = getAllPosts()

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '80px 24px', color: '#e6edf3', fontFamily: 'Geist, system-ui, sans-serif' }}>
      <header style={{ marginBottom: 48 }}>
        <Link href="/" style={{ fontSize: 13, color: '#8b95a9', textDecoration: 'none' }}>← 홈으로</Link>
        <h1 style={{ fontSize: 36, fontWeight: 700, marginTop: 12, marginBottom: 8 }}>블로그</h1>
        <p style={{ color: '#8b95a9', fontSize: 14 }}>{posts.length}개의 글</p>
      </header>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 32 }}>
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}/`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <article>
                <time style={{ fontSize: 12, color: '#8b95a9', fontFamily: 'JetBrains Mono, monospace' }}>{post.date}</time>
                <h2 style={{ fontSize: 22, fontWeight: 600, margin: '4px 0 10px' }}>{post.title}</h2>
                <p style={{ color: '#b1bac4', fontSize: 14, lineHeight: 1.65 }}>{post.summary}</p>
                {post.tags?.length > 0 && (
                  <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {post.tags.map((t) => (
                      <span key={t} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 12, background: 'rgba(59,130,246,0.1)', color: '#79c0ff', fontFamily: 'JetBrains Mono, monospace' }}>
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
