import { useState, useEffect } from 'react'

const s = {
  wrap: { height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-ui)' },
  toolbar: { padding: '8px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 },
  input: { flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 10px', color: 'var(--text-primary)', fontSize: 12, outline: 'none' },
  connectBtn: (ok) => ({ padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, background: ok ? '#22c55e' : 'var(--accent)', color: '#fff' }),
  frame: { flex: 1, border: 'none', width: '100%', height: '100%', background: '#1a1a2e' },
  empty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 40, textAlign: 'center', color: 'var(--text-muted)' },
  step: { padding: '10px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', fontSize: 12, textAlign: 'left', width: '100%', maxWidth: 420, lineHeight: 1.8 },
  code: { background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 11 },
}

const STORAGE_KEY = 'agentos-llm-dashboard-url'

export default function LLMDashboardApp() {
  const [url, setUrl] = useState(() => localStorage.getItem(STORAGE_KEY) || '')
  const [status, setStatus] = useState('idle') // idle | checking | ok | error
  const [connected, setConnected] = useState(false)

  const checkUrl = async (targetUrl) => {
    if (!targetUrl) return
    setStatus('checking')
    try {
      // Try via backend health check
      const resp = await fetch(`/api/services/llm-dashboard?url=${encodeURIComponent(targetUrl)}`)
      const data = await resp.json()
      if (data.status === 'ok') {
        setStatus('ok')
        setConnected(true)
        localStorage.setItem(STORAGE_KEY, targetUrl)
      } else {
        setStatus('error')
        // Still try direct — might work if same origin
        setConnected(true)
        localStorage.setItem(STORAGE_KEY, targetUrl)
      }
    } catch {
      // Backend not running, try direct load
      setConnected(true)
      setStatus('ok')
      localStorage.setItem(STORAGE_KEY, targetUrl)
    }
  }

  useEffect(() => {
    if (url) checkUrl(url)
  }, [])

  if (connected && url) {
    return (
      <div style={s.wrap}>
        <div style={s.toolbar}>
          <span style={{ fontSize: 13 }}>🤖</span>
          <input style={s.input} value={url} onChange={e => setUrl(e.target.value)} placeholder="LLM Dashboard URL" />
          <button style={s.connectBtn(status === 'ok')} onClick={() => checkUrl(url)}>
            {status === 'ok' ? '✓ 연결됨' : '연결'}
          </button>
          <button style={{ ...s.connectBtn(false), background: 'rgba(255,255,255,0.08)' }} onClick={() => setConnected(false)}>
            설정
          </button>
        </div>
        <iframe
          src={url}
          style={s.frame}
          allow="clipboard-read; clipboard-write; fullscreen"
          title="LLM Dashboard"
        />
      </div>
    )
  }

  return (
    <div style={s.wrap}>
      <div style={s.empty}>
        <div style={{ fontSize: 48 }}>🤖</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>LLM 대시보드</div>
        <div style={{ fontSize: 13, marginBottom: 8 }}>
          Open WebUI, Ollama Web UI 등 로컬 LLM 대시보드를 임베드합니다.
        </div>

        <div style={s.step}>
          <strong>STEP 1</strong> — Open WebUI 설치<br />
          <code style={s.code}>docker run -d -p 3000:8080 --name open-webui ghcr.io/open-webui/open-webui:main</code>
        </div>

        <div style={s.step}>
          <strong>STEP 2</strong> — Ollama 실행<br />
          <code style={s.code}>ollama serve</code> (기본 포트: 11434)
        </div>

        <div style={s.step}>
          <strong>STEP 3</strong> — URL 입력 후 연결<br />
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <input
              style={{ ...s.input, flex: 1 }}
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="http://localhost:3000"
            />
            <button style={s.connectBtn(false)} onClick={() => checkUrl(url)}>연결</button>
          </div>
        </div>

        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
          지원: Open WebUI · Ollama Web UI · text-generation-webui · LiteLLM
        </div>
      </div>
    </div>
  )
}
