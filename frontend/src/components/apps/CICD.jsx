import { useState, useEffect, useRef } from 'react'

const s = {
  wrap: { height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-ui)' },
  header: { padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', flexShrink: 0 },
  content: { flex: 1, overflowY: 'auto', padding: 14 },
  pipelineCard: { padding: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, marginBottom: 10 },
  pipelineName: { fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 },
  stepList: { fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 },
  runBtn: { padding: '6px 14px', borderRadius: 6, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12 },
  logBox: { marginTop: 10, background: 'rgba(0,0,0,0.3)', borderRadius: 6, padding: 10, maxHeight: 300, overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.6, color: 'var(--text-secondary)' },
  logLine: (line) => ({ color: line.startsWith('✓') ? '#22c55e' : line.startsWith('✗') ? '#ef4444' : line.startsWith('>>>') ? 'var(--accent)' : line.startsWith('$') ? '#fbbf24' : 'var(--text-secondary)' }),
  statusBadge: (st) => ({ fontSize: 11, padding: '2px 8px', borderRadius: 10, marginLeft: 8, background: st === 'passed' ? 'rgba(34,197,94,0.15)' : st === 'failed' ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)', color: st === 'passed' ? '#22c55e' : st === 'failed' ? '#ef4444' : '#3b82f6' }),
  empty: { padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 },
}

export default function CICDApp() {
  const [pipelines, setPipelines] = useState([])
  const [logs, setLogs] = useState([])
  const [runStatus, setRunStatus] = useState(null)
  const [running, setRunning] = useState(false)
  const logRef = useRef(null)

  useEffect(() => {
    fetch('/api/cicd/pipelines').then(r => r.json()).then(d => { if (Array.isArray(d)) setPipelines(d) }).catch(() => {})
  }, [])

  const runPipeline = async (pipelineId) => {
    setLogs([])
    setRunStatus(null)
    setRunning(true)

    try {
      const resp = await fetch(`/api/cicd/run/${pipelineId}`, { method: 'POST' })
      const data = await resp.json()
      if (!data.run_id) { setRunning(false); return }

      // Connect WS for log streaming
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const ws = new WebSocket(`${protocol}//${window.location.host}/api/cicd/ws/${data.run_id}`)
      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data)
        if (msg.type === 'log') {
          setLogs(prev => [...prev, msg.line])
        } else if (msg.type === 'done') {
          setRunStatus(msg.status)
          setRunning(false)
          ws.close()
        }
      }
      ws.onerror = () => { setRunning(false) }
    } catch { setRunning(false) }
  }

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [logs])

  return (
    <div style={s.wrap}>
      <div style={s.header}>CI/CD 러너</div>
      <div style={s.content}>
        {pipelines.length === 0 && (
          <div style={s.empty}>
            파이프라인이 없습니다.<br/>백엔드 실행 후 <code>/api/cicd/pipelines</code>에 POST로 등록하세요.
            <pre style={{ textAlign: 'left', marginTop: 12, background: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 6, fontSize: 11 }}>
{`{
  "id": "build-test",
  "name": "빌드 & 테스트",
  "cwd": "/home/user/project",
  "steps": [
    {"name": "Install", "command": "npm install"},
    {"name": "Test", "command": "npm test"}
  ]
}`}
            </pre>
          </div>
        )}

        {pipelines.map(p => (
          <div key={p.id} style={s.pipelineCard}>
            <div style={s.pipelineName}>
              🔨 {p.name || p.id}
              {runStatus && <span style={s.statusBadge(runStatus)}>{runStatus}</span>}
            </div>
            <div style={s.stepList}>
              {(p.steps || []).map((st, i) => (
                <div key={i}>Step {i + 1}: {st.name} — <code>{st.command}</code></div>
              ))}
            </div>
            <button style={s.runBtn} onClick={() => runPipeline(p.id)} disabled={running}>
              {running ? '⏳ 실행 중...' : '▶ 실행'}
            </button>
          </div>
        ))}

        {logs.length > 0 && (
          <div style={s.logBox} ref={logRef}>
            {logs.map((line, i) => (
              <div key={i} style={s.logLine(line)}>{line}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
