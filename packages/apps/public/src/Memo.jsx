'use client'

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'agentos-memos'

const s = {
  wrap: { height: '100%', display: 'flex', fontFamily: 'var(--font-ui)' },
  sidebar: { width: 180, flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column' },
  sideHeader: { padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  sideTitle: { fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' },
  addBtn: { background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 4, width: 24, height: 24, cursor: 'pointer', fontSize: 14 },
  noteList: { flex: 1, overflowY: 'auto', padding: 4 },
  noteItem: (active) => ({ padding: '8px 10px', borderRadius: 6, cursor: 'pointer', marginBottom: 2, background: active ? 'rgba(59,130,246,0.12)' : 'transparent' }),
  noteTitle: { fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  noteDate: { fontSize: 10, color: 'var(--text-muted)' },
  editor: { flex: 1, display: 'flex', flexDirection: 'column' },
  titleInput: { padding: '10px 14px', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'transparent', color: 'var(--text-primary)', fontSize: 16, fontWeight: 600, outline: 'none', fontFamily: 'inherit' },
  textarea: { flex: 1, padding: 14, border: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.7, outline: 'none', resize: 'none', fontFamily: 'inherit' },
  empty: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 },
}

export default function MemoApp() {
  const [notes, setNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] } catch { return [] }
  })
  const [activeId, setActiveId] = useState(notes[0]?.id || null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
  }, [notes])

  const activeNote = notes.find(n => n.id === activeId)

  const addNote = () => {
    const newNote = { id: Date.now().toString(), title: '새 메모', content: '', date: new Date().toISOString().slice(0, 10) }
    setNotes([newNote, ...notes])
    setActiveId(newNote.id)
  }

  const updateNote = (field, value) => {
    setNotes(notes.map(n => n.id === activeId ? { ...n, [field]: value, date: new Date().toISOString().slice(0, 10) } : n))
  }

  const deleteNote = (id) => {
    setNotes(notes.filter(n => n.id !== id))
    if (activeId === id) setActiveId(notes.find(n => n.id !== id)?.id || null)
  }

  return (
    <div style={s.wrap}>
      <div style={s.sidebar}>
        <div style={s.sideHeader}>
          <span style={s.sideTitle}>메모</span>
          <button style={s.addBtn} onClick={addNote}>+</button>
        </div>
        <div style={s.noteList}>
          {notes.map(n => (
            <div key={n.id} style={s.noteItem(activeId === n.id)} onClick={() => setActiveId(n.id)}
              onContextMenu={(e) => { e.preventDefault(); deleteNote(n.id) }}>
              <div style={s.noteTitle}>{n.title || '제목 없음'}</div>
              <div style={s.noteDate}>{n.date}</div>
            </div>
          ))}
        </div>
      </div>
      {activeNote ? (
        <div style={s.editor}>
          <input style={s.titleInput} value={activeNote.title} onChange={e => updateNote('title', e.target.value)} placeholder="제목" />
          <textarea style={s.textarea} value={activeNote.content} onChange={e => updateNote('content', e.target.value)} placeholder="메모를 입력하세요..." />
        </div>
      ) : (
        <div style={s.empty}>+ 버튼으로 새 메모를 만드세요</div>
      )}
    </div>
  )
}
