import { useState, useRef, useEffect, useCallback } from 'react'
import useWebSocket from '../../hooks/useWebSocket'
import ConversationView from './claude/ConversationView'

const s = {
  wrap: { display: 'flex', height: '100%', fontFamily: 'var(--font-ui)' },
  sidebar: {
    width: 200, flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.06)',
    display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.15)',
  },
  sidebarHeader: {
    padding: '12px 14px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)',
    borderBottom: '1px solid rgba(255,255,255,0.06)', textTransform: 'uppercase', letterSpacing: 1,
  },
  sessionItem: (active) => ({
    padding: '10px 14px', fontSize: 13, cursor: 'pointer',
    background: active ? 'rgba(59,130,246,0.15)' : 'transparent',
    color: active ? 'var(--accent)' : 'var(--text-secondary)',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
  }),
  newBtn: {
    margin: 8, padding: '8px 12px', borderRadius: 6,
    background: 'var(--accent)', color: '#fff', border: 'none',
    cursor: 'pointer', fontSize: 12, fontWeight: 500,
  },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  projectBar: {
    padding: '8px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)',
    display: 'flex', alignItems: 'center', gap: 8, fontSize: 12,
    color: 'var(--text-secondary)', flexShrink: 0,
  },
  projectSelect: {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 6, padding: '4px 8px', color: 'var(--text-primary)',
    fontSize: 12, outline: 'none', flex: 1, maxWidth: 300,
  },
  statusBadge: (connected) => ({
    padding: '2px 8px', borderRadius: 10, fontSize: 11,
    background: connected ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
    color: connected ? '#22c55e' : '#ef4444',
  }),
  inputBar: {
    padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.06)',
    display: 'flex', gap: 8, flexShrink: 0,
  },
  input: {
    flex: 1, padding: '10px 14px', borderRadius: 8,
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'var(--text-primary)', fontSize: 14, fontFamily: 'inherit', outline: 'none',
    resize: 'none',
  },
  sendBtn: {
    padding: '10px 20px', borderRadius: 8, background: 'var(--accent)',
    color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
    flexShrink: 0,
  },
  emptyState: {
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', color: 'var(--text-muted)', gap: 12, padding: 40,
    textAlign: 'center',
  },
  emptyIcon: { fontSize: 48, marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' },
  emptyDesc: { fontSize: 13, lineHeight: 1.6, maxWidth: 400 },
}

