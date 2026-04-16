import { useState } from 'react'
import { profile } from '../../data/profile'

const s = {
  wrap: { padding: 24, overflowY: 'auto', height: '100%', fontFamily: 'var(--font-ui)' },
  section: { marginBottom: 24 },
  h3: { fontSize: 16, fontWeight: 600, marginBottom: 12, color: 'var(--text-primary)' },
  method: {
    display: 'flex', gap: 12, alignItems: 'center', padding: '12px 16px',
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 8, textDecoration: 'none', color: 'var(--text-primary)', marginBottom: 8,
  },
  methodIcon: { fontSize: 24, flexShrink: 0 },
  methodLabel: { fontSize: 13, fontWeight: 600 },
  methodValue: { fontSize: 12, color: 'var(--text-muted)' },
  input: {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)',
    color: 'var(--text-primary)', fontSize: 14, fontFamily: 'inherit',
    outline: 'none', marginBottom: 8, boxSizing: 'border-box',
  },
  textarea: {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)',
    color: 'var(--text-primary)', fontSize: 14, fontFamily: 'inherit',
    outline: 'none', minHeight: 100, resize: 'vertical', marginBottom: 8, boxSizing: 'border-box',
  },
  sendBtn: {
    padding: '10px 20px', borderRadius: 8, background: 'var(--accent)',
    color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14,
  },
}

export default function ContactApp() {
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')

  const send = () => {
    if (!name || !msg) return
    const mailto = `mailto:${profile.email}?subject=${encodeURIComponent('포트폴리오 메시지 from ' + name)}&body=${encodeURIComponent(msg)}`
    window.open(mailto)
    setName('')
    setMsg('')
  }

  return (
    <div style={s.wrap}>
      <div style={s.section}>
        <h3 style={s.h3}>연락 방법</h3>
        <a style={s.method} href={`mailto:${profile.email}`}>
          <span style={s.methodIcon}>📧</span>
          <div>
            <div style={s.methodLabel}>이메일</div>
            <div style={s.methodValue}>{profile.email}</div>
          </div>
        </a>
        {profile.links.map(l => (
          <a key={l.label} style={s.method} href={l.url} target="_blank" rel="noopener">
            <span style={s.methodIcon}>🔗</span>
            <div>
              <div style={s.methodLabel}>{l.label}</div>
              <div style={s.methodValue}>{l.url.replace('https://', '').replace('mailto:', '')}</div>
            </div>
          </a>
        ))}
      </div>

      <div style={s.section}>
        <h3 style={s.h3}>메시지 보내기</h3>
        <input style={s.input} placeholder="이름" value={name} onChange={e => setName(e.target.value)} />
        <textarea style={s.textarea} placeholder="메시지를 입력하세요..." value={msg} onChange={e => setMsg(e.target.value)} />
        <button style={s.sendBtn} onClick={send}>📨 전송</button>
      </div>
    </div>
  )
}
