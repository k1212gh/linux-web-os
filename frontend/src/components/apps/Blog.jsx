import { useState } from 'react'

const initialPosts = [
  {
    id: 'project-log-2026-04-16-agentos',
    title: 'AgentOS 포트폴리오 프로젝트 시작',
    date: '2026-04-16',
    category: 'Project Log',
    tags: ['agentos', 'portfolio', 'web-os', 'claude-code', 'react'],
    summary: 'Web OS 스타일의 인터랙티브 포트폴리오 사이트를 Claude Code와 함께 개발했다.',
    content: `<h3>오늘 한 일</h3>
<p>CLI 기반 에이전틱 AI 워크플로우 분석 보고서를 <strong>Web OS 인터페이스</strong>로 구현하는 프로젝트를 시작했다.</p>
<h3>구현 과정</h3>
<ol>
<li>바닐라 JS로 프로토타입 → 포트폴리오 확장 계획 → linux-web-os 기반 React로 전환</li>
<li>Claude Code 전용 앱, Git 대시보드, CI/CD 러너 등 개발 도구 추가 계획</li>
<li>WSL에서 FastAPI 백엔드와 함께 실행</li>
</ol>
<h3>기술 스택</h3>
<pre><code>Frontend: React 18 + Vite + Zustand + react-rnd
Backend:  FastAPI + WebSocket PTY
AI:       Claude Code 전용 앱 (WebSocket)
DevOps:   WSL + Tailscale</code></pre>`,
    source: 'auto-generated',
  },
]

const catColors = { TIL: '#3b82f6', 'Project Log': '#22c55e', Tutorial: '#fbbf24' }

const s = {
  wrap: { display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'var(--font-ui)' },
  tabs: { display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 },
  tab: (active) => ({
    padding: '10px 16px', fontSize: 13, cursor: 'pointer', background: 'none', border: 'none',
    borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
    color: active ? 'var(--accent)' : 'var(--text-secondary)',
  }),
  layout: { display: 'flex', flex: 1, overflow: 'hidden' },
  sidebar: { width: 220, flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.06)', overflowY: 'auto' },
  cats: { padding: 8, borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 2 },
  catBtn: (active) => ({
    padding: '6px 12px', borderRadius: 6, background: active ? 'rgba(59,130,246,0.15)' : 'none',
    border: 'none', textAlign: 'left', fontSize: 12, cursor: 'pointer',
    color: active ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: active ? 600 : 400,
  }),
  postItem: (active) => ({
    padding: 10, borderRadius: 6, cursor: 'pointer', marginBottom: 2,
    background: active ? 'rgba(59,130,246,0.1)' : 'transparent',
  }),
  postDate: { fontSize: 11, color: 'var(--text-muted)' },
  postTitle: { fontSize: 13, fontWeight: 500, margin: '2px 0', color: 'var(--text-primary)' },
  postTags: { display: 'flex', gap: 4 },
  tag: { fontSize: 10, padding: '1px 6px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' },
  reader: { flex: 1, overflowY: 'auto', padding: 24 },
  articleHeader: { display: 'flex', gap: 8, marginBottom: 12 },
  catBadge: (cat) => ({ padding: '3px 10px', borderRadius: 10, fontSize: 11, color: '#fff', background: catColors[cat] || '#888' }),
  autoBadge: { fontSize: 11, color: 'var(--text-muted)' },
  articleH1: { fontSize: 22, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' },
  articleMeta: { fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 16, marginBottom: 20 },
  articleBody: { fontSize: 14, lineHeight: 1.8, color: 'var(--text-primary)' },
}

export default function BlogApp() {
  const [tab, setTab] = useState('posts')
  const [catFilter, setCatFilter] = useState('All')
  const [selectedPost, setSelectedPost] = useState(initialPosts[0])

  const filtered = catFilter === 'All' ? initialPosts : initialPosts.filter(p => p.category === catFilter)

  return (
    <div style={s.wrap}>
      <div style={s.tabs}>
        <button style={s.tab(tab === 'posts')} onClick={() => setTab('posts')}>📝 포스트</button>
        <button style={s.tab(tab === 'guide')} onClick={() => setTab('guide')}>📖 가이드</button>
      </div>

      {tab === 'posts' && (
        <div style={s.layout}>
          <div style={s.sidebar}>
            <div style={s.cats}>
              {['All', 'TIL', 'Project Log', 'Tutorial'].map(c => (
                <button key={c} style={s.catBtn(catFilter === c)} onClick={() => setCatFilter(c)}>{c}</button>
              ))}
            </div>
            <div style={{ padding: 4 }}>
              {filtered.map(p => (
                <div key={p.id} style={s.postItem(selectedPost?.id === p.id)} onClick={() => setSelectedPost(p)}>
                  <div style={s.postDate}>{p.date}</div>
                  <div style={s.postTitle}>{p.title}</div>
                  <div style={s.postTags}>
                    {p.tags.slice(0, 3).map(t => <span key={t} style={s.tag}>{t}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={s.reader}>
            {selectedPost && (
              <article>
                <div style={s.articleHeader}>
                  <span style={s.catBadge(selectedPost.category)}>{selectedPost.category}</span>
                  {selectedPost.source === 'auto-generated' && <span style={s.autoBadge}>🤖 자동 생성</span>}
                </div>
                <h1 style={s.articleH1}>{selectedPost.title}</h1>
                <div style={s.articleMeta}>
                  <span>📅 {selectedPost.date}</span>
                  <span>{selectedPost.tags.map(t => '#' + t).join(' ')}</span>
                </div>
                <div style={s.articleBody} dangerouslySetInnerHTML={{ __html: selectedPost.content }} />
              </article>
            )}
          </div>
        </div>
      )}

      {tab === 'guide' && (
        <div style={{ ...s.reader, padding: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>Claude Code 셋업 가이드</h2>
          <h3 style={{ fontSize: 16, color: 'var(--accent)', marginTop: 16, marginBottom: 8 }}>Skills 설정</h3>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-primary)' }}>
            <code style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 3 }}>.claude/commands/</code> 디렉토리에 마크다운 파일로 정의합니다.
          </p>
          <pre style={{ background: '#0d1117', color: '#c9d1d9', padding: 12, borderRadius: 6, fontSize: 13, overflow: 'auto', margin: '8px 0' }}>
{`.claude/commands/blog.md  → /blog 스킬\n.claude/commands/review.md → /review 스킬`}
          </pre>
          <h3 style={{ fontSize: 16, color: 'var(--accent)', marginTop: 16, marginBottom: 8 }}>/blog 스킬 사용법</h3>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-primary)' }}>
            Claude Code에서 <code style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 3 }}>/blog</code>를 입력하면 현재 세션의 대화를 분석하여 블로그 포스트를 자동 생성합니다.
          </p>
        </div>
      )}
    </div>
  )
}
