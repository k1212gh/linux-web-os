import { useState, useEffect } from 'react'

const s = {
  wrap: { height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-ui)', background: 'var(--bg-window)' },
  tabs: { display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0 },
  tab: (active) => ({ padding: '10px 16px', fontSize: 13, cursor: 'pointer', border: 'none', borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent', background: 'none', color: active ? 'var(--accent)' : 'var(--text-secondary)' }),
  body: { flex: 1, overflowY: 'auto' },
  header: { padding: '8px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  refreshBtn: { padding: '4px 10px', borderRadius: 6, background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' },
  row: { display: 'flex', padding: '10px 14px', borderBottom: '1px solid var(--border)', alignItems: 'center', gap: 10, fontSize: 12 },
  name: { flex: 1, color: 'var(--text-primary)', fontWeight: 500, fontFamily: 'var(--font-mono)' },
  image: { color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 11 },
  status: (running) => ({ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: running ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)', color: running ? '#22c55e' : 'var(--text-muted)' }),
  btn: { padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-hover)', color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer' },
  btnDanger: { padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: 11, cursor: 'pointer' },
  empty: { padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 },
  logBox: { background: '#0d1117', color: '#c9d1d9', padding: 12, fontFamily: 'var(--font-mono)', fontSize: 11, whiteSpace: 'pre-wrap', maxHeight: 400, overflowY: 'auto', borderRadius: 8 },
  backBtn: { padding: '4px 10px', borderRadius: 6, background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' },
}

export default function DockerApp() {
  const [tab, setTab] = useState('containers')
  const [containers, setContainers] = useState([])
  const [images, setImages] = useState([])
  const [error, setError] = useState(null)
  const [logs, setLogs] = useState(null)

  const loadContainers = () => {
    fetch('/api/infra/docker/containers').then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else { setContainers(d.containers || []); setError(null) } })
      .catch(() => setError('백엔드 연결 실패'))
  }
  const loadImages = () => {
    fetch('/api/infra/docker/images').then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else { setImages(d.images || []); setError(null) } })
      .catch(() => {})
  }

  useEffect(() => {
    if (tab === 'containers') loadContainers()
    if (tab === 'images') loadImages()
  }, [tab])

  const action = (path, id) => {
    fetch(`/api/infra/docker/${path}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ container_id: id }),
    }).then(r => r.json()).then(() => loadContainers())
  }

  const showLogs = (id) => {
    fetch(`/api/infra/docker/logs/${id}?tail=200`).then(r => r.json())
      .then(d => setLogs({ id, text: d.logs || '(empty)' }))
  }

  if (logs) return (
    <div style={s.wrap}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => setLogs(null)}>← 뒤로</button>
        <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)' }}>logs: {logs.id}</span>
        <div />
      </div>
      <div style={{ padding: 12 }}><div style={s.logBox}>{logs.text}</div></div>
    </div>
  )

  return (
    <div style={s.wrap}>
      <div style={s.tabs}>
        <button style={s.tab(tab === 'containers')} onClick={() => setTab('containers')}>컨테이너 ({containers.length})</button>
        <button style={s.tab(tab === 'images')} onClick={() => setTab('images')}>이미지 ({images.length})</button>
      </div>
      <div style={s.header}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Docker CLI 필요</span>
        <button style={s.refreshBtn} onClick={() => tab === 'containers' ? loadContainers() : loadImages()}>🔄 새로고침</button>
      </div>
      <div style={s.body}>
        {error && <div style={s.empty}>⚠️ {error}<br /><small>docker가 설치되어 있고 실행 중인지 확인하세요</small></div>}

        {tab === 'containers' && !error && containers.length === 0 && <div style={s.empty}>실행 중인 컨테이너가 없습니다</div>}
        {tab === 'containers' && containers.map(c => (
          <div key={c.id} style={s.row}>
            <div style={s.status(c.running)}>{c.running ? '실행' : '중지'}</div>
            <div style={s.name}>{c.name}<div style={s.image}>{c.image}</div></div>
            <div style={{ ...s.image, width: 140, textAlign: 'right' }}>{c.status}</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {c.running
                ? <button style={s.btnDanger} onClick={() => action('stop', c.id)}>⏹ 정지</button>
                : <button style={s.btn} onClick={() => action('start', c.id)}>▶ 시작</button>}
              <button style={s.btn} onClick={() => action('restart', c.id)}>🔄</button>
              <button style={s.btn} onClick={() => showLogs(c.id)}>📋 로그</button>
            </div>
          </div>
        ))}

        {tab === 'images' && !error && images.length === 0 && <div style={s.empty}>이미지가 없습니다</div>}
        {tab === 'images' && images.map((img, i) => (
          <div key={i} style={s.row}>
            <div style={s.name}>{img.repo}<div style={s.image}>:{img.tag}</div></div>
            <div style={{ ...s.image, width: 80, textAlign: 'right' }}>{img.size}</div>
            <div style={{ ...s.image, width: 120, textAlign: 'right' }}>{img.created}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
