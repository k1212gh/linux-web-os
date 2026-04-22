'use client'

import { useState, useEffect } from 'react'

const s = {
  wrap: { height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-ui)' },
  breadcrumb: { padding: '8px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' },
  crumbBtn: { background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 12, padding: '2px 4px' },
  body: { flex: 1, display: 'flex', overflow: 'hidden' },
  tree: { width: 180, flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.06)', overflowY: 'auto', padding: 8, fontSize: 12 },
  treeItem: (active) => ({ padding: '4px 8px', borderRadius: 4, cursor: 'pointer', color: active ? 'var(--accent)' : 'var(--text-secondary)', background: active ? 'rgba(59,130,246,0.1)' : 'transparent', marginBottom: 1 }),
  list: { flex: 1, overflowY: 'auto', padding: 8 },
  fileItem: { display: 'flex', gap: 10, padding: '8px 10px', borderRadius: 6, cursor: 'pointer', alignItems: 'center', fontSize: 13, marginBottom: 1 },
  fileName: { flex: 1, color: 'var(--text-primary)' },
  fileSize: { fontSize: 11, color: 'var(--text-muted)', width: 60, textAlign: 'right' },
  fileMod: { fontSize: 11, color: 'var(--text-muted)', width: 100 },
  preview: { flex: 1, borderLeft: '1px solid rgba(255,255,255,0.06)', overflowY: 'auto', padding: 14 },
  previewContent: { fontFamily: 'var(--font-mono)', fontSize: 12, whiteSpace: 'pre-wrap', color: 'var(--text-secondary)', lineHeight: 1.6 },
  empty: { padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 },
  toolbar: { padding: '6px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 6, flexShrink: 0 },
  toolBtn: { padding: '4px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer' },
}

function formatSize(bytes) {
  if (bytes == null) return '-'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

export default function FileManagerApp() {
  const [currentPath, setCurrentPath] = useState('')
  const [items, setItems] = useState([])
  const [previewContent, setPreviewContent] = useState(null)
  const [previewName, setPreviewName] = useState('')

  const navigate = (path) => {
    setCurrentPath(path)
    setPreviewContent(null)
    fetch(`/api/files/list?path=${encodeURIComponent(path)}`)
      .then(r => r.json())
      .then(d => { if (d.items) setItems(d.items) })
      .catch(() => setItems([]))
  }

  useEffect(() => { navigate('') }, [])

  const openItem = (item) => {
    if (item.is_dir) {
      navigate(item.path)
    } else {
      // Preview text file
      fetch(`/api/files/read?path=${encodeURIComponent(item.path)}`)
        .then(r => r.json())
        .then(d => { setPreviewContent(d.content || d.error || 'Cannot read'); setPreviewName(item.name) })
        .catch(() => setPreviewContent('Error reading file'))
    }
  }

  const pathParts = currentPath ? currentPath.split('/').filter(Boolean) : []

  return (
    <div style={s.wrap}>
      <div style={s.toolbar}>
        <button style={s.toolBtn} onClick={() => navigate('')}>🏠 홈</button>
        <button style={s.toolBtn} onClick={() => {
          const parent = pathParts.slice(0, -1).join('/')
          navigate(parent)
        }}>⬆ 상위</button>
        <button style={s.toolBtn} onClick={() => navigate(currentPath)}>🔄 새로고침</button>
      </div>
      <div style={s.breadcrumb}>
        <button style={s.crumbBtn} onClick={() => navigate('')}>~</button>
        {pathParts.map((part, i) => (
          <span key={i}>
            <span style={{ color: 'var(--text-muted)' }}>/</span>
            <button style={s.crumbBtn} onClick={() => navigate(pathParts.slice(0, i + 1).join('/'))}>
              {part}
            </button>
          </span>
        ))}
      </div>
      <div style={s.body}>
        <div style={s.list}>
          {items.length === 0 && <div style={s.empty}>백엔드 실행 후 파일을 탐색하세요.</div>}
          {items.map(item => (
            <div
              key={item.name}
              style={s.fileItem}
              onDoubleClick={() => openItem(item)}
              onClick={() => !item.is_dir && openItem(item)}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span>{item.is_dir ? '📁' : '📄'}</span>
              <span style={s.fileName}>{item.name}</span>
              <span style={s.fileSize}>{formatSize(item.size)}</span>
              <span style={s.fileMod}>{item.modified?.slice(0, 10)}</span>
            </div>
          ))}
        </div>
        {previewContent !== null && (
          <div style={s.preview}>
            <div style={{ fontSize: 12, color: 'var(--accent)', marginBottom: 8, fontWeight: 600 }}>📄 {previewName}</div>
            <div style={s.previewContent}>{previewContent}</div>
          </div>
        )}
      </div>
    </div>
  )
}
