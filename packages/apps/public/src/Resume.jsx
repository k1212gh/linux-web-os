'use client'

import { profile, resume } from './data/profile'
import { projects } from './data/projects'

const s = {
  wrap: { height: '100%', overflowY: 'auto', fontFamily: 'var(--font-ui)' },
  toolbar: { padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8 },
  btn: { padding: '6px 12px', borderRadius: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)', fontSize: 12, cursor: 'pointer' },
  content: { padding: 24 },
  header: { marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 16 },
  h1: { fontSize: 24, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' },
  section: { marginBottom: 24 },
  h2: { fontSize: 18, color: 'var(--accent)', marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 6, fontWeight: 600 },
  item: { display: 'flex', gap: 12, marginBottom: 12, fontSize: 14 },
  icon: { fontSize: 20, flexShrink: 0 },
  muted: { fontSize: 13, color: 'var(--text-muted)' },
  card: { padding: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, marginBottom: 8, cursor: 'pointer' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 4 },
  tag: { fontSize: 11, padding: '2px 8px', borderRadius: 10, background: 'rgba(59,130,246,0.15)', color: 'var(--accent)', marginRight: 4 },
  stackGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 },
  stackGroup: { padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 6 },
  stackTitle: { fontSize: 13, color: 'var(--accent)', marginBottom: 4, fontWeight: 600 },
  stackItems: { fontSize: 12, color: 'var(--text-secondary)' },
}

export default function ResumeApp() {
  return (
    <div style={s.wrap}>
      <div style={s.toolbar}>
        <button style={s.btn} onClick={() => window.print()}>🖨️ 인쇄</button>
      </div>
      <div style={s.content}>
        <div style={s.header}>
          <h1 style={s.h1}>{profile.name}</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '4px 0 0' }}>{profile.title}</p>
          <p style={s.muted}>{profile.email}</p>
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>학력</h2>
          {resume.education.map(e => (
            <div key={e.institution} style={s.item}>
              <span style={s.icon}>{e.icon}</span>
              <div>
                <strong>{e.institution}</strong><br />
                <span style={s.muted}>{e.degree} | {e.period}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>교육</h2>
          {resume.training.map(t => (
            <div key={t.institution} style={s.item}>
              <span style={s.icon}>{t.icon}</span>
              <div>
                <strong>{t.institution}</strong> — {t.detail}<br />
                <span style={s.muted}>{t.period}</span><br />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t.description}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>프로젝트 경험</h2>
          {projects.map(p => (
            <div key={p.id} style={s.card}>
              <div style={s.cardHeader}>
                <span>{p.emoji} <strong>{p.title}</strong></span>
                <span style={{ fontSize: 12 }}>{p.status === 'in-progress' ? '🟡 진행중' : '✅ 완료'}</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 6px' }}>{p.subtitle}</p>
              <div>
                {p.stack.slice(0, 4).map(t => <span key={t} style={s.tag}>{t}</span>)}
              </div>
            </div>
          ))}
        </div>

        <div style={s.section}>
          <h2 style={s.h2}>기술 스택</h2>
          <div style={s.stackGrid}>
            {Object.entries(resume.stackCategories).map(([cat, items]) => (
              <div key={cat} style={s.stackGroup}>
                <h4 style={s.stackTitle}>{cat}</h4>
                <p style={s.stackItems}>{items.join(', ')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
