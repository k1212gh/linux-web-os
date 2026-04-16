const events = [
  { date: '2026.04', title: 'AgentOS 포트폴리오', desc: 'Web OS 스타일 인터랙티브 포트폴리오 개발', icon: '💻', active: true },
  { date: '2025.03', title: 'Synaptic 개발 시작', desc: '노션 시맨틱 검색 SaaS 프로젝트', icon: '🔍', active: true },
  { date: '2025.01', title: 'ALOE MCP Copilot', desc: 'MCP 기반 LLM 코파일럿 개발', icon: '🤖' },
  { date: '2024.11', title: 'Hecto AI Challenge', desc: 'EfficientNet-B4 + SBI 딥페이크 탐지', icon: '🔒' },
  { date: '2024.09', title: 'SSAFY 관통 프로젝트', desc: '멀티 서비스 백엔드 아키텍처', icon: '📡' },
  { date: '2024.07', title: 'SSAFY 14기 입과', desc: '삼성 청년 SW 아카데미 서울', icon: '🏫' },
  { date: '2019.03', title: '한국공학대학교 입학', desc: '컴퓨터공학과', icon: '🎓' },
]

const s = {
  wrap: { padding: 24, overflowY: 'auto', height: '100%', fontFamily: 'var(--font-ui)' },
  container: { position: 'relative', maxWidth: 600, margin: '0 auto' },
  line: {
    position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2,
    background: 'rgba(255,255,255,0.08)', transform: 'translateX(-50%)',
  },
  item: (i) => ({
    position: 'relative', display: 'flex', marginBottom: 32,
    flexDirection: i % 2 === 0 ? 'row-reverse' : 'row',
    paddingLeft: i % 2 === 0 ? 0 : '50%',
    paddingRight: i % 2 === 0 ? '50%' : 0,
  }),
  dot: (active) => ({
    position: 'absolute', left: '50%', transform: 'translateX(-50%)',
    width: 40, height: 40, borderRadius: '50%',
    background: 'var(--bg-window)', border: `2px solid ${active ? 'var(--accent)' : 'rgba(255,255,255,0.1)'}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 20, zIndex: 1,
    animation: active ? 'pulse 2s infinite' : 'none',
  }),
  card: {
    padding: 16, background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8,
    margin: '0 30px', maxWidth: 260,
  },
  date: { fontSize: 12, color: 'var(--accent)', fontWeight: 600 },
  title: { fontSize: 14, fontWeight: 600, margin: '4px 0', color: 'var(--text-primary)' },
  desc: { fontSize: 12, color: 'var(--text-muted)' },
  badge: { fontSize: 11, color: 'var(--accent)', marginTop: 4, display: 'inline-block' },
}

export default function TimelineApp() {
  return (
    <div style={s.wrap}>
      <div style={s.container}>
        <div style={s.line} />
        {events.map((ev, i) => (
          <div key={i} style={s.item(i)}>
            <div style={s.dot(ev.active)}>{ev.icon}</div>
            <div style={s.card}>
              <div style={s.date}>{ev.date}</div>
              <h4 style={s.title}>{ev.title}</h4>
              <p style={s.desc}>{ev.desc}</p>
              {ev.active && <span style={s.badge}>진행중</span>}
            </div>
          </div>
        ))}
      </div>
      <style>{`@keyframes pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.3); } 50% { box-shadow: 0 0 0 8px rgba(59,130,246,0); } }`}</style>
    </div>
  )
}
