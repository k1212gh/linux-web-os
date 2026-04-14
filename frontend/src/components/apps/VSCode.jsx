import { useState, useEffect } from 'react'

export default function VSCodeApp() {
  const [tunnelUrl, setTunnelUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/services/vscode')
      .then((r) => r.json())
      .then((data) => {
        setTunnelUrl(data.url || '')
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [])

  if (loading) return <LoadingState label="VS Code 터널 확인 중..." />
  if (error || !tunnelUrl) return <SetupGuide />

  return (
    <iframe
      src={tunnelUrl}
      style={{ width: '100%', height: '100%', border: 'none' }}
      allow="clipboard-read; clipboard-write"
      title="VS Code"
    />
  )
}

function LoadingState({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%',
      flexDirection: 'column', gap: 12, color: 'var(--text-secondary)', background: '#1e1e2e' }}>
      <div style={{ fontSize: 28 }}>◈</div>
      <span style={{ fontSize: 13 }}>{label}</span>
      <div style={{ width: 120, height: 2, background: 'rgba(255,255,255,0.08)', borderRadius: 1, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: 'var(--accent)', width: '60%',
          animation: 'pulse 1.5s ease infinite', borderRadius: 1 }} />
      </div>
    </div>
  )
}

function SetupGuide() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 28,
      background: '#1e1e2e', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 24 }}>◈</span>
        <div>
          <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>VS Code 터널 미연결</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            아래 명령어로 터널을 시작하세요
          </div>
        </div>
      </div>

      {[
        { step: '1', title: 'VS Code 설치', cmd: 'sudo snap install code --classic' },
        { step: '2', title: '터널 시작', cmd: 'code tunnel --accept-server-license-terms' },
        { step: '3', title: '설정 파일에 URL 등록', cmd: '# .env 파일에 VSCODE_TUNNEL_URL=https://...' },
      ].map(({ step, title, cmd }) => (
        <div key={step} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8,
          border: '1px solid var(--border)', padding: '14px 16px' }}>
          <div style={{ fontSize: 11, color: 'var(--accent)', marginBottom: 6, fontWeight: 500 }}>
            STEP {step} — {title}
          </div>
          <code style={{ fontSize: 12, color: '#7ee787', fontFamily: 'var(--font-mono)',
            display: 'block', whiteSpace: 'pre-wrap' }}>{cmd}</code>
        </div>
      ))}

      <div style={{ background: 'rgba(59,130,246,0.08)', borderRadius: 8,
        border: '1px solid rgba(59,130,246,0.2)', padding: '12px 16px', fontSize: 12,
        color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        💡 Claude Code, Roo Code 등 모든 VS Code 확장 프로그램이 터널 환경에서 동일하게 동작합니다.
      </div>
    </div>
  )
}