export default function ClaudeCodeApp() {
  const [sessions, setSessions] = useState([])
  const [activeSession, setActiveSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [thinking, setThinking] = useState(false)
  const [input, setInput] = useState('')
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState('')
  const bottomRef = useRef(null)

  // Fetch projects list
  useEffect(() => {
    fetch('/api/claude/projects')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setProjects(data)
      })
      .catch(() => {})
  }, [])

  // Fetch sessions list
  const refreshSessions = useCallback(() => {
    fetch('/api/claude/sessions')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setSessions(data)
      })
      .catch(() => {})
  }, [])

  useEffect(() => { refreshSessions() }, [refreshSessions])

  // WebSocket
  const onMessage = useCallback((data) => {
    if (data.type === 'output') {
      setMessages(prev => [...prev, { type: 'output', content: data.content }])
      setThinking(false)
    } else if (data.type === 'assistant_message') {
      setMessages(prev => [...prev, { type: 'assistant', content: data.content }])
      setThinking(false)
    } else if (data.type === 'tool_call') {
      setMessages(prev => [...prev, {
        type: 'tool_call', id: data.id, tool: data.tool,
        input: data.input, status: 'pending',
      }])
      setThinking(false)
    } else if (data.type === 'tool_result') {
      setMessages(prev => prev.map(m =>
        m.id === data.id ? { ...m, output: data.output, status: 'approved' } : m
      ))
    } else if (data.type === 'status') {
      setThinking(data.state === 'thinking')
    } else if (data.type === 'error') {
      setMessages(prev => [...prev, { type: 'assistant', content: `❌ ${data.message}` }])
    }
  }, [])

  const wsUrl = activeSession ? `/api/claude/ws/${activeSession}` : null
  const { status: wsStatus, connect, send } = useWebSocket(wsUrl || '', {
    onMessage,
    autoConnect: false,
  })

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  // Create session
  const createSession = async () => {
    if (!selectedProject) return
    try {
      const resp = await fetch('/api/claude/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_dir: selectedProject }),
      })
      const data = await resp.json()
      if (data.id) {
        setActiveSession(data.id)
        setMessages([])
        refreshSessions()
      }
    } catch {}
  }

  // Connect to session
  useEffect(() => {
    if (activeSession && wsUrl) {
      connect()
    }
  }, [activeSession])

  // Send message
  const sendMessage = () => {
    const text = input.trim()
    if (!text) return
    setMessages(prev => [...prev, { type: 'user', content: text }])
    send({ type: 'message', content: text })
    setInput('')
    setThinking(true)
  }

  const onApprove = (toolId) => {
    send({ type: 'approve', tool_call_id: toolId })
    setMessages(prev => prev.map(m => m.id === toolId ? { ...m, status: 'approved' } : m))
  }

  const onDeny = (toolId) => {
    send({ type: 'deny', tool_call_id: toolId })
    setMessages(prev => prev.map(m => m.id === toolId ? { ...m, status: 'denied' } : m))
  }

  return (
    <div style={s.wrap}>
      {/* Sidebar */}
      <div style={s.sidebar}>
        <div style={s.sidebarHeader}>세션</div>
        {sessions.map(sess => (
          <div
            key={sess.id}
            style={s.sessionItem(activeSession === sess.id)}
            onClick={() => { setActiveSession(sess.id); setMessages([]) }}
          >
            <div style={{ fontSize: 12, fontWeight: 500 }}>#{sess.id}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              {sess.project_dir?.split('/').pop()}
            </div>
          </div>
        ))}
        <button style={s.newBtn} onClick={createSession}>+ 새 세션</button>
      </div>

      {/* Main area */}
      <div style={s.main}>
        {/* Project bar */}
        <div style={s.projectBar}>
          <span>📁</span>
          <select
            style={s.projectSelect}
            value={selectedProject}
            onChange={e => setSelectedProject(e.target.value)}
          >
            <option value="">프로젝트 선택...</option>
            {projects.map(p => (
              <option key={p.path} value={p.path}>{p.name}</option>
            ))}
          </select>
          <span style={s.statusBadge(wsStatus === 'connected')}>
            {wsStatus === 'connected' ? '연결됨' : wsStatus === 'connecting' ? '연결 중...' : '연결 안됨'}
          </span>
        </div>

        {/* Conversation or empty state */}
        {!activeSession ? (
          <div style={s.emptyState}>
            <div style={s.emptyIcon}>🤖</div>
            <div style={s.emptyTitle}>Claude Code</div>
            <div style={s.emptyDesc}>
              프로젝트를 선택하고 "새 세션"을 클릭하여 시작하세요.<br />
              Claude Code가 파일을 읽고, 편집하고, 명령을 실행할 수 있습니다.<br /><br />
              <strong>백엔드가 필요합니다:</strong> WSL에서 FastAPI 서버를 실행하고<br />
              claude CLI가 설치되어 있어야 합니다.
            </div>
          </div>
        ) : (
          <>
            <ConversationView
              messages={messages}
              thinking={thinking}
              onApprove={onApprove}
              onDeny={onDeny}
            />
            <div ref={bottomRef} />

            {/* Input bar */}
            <div style={s.inputBar}>
              <textarea
                style={s.input}
                rows={1}
                placeholder="메시지를 입력하세요..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
              />
              <button style={s.sendBtn} onClick={sendMessage}>전송</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
