import { useState, useEffect } from 'react'

const s = {
  wrap: { height: '100%', display: 'flex', fontFamily: 'var(--font-ui)' },
  sidebar: { width: 240, flexShrink: 0, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' },
  sideHeader: { padding: '10px 12px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 6, alignItems: 'center' },
  searchInput: { flex: 1, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-hover)', color: 'var(--text-primary)', fontSize: 12, outline: 'none' },
  path: { padding: '6px 12px', fontSize: 10, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-mono)' },
  list: { flex: 1, overflowY: 'auto', padding: 4 },
  item: (active) => ({
    padding: '6px 10px', fontSize: 12, cursor: 'pointer', borderRadius: 6, marginBottom: 1,
    background: active ? 'rgba(59,130,246,0.1)' : 'transparent',
    color: active ? 'var(--accent)' : 'var(--text-primary)',
    display: 'flex', alignItems: 'center', gap: 6,
  }),
  icon: { fontSize: 13, flexShrink: 0 },
  name: { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  reader: { flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 },
  readerTitle: { fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 },
  frontmatter: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: 10, fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' },
  content: { fontSize: 14, lineHeight: 1.8, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' },
  links: { display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 },
  link: { fontSize: 11, padding: '3px 8px', borderRadius: 10, background: 'rgba(59,130,246,0.15)', color: 'var(--accent)', cursor: 'pointer' },
  empty: { padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 },
  syncBtn: { padding: '4px 10px', borderRadius: 6, background: 'var(--accent)', color: '#fff', border: 'none', fontSize: 11, cursor: 'pointer' },
  backBtn: { background: 'none', border: 'none', color: 'var(--accent)', fontSize: 12, cursor: 'pointer', padding: '4px 0', textAlign: 'left' },
}

export default function ObsidianViewerApp() {
  const [currentPath, setCurrentPath] = useState('')
  const [items, setItems] = useState([])
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [note, setNote] = useState(null)
  const [error, setError] = useState(null)

  const loadList = (path, searchTerm = '') => {
    const params = new URLSearchParams()
    if (path) params.set('path', path)
    if (searchTerm) params.set('search', searchTerm)
    fetch(`/api/obsidian/notes?${params}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); setItems([]) }
        else { setItems(d.items || []); setError(null); setCurrentPath(d.path || '') }
      })
      .catch(() => setError('백엔드 연결 실패'))
  }

  const loadNote = (path) => {
    fetch(`/api/obsidian/note?path=${encodeURIComponent(path)}`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else { setNote(d); setSelected(path); setError(null) } })
  }

  const syncToBlog = (path) => {
    fetch('/api/obsidian/sync-to-blog', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note_path: path }),
    }).then(r => r.json()).then(d => {
      if (d.error) alert('동기화 실패: ' + d.error)
      else alert('✅ 블로그 포스트로 변환 완료:\n' + JSON.stringify(d, null, 2).slice(0, 400))
    })
  }

  useEffect(() => { loadList('') }, [])

  useEffect(() => {
    const t = setTimeout(() => loadList(currentPath, search), 300)
    return () => clearTimeout(t)
  }, [search])

  const onItemClick = (item) => {
    if (item.is_dir) loadList(item.path)
    else if (item.is_md) loadNote(item.path)
  }

  return (
    <div style={s.wrap}>
      <div style={s.sidebar}>
        <div style={s.sideHeader}>
          <input style={s.searchInput} placeholder="노트 검색..." value={search} onChange={e => setSearch(e.target.value)} />
          <button style={s.backBtn} onClick={() => loadList('')} title="볼트 루트">🏠</button>
        </div>
        <div style={s.path}>📁 {currentPath || '/'}</div>
        <div style={s.list}>
          {error && <div style={s.empty}>⚠️ {error}<br /><small style={{ fontSize: 11 }}>설정에서 OBSIDIAN_VAULT 경로를 등록하세요</small></div>}
          {!error && items.length === 0 && <div style={s.empty}>비어있음</div>}
          {currentPath && <div style={s.item(false)} onClick={() => { const p = currentPath.split('/').slice(0, -1).join('/'); loadList(p) }}>
            <span style={s.icon}>⬆</span><span style={s.name}>.. (상위)</span>
          </div>}
          {items.map(item => (
            <div key={item.path} style={s.item(selected === item.path)} onClick={() => onItemClick(item)}>
              <span style={s.icon}>{item.is_dir ? '📁' : item.is_md ? '📄' : '📎'}</span>
              <span style={s.name}>{item.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={s.reader}>
        {!note && <div style={s.empty}>왼쪽에서 노트를 선택하세요<br /><small>Obsidian 볼트의 마크다운 파일을 탐색/읽기합니다</small></div>}
        {note && (
          <>
            <div style={s.readerTitle}>
              {note.frontmatter?.title || selected?.split('/').pop()?.replace('.md', '')}
            </div>
            {Object.keys(note.frontmatter || {}).length > 0 && (
              <div style={s.frontmatter}>
                {Object.entries(note.frontmatter).map(([k, v]) => (
                  <div key={k}>{k}: {v}</div>
                ))}
              </div>
            )}
            <div style={s.content}>{note.content}</div>
            {note.links?.length > 0 && (
              <div style={s.links}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>연결:</span>
                {note.links.map((l, i) => <span key={i} style={s.link}>🔗 {l}</span>)}
              </div>
            )}
            <div style={{ marginTop: 12 }}>
              <button style={s.syncBtn} onClick={() => syncToBlog(selected)}>📝 블로그 포스트로 변환</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
