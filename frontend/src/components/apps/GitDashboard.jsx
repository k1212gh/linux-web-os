import { useState, useEffect } from 'react'

const s = {
  wrap: { height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-ui)' },
  toolbar: { padding: '8px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 },
  select: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 8px', color: 'var(--text-primary)', fontSize: 12, outline: 'none', flex: 1, maxWidth: 300 },
  tabs: { display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 },
  tab: (a) => ({ padding: '8px 16px', fontSize: 12, cursor: 'pointer', border: 'none', borderBottom: a ? '2px solid var(--accent)' : '2px solid transparent', background: 'none', color: a ? 'var(--accent)' : 'var(--text-secondary)' }),
  content: { flex: 1, overflowY: 'auto', padding: 14 },
  branchItem: (current) => ({ padding: '8px 12px', borderRadius: 6, background: current ? 'rgba(59,130,246,0.12)' : 'transparent', display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, marginBottom: 2 }),
  commitItem: { padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 13 },
  hash: { fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', marginRight: 8 },
  date: { fontSize: 11, color: 'var(--text-muted)', float: 'right' },
  empty: { padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 },
  refreshBtn: { padding: '4px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' },
}

export default function GitDashboardApp() {
  const [repos, setRepos] = useState([])
  const [selectedRepo, setSelectedRepo] = useState('')
  const [tab, setTab] = useState('branches')
  const [branches, setBranches] = useState([])
  const [commits, setCommits] = useState([])
  const [status, setStatus] = useState(null)

  useEffect(() => {
    fetch('/api/git/repos').then(r => r.json()).then(d => { if (Array.isArray(d)) setRepos(d) }).catch(() => {})
  }, [])

  const refresh = () => {
    if (!selectedRepo) return
    fetch(`/api/git/branches?repo=${encodeURIComponent(selectedRepo)}`).then(r => r.json()).then(setBranches).catch(() => {})
    fetch(`/api/git/log?repo=${encodeURIComponent(selectedRepo)}`).then(r => r.json()).then(setCommits).catch(() => {})
    fetch(`/api/git/status?repo=${encodeURIComponent(selectedRepo)}`).then(r => r.json()).then(setStatus).catch(() => {})
  }

  useEffect(() => { refresh() }, [selectedRepo])

  return (
    <div style={s.wrap}>
      <div style={s.toolbar}>
        <span style={{ fontSize: 14 }}>📁</span>
        <select style={s.select} value={selectedRepo} onChange={e => setSelectedRepo(e.target.value)}>
          <option value="">레포 선택...</option>
          {repos.map(r => <option key={r.path} value={r.path}>{r.name}</option>)}
        </select>
        <button style={s.refreshBtn} onClick={refresh}>🔄</button>
      </div>
      <div style={s.tabs}>
        <button style={s.tab(tab === 'branches')} onClick={() => setTab('branches')}>브랜치</button>
        <button style={s.tab(tab === 'commits')} onClick={() => setTab('commits')}>커밋</button>
        <button style={s.tab(tab === 'status')} onClick={() => setTab('status')}>상태</button>
      </div>
      <div style={s.content}>
        {!selectedRepo && <div style={s.empty}>백엔드 실행 후 레포를 선택하세요.<br/>PROJECTS_BASE 환경변수로 기본 경로를 설정할 수 있습니다.</div>}

        {selectedRepo && tab === 'branches' && (
          branches.length ? branches.map((b, i) => (
            <div key={i} style={s.branchItem(b.current)}>
              {b.current && <span style={{ color: 'var(--accent)' }}>●</span>}
              <span>{b.name}</span>
            </div>
          )) : <div style={s.empty}>브랜치를 불러올 수 없습니다.</div>
        )}

        {selectedRepo && tab === 'commits' && (
          commits.length ? commits.map((c, i) => (
            <div key={i} style={s.commitItem}>
              <span style={s.hash}>{c.hash}</span>
              <span>{c.message}</span>
              <span style={s.date}>{c.author} · {c.date}</span>
            </div>
          )) : <div style={s.empty}>커밋을 불러올 수 없습니다.</div>
        )}

        {selectedRepo && tab === 'status' && (
          status ? (
            status.clean
              ? <div style={s.empty}>✅ 워킹 트리가 깨끗합니다.</div>
              : status.files?.map((f, i) => (
                  <div key={i} style={s.commitItem}>
                    <span style={{ ...s.hash, color: f.status === 'M' ? '#fbbf24' : '#22c55e' }}>{f.status}</span>
                    <span>{f.path}</span>
                  </div>
                ))
          ) : <div style={s.empty}>상태를 불러올 수 없습니다.</div>
        )}
      </div>
    </div>
  )
}
