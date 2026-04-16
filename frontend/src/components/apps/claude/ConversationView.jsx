const s = {
  wrap: { flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 },
  msgUser: {
    alignSelf: 'flex-end', maxWidth: '80%', padding: '10px 14px',
    background: 'var(--accent)', color: '#fff', borderRadius: '12px 12px 4px 12px',
    fontSize: 14, lineHeight: 1.6, wordBreak: 'break-word',
  },
  msgAssistant: {
    alignSelf: 'flex-start', maxWidth: '85%', padding: '10px 14px',
    background: 'rgba(255,255,255,0.06)', borderRadius: '12px 12px 12px 4px',
    fontSize: 14, lineHeight: 1.6, color: 'var(--text-primary)', wordBreak: 'break-word',
  },
  toolCall: {
    alignSelf: 'flex-start', maxWidth: '85%', padding: 12,
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
    borderLeft: '3px solid var(--accent)', background: 'rgba(255,255,255,0.03)',
  },
  toolHeader: {
    display: 'flex', alignItems: 'center', gap: 8, fontSize: 12,
    color: 'var(--accent)', fontWeight: 600, marginBottom: 6,
  },
  toolBody: {
    fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)',
    background: 'rgba(0,0,0,0.3)', padding: 8, borderRadius: 4,
    maxHeight: 200, overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
  },
  approvalBtns: { display: 'flex', gap: 8, marginTop: 8 },
  approveBtn: {
    padding: '4px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
    background: '#22c55e', color: '#fff', fontSize: 12,
  },
  denyBtn: {
    padding: '4px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
    background: '#ef4444', color: '#fff', fontSize: 12,
  },
  thinking: {
    alignSelf: 'flex-start', padding: '8px 14px',
    color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic',
  },
  status: (st) => ({
    fontSize: 11, padding: '2px 8px', borderRadius: 10,
    background: st === 'approved' ? 'rgba(34,197,94,0.15)' : st === 'denied' ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)',
    color: st === 'approved' ? '#22c55e' : st === 'denied' ? '#ef4444' : '#3b82f6',
    marginLeft: 8,
  }),
}

const TOOL_ICONS = {
  Read: '📖', Edit: '✏️', Write: '📝', Bash: '💻',
  Grep: '🔍', Glob: '📁', default: '🔧',
}

export default function ConversationView({ messages, thinking, onApprove, onDeny }) {
  return (
    <div style={s.wrap}>
      {messages.map((msg, i) => {
        if (msg.type === 'user') {
          return <div key={i} style={s.msgUser}>{msg.content}</div>
        }
        if (msg.type === 'assistant') {
          return <div key={i} style={s.msgAssistant}>{msg.content}</div>
        }
        if (msg.type === 'tool_call') {
          const icon = TOOL_ICONS[msg.tool] || TOOL_ICONS.default
          return (
            <div key={i} style={s.toolCall}>
              <div style={s.toolHeader}>
                <span>{icon}</span>
                <span>{msg.tool}</span>
                {msg.status && <span style={s.status(msg.status)}>{msg.status}</span>}
              </div>
              {msg.input && (
                <div style={s.toolBody}>
                  {typeof msg.input === 'string' ? msg.input : JSON.stringify(msg.input, null, 2)}
                </div>
              )}
              {msg.output && (
                <div style={{ ...s.toolBody, marginTop: 6, borderLeft: '2px solid rgba(34,197,94,0.3)' }}>
                  {msg.output}
                </div>
              )}
              {msg.status === 'pending' && (
                <div style={s.approvalBtns}>
                  <button style={s.approveBtn} onClick={() => onApprove(msg.id)}>✅ 승인</button>
                  <button style={s.denyBtn} onClick={() => onDeny(msg.id)}>❌ 거부</button>
                </div>
              )}
            </div>
          )
        }
        if (msg.type === 'output') {
          return <div key={i} style={{ ...s.msgAssistant, fontFamily: 'var(--font-mono)', fontSize: 12, whiteSpace: 'pre-wrap' }}>{msg.content}</div>
        }
        return null
      })}
      {thinking && <div style={s.thinking}>Claude가 생각하고 있습니다...</div>}
    </div>
  )
}
