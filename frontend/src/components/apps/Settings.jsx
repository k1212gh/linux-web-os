import { useState, useEffect } from 'react'

export default function SettingsApp() {
  const [config, setConfig] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then(setConfig)
      .catch(() => setConfig({}))
  }, [])

  const save = async () => {
    await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!config) return null

  const fields = [
    { key: 'ANTHROPIC_API_KEY', label: 'Anthropic API Key', type: 'password', placeholder: 'sk-ant-...' },
    { key: 'VSCODE_TUNNEL_URL', label: 'VS Code Tunnel URL', type: 'text', placeholder: 'https://vscode.dev/tunnel/...' },
    { key: 'KASM_URL', label: 'KasmVNC URL', type: 'text', placeholder: 'http://localhost:6901' },
    { key: 'FILEBROWSER_URL', label: 'FileBrowser URL', type: 'text', placeholder: 'http://localhost:8081' },
    { key: 'HSA_OVERRIDE_GFX_VERSION', label: 'ROCm HSA Override', type: 'text', placeholder: '10.3.0' },
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%',
      background:'var(--bg-window)', overflowY:'auto' }}>
      <div style={{ padding:'20px 22px', borderBottom:'1px solid var(--border)' }}>
        <div style={{ fontSize:16, fontWeight:500 }}>설정</div>
        <div style={{ fontSize:12, color:'var(--text-secondary)', marginTop:2 }}>서비스 URL 및 API 키 관리</div>
      </div>

      <div style={{ flex:1, padding:'20px 22px', display:'flex', flexDirection:'column', gap:14 }}>
        {fields.map(({ key, label, type, placeholder }) => (
          <div key={key}>
            <label style={{ fontSize:11, color:'var(--text-muted)', display:'block',
              marginBottom:6, fontWeight:500, letterSpacing:'0.04em' }}>
              {label}
            </label>
            <input
              type={type}
              value={config[key] || ''}
              onChange={(e) => setConfig((c) => ({ ...c, [key]: e.target.value }))}
              placeholder={placeholder}
              style={{
                width:'100%', background:'rgba(255,255,255,0.06)',
                border:'1px solid var(--border)', borderRadius:8,
                padding:'9px 12px', color:'var(--text-primary)', fontSize:13,
                fontFamily: type === 'password' ? 'var(--font-mono)' : 'var(--font-ui)',
              }}
            />
          </div>
        ))}
      </div>

      <div style={{ padding:'14px 22px', borderTop:'1px solid var(--border)',
        display:'flex', justifyContent:'flex-end' }}>
        <button
          onClick={save}
          style={{
            background: saved ? 'var(--accent-green)' : 'var(--accent)',
            color:'white', border:'none', borderRadius:8,
            padding:'8px 20px', fontSize:13, fontWeight:500, cursor:'pointer',
            transition:'background 0.2s',
          }}
        >
          {saved ? '✓ 저장됨' : '저장'}
        </button>
      </div>
    </div>
  )
}
