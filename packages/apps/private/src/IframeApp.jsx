'use client'

import { useState, useEffect } from 'react'

const s = {
  wrap: { height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-ui)', background: 'var(--bg-window)' },
  toolbar: { padding: '6px 12px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 },
  status: (ok) => ({ width: 8, height: 8, borderRadius: '50%', background: ok ? '#22c55e' : '#ef4444', boxShadow: ok ? '0 0 6px rgba(34,197,94,0.5)' : 'none' }),
  label: { fontSize: 12, color: 'var(--text-secondary)' },
  btn: { padding: '4px 10px', borderRadius: 6, background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer' },
  iframe: { flex: 1, border: 'none', background: '#0a0e1a' },
  empty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center', color: 'var(--text-muted)', gap: 14 },
  code: { fontFamily: 'var(--font-mono)', fontSize: 11, background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 4 },
}

/**
 * Generic iframe app — reusable for Jenkins, Grafana, Portainer, etc.
 * Uses backend proxy to bypass X-Frame-Options.
 *
 * Props:
 *   service: service alias (e.g., "jenkins", "grafana")
 *   title: display name
 *   icon: emoji icon
 *   envKey: environment variable name for direct URL (e.g., "JENKINS_URL")
 *   setupHint: help text when service is unreachable
 */
export default function IframeApp({ service, title, icon, envKey, setupHint }) {
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    fetch('/api/infra/overview').then(r => r.json()).then(d => {
      const sv = d.services?.find(s => s.name.toLowerCase() === (service === 'jenkins' ? 'jenkins' : service === 'grafana' ? 'grafana' : service === 'portainer' ? 'portainer' : service === 'prometheus' ? 'prometheus' : service))
      setStatus(sv?.status || 'unreachable')
    }).catch(() => setStatus('unreachable'))
  }, [service])

  const proxyUrl = `/proxy/${service}/`
  const directHint = envKey

  if (status === 'checking') {
    return <div style={s.wrap}><div style={s.empty}>연결 확인 중...</div></div>
  }

  if (status !== 'ok') {
    return (
      <div style={s.wrap}>
        <div style={s.toolbar}>
          <div style={s.status(false)} />
          <span style={s.label}>{icon} {title} — 연결 안됨</span>
        </div>
        <div style={s.empty}>
          <div style={{ fontSize: 48 }}>{icon}</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{title} 가 실행 중이지 않습니다</div>
          <div style={{ fontSize: 13, lineHeight: 1.8, maxWidth: 480 }}>
            {setupHint}
          </div>
          <div style={{ fontSize: 11, marginTop: 8 }}>
            설정 앱에서 <span style={s.code}>{envKey}</span> 를 등록하세요
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={s.wrap}>
      <div style={s.toolbar}>
        <div style={s.status(true)} />
        <span style={s.label}>{icon} {title}</span>
        <div style={{ flex: 1 }} />
        <button style={s.btn} onClick={() => window.location.reload()}>🔄</button>
      </div>
      <iframe
        src={proxyUrl}
        style={s.iframe}
        title={title}
        allow="clipboard-read; clipboard-write; fullscreen"
      />
    </div>
  )
}
