import { useState } from 'react'

const initialPosts = [
  {
    id: 'project-log-2026-04-17-sprint1',
    title: 'AgentOS Sprint 1 — 디자인/UX 오버홀',
    date: '2026-04-17',
    category: 'Project Log',
    tags: ['agentos', 'design', 'animation', 'dock', 'theme'],
    summary: '윈도우 닫기 애니메이션, Dock magnification, 스냅 프리뷰, 다크/라이트 테마를 구현했다.',
    content: `<h3>오늘 한 일</h3>
<p>AgentOS의 비주얼 퀄리티를 대폭 개선하는 Sprint 1을 완료했다.</p>
<h3>구현 내용</h3>
<ul>
<li><strong>윈도우 닫기 애니메이션</strong>: isClosing 상태로 2단계 분리. scale(0.9)+opacity 페이드 후 DOM 제거</li>
<li><strong>스냅 프리뷰</strong>: 드래그 중 가장자리 감지 → 파란 반투명 오버레이 + 좌/우 반화면 스냅</li>
<li><strong>배경 애니메이션</strong>: 5색 그래디언트 40초 주기 회전</li>
<li><strong>Dock Magnification</strong>: 코사인 거리 함수로 인접 아이콘 확대 (최대 1.35x)</li>
<li><strong>비활성 윈도우 dim</strong>: opacity 0.82 + brightness(0.75)</li>
<li><strong>다크/라이트 테마</strong>: CSS 변수 기반 전환</li>
</ul>
<h3>느낀 점</h3>
<p>CSS 변수와 Zustand 조합이 테마 시스템 구현에 매우 적합했다. 인라인 스타일에서도 <code>var(--accent)</code> 형태로 자연스럽게 사용 가능.</p>`,
    source: 'auto-generated',
  },
  {
    id: 'project-log-2026-04-16-agentos',
    title: 'AgentOS 포트폴리오 프로젝트 시작 — 이틀의 기록',
    date: '2026-04-16',
    category: 'Project Log',
    tags: ['agentos', 'portfolio', 'web-os', 'claude-code', 'react'],
    summary: 'Web OS 스타일의 인터랙티브 포트폴리오 사이트를 Claude Code와 함께 이틀 만에 구축했다.',
    content: `<h3>시작</h3>
<p>CLI 기반 에이전틱 AI 워크플로우 분석 보고서를 <strong>Web OS 인터페이스</strong>로 구현하는 프로젝트를 시작했다. 바닐라 JS 프로토타입 → React 전환 → linux-web-os 기반 확장까지 하루 만에 진행.</p>
<h3>구현 과정</h3>
<ol>
<li>바닐라 JS로 윈도우 매니저 프로토타입 (CSS 테마, Canvas 차트)</li>
<li>규모 확장을 위해 React + Zustand + react-rnd로 전환</li>
<li>기존 linux-web-os 레포를 포크하여 19개 앱 추가</li>
<li>FastAPI 백엔드에 Claude Code, Git, CI/CD, 파일 관리자 등 라우터 추가</li>
</ol>
<h3>최종 아키텍처</h3>
<pre><code>Frontend: React 18 + Vite + Zustand + react-rnd
Backend:  FastAPI + WebSocket PTY + Ollama
Apps:     19개 (터미널, VS Code, Claude Code, Git, CI/CD, 파일매니저 등)
DevOps:   WSL + Tailscale + systemd</code></pre>`,
    source: 'auto-generated',
  },
  {
    id: 'til-2025-03-mcp-protocol',
    title: 'MCP Protocol — AI 도구의 새로운 표준',
    date: '2025-03',
    category: 'TIL',
    tags: ['mcp', 'llm', 'tool-use', 'anthropic'],
    summary: 'ALOE MCP Copilot 프로젝트에서 Model Context Protocol을 실전 적용하며 배운 것들.',
    content: `<h3>MCP란?</h3>
<p><strong>Model Context Protocol</strong>은 AI 모델이 외부 도구와 데이터 소스에 접근하는 방법을 표준화한 프로토콜이다. Anthropic이 주도하고 있으며 Claude Code의 핵심 기반이다.</p>
<h3>실전 적용</h3>
<p>ALOE 로그 분석 도구에 MCP 기반 LLM 코파일럿을 붙이면서 배운 것:</p>
<ul>
<li>Tool Use 패턴: LLM이 "어떤 도구를 호출할지" 결정하고, 결과를 다시 받아 추론하는 루프</li>
<li>자연어 → 구조화된 쿼리 변환이 예상보다 정확도가 높았음</li>
<li>컨텍스트 윈도우 관리가 핵심 — 로그 데이터가 크면 청크 분할 필요</li>
</ul>
<h3>핵심 교훈</h3>
<p>MCP는 "AI에게 도구를 주는" 표준. 앞으로 모든 SaaS가 MCP 서버를 제공하게 될 것.</p>`,
    source: 'manual',
  },
  {
    id: 'til-2024-11-sbi-deepfake',
    title: 'Self-Blended Images — 딥페이크 탐지의 핵심',
    date: '2024-11',
    category: 'TIL',
    tags: ['deepfake', 'sbi', 'efficientnet', 'pytorch', 'competition'],
    summary: 'Hecto AI Challenge에서 SBI 방법론을 적용하며 배운 딥페이크 탐지 기술.',
    content: `<h3>문제</h3>
<p>단일 모델로 딥페이크 이미지를 정확히 탐지해야 한다. 60분 이내 L40S GPU에서 오프라인 추론.</p>
<h3>SBI(Self-Blended Images)란?</h3>
<p>원본 이미지의 얼굴 영역을 자기 자신과 블렌딩하여 가짜 이미지를 생성하는 데이터 증강 기법. 실제 딥페이크의 아티팩트를 모방한다.</p>
<ul>
<li>장점: 별도 생성 모델 없이 학습 데이터를 무한히 만들 수 있음</li>
<li>단점: 블렌딩 강도 튜닝이 까다로움</li>
</ul>
<h3>결과</h3>
<p>EfficientNet-B4 + SBI로 학습 → 검증 세트에서 준수한 성능 달성. 제한된 자원에서의 추론 최적화가 핵심이었다.</p>`,
    source: 'manual',
  },
  {
    id: 'tutorial-2024-transfer-learning',
    title: 'Transfer Learning 실전 가이드 (ResNet-18, ViT)',
    date: '2024',
    category: 'Tutorial',
    tags: ['transfer-learning', 'resnet', 'vit', 'pytorch', 'hancom'],
    summary: '한컴 AI 아카데미에서 진행한 Transfer Learning 실습을 정리한 가이드.',
    content: `<h3>Transfer Learning이란?</h3>
<p>ImageNet 등 대규모 데이터셋에서 사전 학습된 모델의 가중치를 가져와 내 데이터에 미세 조정(fine-tuning)하는 기법.</p>
<h3>실습 내용</h3>
<ol>
<li><strong>ResNet-18</strong>: 마지막 FC 레이어만 교체 후 학습. 5 에포크만에 90%+ 정확도</li>
<li><strong>Vision Transformer</strong>: 패치 임베딩 + 어텐션 기반. ResNet보다 데이터 효율적</li>
</ol>
<h3>핵심 팁</h3>
<ul>
<li>학습률: 사전학습 레이어는 작게 (1e-5), 새 레이어는 크게 (1e-3)</li>
<li>데이터 증강: RandomHorizontalFlip + RandomRotation이 기본</li>
<li>조기 종료: val_loss 3 에포크 연속 개선 없으면 중단</li>
</ul>
<p>자세한 내용: <a href="https://k1212gh.tistory.com/" target="_blank">k1212gh.tistory.com</a></p>`,
    source: 'manual',
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
