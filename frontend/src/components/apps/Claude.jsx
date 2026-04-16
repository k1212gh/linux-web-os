import { useState, useRef, useEffect } from 'react'

const WELCOME = `안녕하세요! Claude입니다. 이 Web OS에서 직접 AI와 대화할 수 있습니다.

**이 앱의 기능:**
• 코드 작성 및 리뷰
• 시스템 설정 도움말
• ROCm / GPU 설정 가이드
• 일반 질문 및 대화

무엇을 도와드릴까요?`

export default function ClaudeApp() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: WELCOME, id: 0 }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [model, setModel] = useState('claude-sonnet-4-20250514')
  const [localModels, setLocalModels] = useState([])
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  // Fetch available models (cloud + local)
  useEffect(() => {
    fetch('/api/models')
      .then(r => r.json())
      .then(data => { if (data.local) setLocalModels(data.local) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg = { role: 'user', content: text, id: Date.now() }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [...messages.filter(m => m.role !== 'system'), userMsg].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })
      const data = await res.json()
      setMessages((m) => [...m, {
        role: 'assistant',
        content: data.content || data.error || '오류가 발생했습니다.',
        id: Date.now() + 1,
      }])
    } catch {
      setMessages((m) => [...m, {
        role: 'assistant',
        content: '⚠️ API 연결 오류. 백엔드 설정을 확인하세요.',
        id: Date.now() + 1,
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0d1117' }}>
      {/* Model selector */}
      <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>모델</span>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          style={{ fontSize: 11, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
            borderRadius: 6, color: 'var(--text-secondary)', padding: '3px 8px', cursor: 'pointer' }}
        >
          <optgroup label="☁️ Cloud (Anthropic)">
            <option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
            <option value="claude-opus-4-20250514">Claude Opus 4</option>
            <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5</option>
          </optgroup>
          {localModels.length > 0 && (
            <optgroup label="🖥️ Local (Ollama)">
              {localModels.map(m => (
                <option key={m.id} value={m.id}>{m.name} {m.size ? `(${(m.size / 1e9).toFixed(1)}GB)` : ''}</option>
              ))}
            </optgroup>
          )}
        </select>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            {msg.role === 'assistant' && (
              <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg,#c47f6b,#a0522d)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
                flexShrink: 0, marginRight: 8, marginTop: 2 }}>
                ✦
              </div>
            )}
            <div style={{
              maxWidth: '82%',
              padding: '9px 13px',
              borderRadius: msg.role === 'user' ? '14px 14px 3px 14px' : '14px 14px 14px 3px',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, #1d4ed8, #1e40af)'
                : 'rgba(255,255,255,0.07)',
              border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
              fontSize: 13,
              lineHeight: 1.6,
              color: 'var(--text-primary)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg,#c47f6b,#a0522d)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>✦</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[0,1,2].map((i) => (
                <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)',
                  animation: `pulse 1.2s ease ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)',
        display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
          }}
          placeholder="메시지 입력... (Shift+Enter 줄바꿈)"
          rows={1}
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '9px 13px',
            color: 'var(--text-primary)',
            fontSize: 13,
            resize: 'none',
            maxHeight: 120,
            lineHeight: 1.5,
            outline: 'none',
            transition: 'border-color 0.15s',
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--border-focus)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          style={{
            width: 36, height: 36, borderRadius: 8, border: 'none',
            background: input.trim() ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
            color: 'white', fontSize: 15, cursor: input.trim() ? 'pointer' : 'default',
            transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          ↑
        </button>
      </div>
    </div>
  )
}
