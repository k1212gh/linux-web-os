'use client'

import { useState, useEffect } from 'react'

const s = {
  wrap: { height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-ui)', background: 'var(--bg-window)' },
  header: { padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 },
  title: { fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' },
  refreshBtn: { padding: '4px 12px', borderRadius: 6, background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' },
  body: { flex: 1, overflowY: 'auto', padding: 16 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 },
  card: (status) => ({
    padding: 14, background: 'var(--bg-card)', border: `1px solid ${status === 'ok' ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
    borderRadius: 10, cursor: status === 'ok' ? 'pointer' : 'default',
    transition: 'all 0.15s',
  }),
  cardHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 },
  cardIcon: { fontSize: 24 },
  cardName: { fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' },
  statusDot: (status) => ({
    width: 8, height: 8, borderRadius: '50%',
    background: status === 'ok' ? '#22c55e' : status === 'running' ? '#22c55e' : status === 'error' ? '#ef4444' : status === 'unreachable' ? 'rgba(255,255,255,0.2)' : '#f59e0b',
    boxShadow: status === 'ok' || status === 'running' ? '0 0 8px rgba(34,197,94,0.5)' : 'none',
  }),
  cardStatus: (status) => ({
    fontSize: 11,
    color: status === 'ok' || status === 'running' ? '#22c55e' : status === 'unreachable' ? 'var(--text-muted)' : status === 'error' ? '#ef4444' : 'var(--text-secondary)',
  }),
  cardHint: { fontSize: 11, color: 'var(--text-muted)', marginTop: 4 },
  cardCount: { fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 },
  iframe: { width: '100%', height: 600, border: '1px solid var(--border)', borderRadius: 10, background: '#1a1a2e' },
  empty: { padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 },
  backBtn: { padding: '4px 10px', borderRadius: 6, background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer', marginBottom: 12 },
}

const STATUS_LABEL = { ok: '실행 중', running: '실행 중', unreachable: '연결 안됨', error: '에러', not_installed: '미설치' }

export default function InfraDashboardApp() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [embed, setEmbed] = useState(null) // { name, url }

  const load = () => {
    setLoading(true)
    fetch('/api/infra/overview')
      .then(r => r.json())
      .then(d => { setServices(d.services || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load(); const iv = setInterval(load, 10000); return () => clearInterval(iv) }, [])

  // Embedded view
  if (embed) {
    return (
      <div style={s.wrap}>
        <div style={s.header}>
          <button style={s.backBtn} onClick={() => setEmbed(null)}>← 목록으로</button>
          <span style={s.title}>{embed.name}</span>
          <a href={embed.url} target="_blank" rel="noopener" style={s.refreshBtn}>↗ 새 탭에서 열기</a>
        </div>
        <div style={{ flex: 1, padding: 12 }}>
          <iframe src={embed.url} style={{ width: '100%', height: '100%', border: 'none', borderRadius: 10, background: '#0a0e1a' }} title={embed.name} />
        </div>
      </div>
    )
  }

  const cloud = services.filter(s => ['Jenkins', 'GitHub Actions'].includes(s.name))
  const infra = services.filter(s => ['Docker', 'Portainer'].includes(s.name))
  const monitoring = services.filter(s => ['Grafana', 'Prometheus'].includes(s.name))
  const ai = services.filter(s => ['Ollama'].includes(s.name))

  const Section = ({ title, items }) => items.length === 0 ? null : (
    <div style={s.section}>
      <div style={s.sectionTitle}>{title}</div>
      <div style={s.grid}>
        {items.map(sv => (
          <div key={sv.name} style={s.card(sv.status)}
            onClick={() => { if (sv.url && sv.status === 'ok') setEmbed({ name: sv.name, url: sv.url }) }}
            onMouseEnter={e => { if (sv.status === 'ok') e.currentTarget.style.borderColor = 'var(--accent)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = sv.status === 'ok' ? 'rgba(34,197,94,0.3)' : 'var(--border)' }}
          >
            <div style={s.cardHeader}>
              <span style={s.cardIcon}>{sv.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={s.cardName}>{sv.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <div style={s.statusDot(sv.status)} />
                  <span style={s.cardStatus(sv.status)}>{STATUS_LABEL[sv.status] || sv.status}</span>
                </div>
              </div>
            </div>
            <div style={s.cardHint}>{sv.hint}</div>
            {sv.count !== undefined && sv.status !== 'not_installed' && <div style={s.cardCount}>{sv.count}개 실행 중</div>}
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <span style={s.title}>🏗 인프라 대시보드</span>
        <button style={s.refreshBtn} onClick={load}>🔄 새로고침</button>
      </div>
      <div style={s.body}>
        {loading && services.length === 0 && <div style={s.empty}>백엔드에서 서비스 상태 로딩 중...</div>}
        <Section title="CI/CD" items={cloud} />
        <Section title="컨테이너" items={infra} />
        <Section title="모니터링" items={monitoring} />
        <Section title="AI" items={ai} />
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>
          💡 녹색 카드 클릭 → iframe으로 열기. 설정 앱에서 각 서비스 URL/토큰을 등록하세요.
        </div>
      </div>
    </div>
  )
}
