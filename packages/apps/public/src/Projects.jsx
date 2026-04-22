'use client'

import { useState } from 'react'
import { projects } from './data/projects'

const filters = [
  { key: 'all', label: '전체' },
  { key: 'in-progress', label: '진행중' },
  { key: 'completed', label: '완료' },
  { key: 'Web', label: 'Web' },
  { key: 'AI/ML', label: 'AI/ML' },
]

const s = {
  wrap: { padding: 16, height: '100%', overflowY: 'auto', fontFamily: 'var(--font-ui)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 },
  h3: { fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: 0 },
  filters: { display: 'flex', gap: 4, flexWrap: 'wrap' },
  filter: (active) => ({
    padding: '6px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer', border: 'none',
    background: active ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
    color: active ? '#fff' : 'var(--text-secondary)',
  }),
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 },
  card: (featured) => ({
    border: `1px solid ${featured ? 'var(--accent)' : 'rgba(255,255,255,0.06)'}`,
    borderRadius: 8, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s',
    background: 'var(--bg-window)',
  }),
  hero: { height: 80, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 40 },
  body: { padding: 12 },
  top: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { fontSize: 15, fontWeight: 600, margin: 0, color: 'var(--text-primary)' },
  status: (prog) => ({
    fontSize: 11, padding: '2px 8px', borderRadius: 10,
    background: prog ? 'rgba(251,191,36,0.15)' : 'rgba(34,197,94,0.15)',
    color: prog ? '#fbbf24' : '#22c55e',
  }),
  sub: { fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 },
  tags: { display: 'flex', gap: 4, flexWrap: 'wrap' },
  tag: { fontSize: 11, padding: '2px 8px', borderRadius: 10, background: 'rgba(59,130,246,0.15)', color: 'var(--accent)' },
  featured: { fontSize: 11, color: '#fbbf24', marginTop: 6 },
}

export default function ProjectsApp() {
  const [filter, setFilter] = useState('all')
  const [detail, setDetail] = useState(null)

  const filtered = projects.filter(p => {
    if (filter === 'all') return true
    if (filter === 'in-progress' || filter === 'completed') return p.status === filter
    return p.category.includes(filter)
  })

  if (detail) return <ProjectDetail project={detail} onBack={() => setDetail(null)} />

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <h3 style={s.h3}>프로젝트</h3>
        <div style={s.filters}>
          {filters.map(f => (
            <button key={f.key} style={s.filter(filter === f.key)} onClick={() => { setFilter(f.key); setDetail(null) }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div style={s.grid}>
        {filtered.map(p => (
          <div key={p.id} style={s.card(p.featured)} onClick={() => setDetail(p)}>
            <div style={s.hero}><span style={s.emoji}>{p.emoji}</span></div>
            <div style={s.body}>
              <div style={s.top}>
                <h4 style={s.title}>{p.title}</h4>
                <span style={s.status(p.status === 'in-progress')}>
                  {p.status === 'in-progress' ? '진행중' : '완료'}
                </span>
              </div>
              <p style={s.sub}>{p.subtitle}</p>
              <div style={s.tags}>
                {p.stack.slice(0, 3).map(t => <span key={t} style={s.tag}>{t}</span>)}
                {p.stack.length > 3 && <span style={{ ...s.tag, background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>+{p.stack.length - 3}</span>}
              </div>
              {p.featured && <div style={s.featured}>⭐ Featured</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProjectDetail({ project: p, onBack }) {
  const ds = {
    wrap: { height: '100%', overflowY: 'auto', fontFamily: 'var(--font-ui)' },
    back: { padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' },
    backBtn: { background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 13 },
    hero: { height: 100, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    content: { padding: 24 },
    h1: { fontSize: 24, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' },
    sub: { fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 },
    meta: { display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 },
    section: { marginBottom: 20 },
    h3: { fontSize: 16, fontWeight: 600, color: 'var(--accent)', marginBottom: 8 },
    p: { fontSize: 14, lineHeight: 1.7, color: 'var(--text-primary)' },
    ul: { paddingLeft: 20 },
    li: { fontSize: 14, lineHeight: 1.7, marginBottom: 4, color: 'var(--text-primary)' },
    stackWrap: { display: 'flex', gap: 6, flexWrap: 'wrap' },
    stackTag: { fontSize: 12, padding: '4px 12px', borderRadius: 10, background: 'rgba(59,130,246,0.15)', color: 'var(--accent)' },
  }

  return (
    <div style={ds.wrap}>
      <div style={ds.back}>
        <button style={ds.backBtn} onClick={onBack}>← 목록으로</button>
      </div>
      <div style={ds.hero}><span style={{ fontSize: 56 }}>{p.emoji}</span></div>
      <div style={ds.content}>
        <h1 style={ds.h1}>{p.title} {p.featured && '⭐'}</h1>
        <p style={ds.sub}>{p.subtitle}</p>
        <div style={ds.meta}>
          <span>{p.status === 'in-progress' ? '🟡 진행중' : '✅ 완료'}</span>
          <span>📅 {p.period}</span>
          <span>👤 {p.role}</span>
        </div>

        <div style={ds.section}>
          <h3 style={ds.h3}>기술 스택</h3>
          <div style={ds.stackWrap}>
            {p.stack.map(t => <span key={t} style={ds.stackTag}>{t}</span>)}
          </div>
        </div>

        <div style={ds.section}>
          <h3 style={ds.h3}>문제 정의</h3>
          <p style={ds.p}>{p.problem}</p>
        </div>

        <div style={ds.section}>
          <h3 style={ds.h3}>핵심 기능</h3>
          <ul style={ds.ul}>{p.features.map((f, i) => <li key={i} style={ds.li}>{f}</li>)}</ul>
        </div>

        <div style={ds.section}>
          <h3 style={ds.h3}>주요 성과 / 학습</h3>
          <ul style={ds.ul}>{p.achievements.map((a, i) => <li key={i} style={ds.li}>{a}</li>)}</ul>
        </div>
      </div>
    </div>
  )
}
