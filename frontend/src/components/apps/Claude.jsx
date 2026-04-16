import { useState, useRef, useEffect } from 'react'

const WELCOME = `안녕하세요! AgentOS AI Chat입니다.

**지원 모델:**
• ✦ Claude (Anthropic) — Sonnet, Opus, Haiku
• ◆ Gemini (Google) — Pro, Flash
• ● GPT (OpenAI) — GPT-4o, o3-mini
• 🖥 로컬 LLM (Ollama) — llama, qwen 등

모델을 선택하고 대화를 시작하세요.`

const PROVIDER_COLORS = {
  anthropic: { bg: 'linear-gradient(135deg, #c47f6b, #a0522d)', icon: '✦' },
  'claude-cli': { bg: 'linear-gradient(135deg, #d97706, #92400e)', icon: '⚡' },
  gemini: { bg: 'linear-gradient(135deg, #4285f4, #34a853)', icon: '◆' },
  openai: { bg: 'linear-gradient(135deg, #10a37f, #0d8c6d)', icon: '●' },
  ollama: { bg: 'linear-gradient(135deg, #6b7280, #374151)', icon: '🖥' },
}

const getProvider = (m) => {
  if (m === 'claude-cli') return 'claude-cli'
  if (m.startsWith('claude')) return 'anthropic'
  if (m.startsWith('gemini')) return 'gemini'
  if (m.startsWith('gpt') || m.startsWith('o')) return 'openai'
  return 'ollama'
}

export default function ClaudeApp() {
  const [messages, setMessages] = useState([{ role: 'assistant', content: WELCOME, id: 0 }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [model, setModel] = useState('claude-sonnet-4-20250514')
  const [allModels, setAllModels] = useState({ cloud: [], gemini: [], openai: [], local: [] })
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  const provider = getProvider(model)
  const prov = PROVIDER_COLORS[provider]

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const [cliStatus, setCliStatus] = useState({})

  useEffect(() => {
    fetch('/api/models').then(r => r.json()).then(d => { if (d.cloud || d.local) setAllModels(d) }).catch(() => {})
    fetch('/api/cli-status').then(r => r.json()).then(setCliStatus).catch(() => {})
  }, [])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    const userMsg = { role: 'user', content: text, id: Date.now() }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)
    try {
      const endpoint = model === 'claude-cli' ? '/api/chat/cli' : '/api/chat'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [...messages.filter(m => m.role !== 'system'), userMsg].map(m => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json()
      if (data.detail) throw new Error(data.detail)
      setMessages(m => [...m, { role: 'assistant', content: data.content || '응답 없음', id: Date.now() + 1, prov: data.provider }])
    } catch (err) {
      setMessages(m => [...m, { role: 'assistant', content: `⚠️ ${err?.message || 'API 오류'}. 설정에서 API 키를 확인하세요.`, id: Date.now() + 1 }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-window)' }}>
      {/* Top bar */}
      <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, background: prov.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>{prov.icon}</div>
        <select value={model} onChange={e => setModel(e.target.value)}
          style={{ fontSize: 12, background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-primary)', padding: '4px 8px', cursor: 'pointer', flex: 1, maxWidth: 260, outline: 'none' }}>
          {allModels.cloud?.length > 0 && <optgroup label="✦ Claude (Anthropic)">{allModels.cloud.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</optgroup>}
          {allModels.gemini?.length > 0 && <optgroup label="◆ Gemini (Google)">{allModels.gemini.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</optgroup>}
          {allModels.openai?.length > 0 && <optgroup label="● GPT (OpenAI)">{allModels.openai.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</optgroup>}
          {allModels.local?.length > 0 && <optgroup label="🖥 로컬 (Ollama)">{allModels.local.map(m => <option key={m.id} value={m.id}>{m.name}{m.size ? ` (${(m.size/1e9).toFixed(1)}GB)` : ''}</option>)}</optgroup>}
          {cliStatus.claude && <optgroup label="⚡ CLI (API키 불필요)"><option value="claude-cli">Claude Code CLI</option></optgroup>}
          {!allModels.cloud?.length && <>
            <optgroup label="✦ Claude"><option value="claude-sonnet-4-20250514">Claude Sonnet 4</option><option value="claude-opus-4-20250514">Claude Opus 4</option></optgroup>
            <optgroup label="◆ Gemini"><option value="gemini-2.5-pro">Gemini 2.5 Pro</option><option value="gemini-2.5-flash">Gemini 2.5 Flash</option></optgroup>
            <optgroup label="● GPT"><option value="gpt-4o">GPT-4o</option><option value="gpt-4o-mini">GPT-4o Mini</option></optgroup>
          </>}
        </select>
        <button onClick={() => setMessages([{ role: 'assistant', content: WELCOME, id: 0 }])}
          style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer' }} title="대화 초기화">🗑</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'assistant' && (
              <div style={{ width: 24, height: 24, borderRadius: 6, background: PROVIDER_COLORS[msg.prov || provider]?.bg || prov.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0, marginRight: 8, marginTop: 2 }}>
                {PROVIDER_COLORS[msg.prov || provider]?.icon || prov.icon}
              </div>
            )}
            <div style={{
              maxWidth: '82%', padding: '10px 14px',
              borderRadius: msg.role === 'user' ? '14px 14px 3px 14px' : '14px 14px 14px 3px',
              background: msg.role === 'user' ? 'linear-gradient(135deg, var(--accent), #1e40af)' : 'var(--bg-hover)',
              border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
              fontSize: 13, lineHeight: 1.7, color: 'var(--text-primary)', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            }}>{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: prov.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>{prov.icon}</div>
            <div style={{ display: 'flex', gap: 4 }}>{[0,1,2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', animation: `pulse 1.2s ease ${i*0.2}s infinite` }} />)}</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder={`${prov.icon} 메시지 입력... (Shift+Enter: 줄바꿈)`} rows={1}
          style={{ flex: 1, padding: '10px 13px', background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-primary)', fontSize: 13, lineHeight: 1.5, resize: 'none', fontFamily: 'var(--font-ui)', outline: 'none', maxHeight: 120, overflowY: 'auto' }} />
        <button onClick={send} disabled={loading}
          style={{ padding: '10px 18px', borderRadius: 10, background: loading ? 'var(--bg-active)' : prov.bg, color: '#fff', fontSize: 13, fontWeight: 500, cursor: loading ? 'wait' : 'pointer', border: 'none', flexShrink: 0, opacity: loading ? 0.7 : 1 }}>
          {loading ? '...' : '전송'}
        </button>
      </div>
    </div>
  )
}
