import { useState, useEffect } from 'react'

const WALLPAPERS = [
  { name: 'Deep Space', value: 'linear-gradient(135deg, #0a0e1a 0%, #1a1040 50%, #0a0e1a 100%)' },
  { name: 'Aurora', value: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' },
  { name: 'Ocean', value: 'linear-gradient(135deg, #0c1929 0%, #0d3b66 50%, #0a2342 100%)' },
  { name: 'Sunset', value: 'linear-gradient(135deg, #1a0a2e 0%, #3d1a54 50%, #1a0a2e 100%)' },
  { name: 'Forest', value: 'linear-gradient(135deg, #0a1a10 0%, #1a3a25 50%, #0a1a10 100%)' },
  { name: 'Midnight', value: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 50%, #0d0d0d 100%)' },
  { name: 'Warm', value: 'linear-gradient(135deg, #1a1008 0%, #2d1a0a 50%, #1a1008 100%)' },
  { name: 'Mono', value: '#0e1117' },
]

const MODELS = [
  { id: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4', desc: '빠르고 유능' },
  { id: 'claude-opus-4-20250514', label: 'Claude Opus 4', desc: '최고 성능' },
  { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5', desc: '가장 빠름' },
]

const SETTINGS_KEY = 'agentos-settings'

function loadSettings() {
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {} } catch { return {} }
}

function saveSettings(s) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
}

const s = {
  wrap: { height: '100%', overflowY: 'auto', fontFamily: 'var(--font-ui)' },
  section: { padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  sectionTitle: { fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 },
  wallpaperGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 },
  wallpaperItem: (active) => ({
    height: 56, borderRadius: 8, cursor: 'pointer',
    border: active ? '2px solid var(--accent)' : '2px solid rgba(255,255,255,0.06)',
    transition: 'border-color 0.15s, transform 0.15s',
    position: 'relative', overflow: 'hidden',
  }),
  wallpaperName: { position: 'absolute', bottom: 3, left: 0, right: 0, textAlign: 'center', fontSize: 9, color: 'rgba(255,255,255,0.6)' },
  modelCard: (active) => ({
    padding: '12px 14px', borderRadius: 8, cursor: 'pointer',
    background: active ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.03)',
    border: active ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(255,255,255,0.06)',
    marginBottom: 6, transition: 'all 0.15s',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  }),
  modelName: { fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' },
  modelDesc: { fontSize: 11, color: 'var(--text-muted)' },
  radioDot: (active) => ({
    width: 14, height: 14, borderRadius: '50%',
    border: active ? '4px solid var(--accent)' : '2px solid rgba(255,255,255,0.2)',
    flexShrink: 0, transition: 'all 0.15s',
  }),
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontWeight: 500, letterSpacing: '0.04em' },
  input: {
    width: '100%', background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
    padding: '9px 12px', color: 'var(--text-primary)', fontSize: 13,
    outline: 'none', fontFamily: 'var(--font-ui)',
  },
  saveBar: {
    padding: '14px 22px', borderTop: '1px solid rgba(255,255,255,0.06)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    position: 'sticky', bottom: 0, background: 'var(--bg-window)',
  },
  saveBtn: (saved) => ({
    background: saved ? '#22c55e' : 'var(--accent)',
    color: '#fff', border: 'none', borderRadius: 8,
    padding: '8px 20px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
    transition: 'background 0.2s',
  }),
  resetBtn: {
    background: 'none', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8, padding: '8px 16px', fontSize: 12,
    color: 'var(--text-secondary)', cursor: 'pointer',
  },
}

export default function SettingsApp() {
  const [settings, setSettings] = useState(() => ({
    wallpaper: 'Deep Space',
    defaultModel: 'claude-sonnet-4-20250514',
    ...loadSettings(),
  }))
  const [config, setConfig] = useState(null)
  const [saved, setSaved] = useState(false)

  // Load backend config
  useEffect(() => {
    fetch('/api/config').then(r => r.json()).then(setConfig).catch(() => setConfig({}))
  }, [])

  // Apply wallpaper
  useEffect(() => {
    const wp = WALLPAPERS.find(w => w.name === settings.wallpaper)
    if (wp) {
      const desktop = document.querySelector('[style*="bg-desktop"], div[style]')
      // Find the root desktop div
      const root = document.querySelector('#root > div > div')
      if (root) root.style.background = wp.value
    }
  }, [settings.wallpaper])

  const updateSetting = (key, value) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value }
      saveSettings(next)
      return next
    })
  }

  const saveConfig = async () => {
    if (config) {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      }).catch(() => {})
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const resetIconPositions = () => {
    localStorage.removeItem('agentos-icon-positions')
    window.location.reload()
  }

  return (
    <div style={s.wrap}>
      {/* Wallpaper */}
      <div style={s.section}>
        <div style={s.sectionTitle}>배경 화면</div>
        <div style={s.wallpaperGrid}>
          {WALLPAPERS.map(wp => (
            <div
              key={wp.name}
              style={{ ...s.wallpaperItem(settings.wallpaper === wp.name), background: wp.value }}
              onClick={() => updateSetting('wallpaper', wp.name)}
            >
              <div style={s.wallpaperName}>{wp.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Default AI Model */}
      <div style={s.section}>
        <div style={s.sectionTitle}>기본 AI 모델</div>
        {MODELS.map(m => (
          <div
            key={m.id}
            style={s.modelCard(settings.defaultModel === m.id)}
            onClick={() => updateSetting('defaultModel', m.id)}
          >
            <div>
              <div style={s.modelName}>{m.label}</div>
              <div style={s.modelDesc}>{m.desc}</div>
            </div>
            <div style={s.radioDot(settings.defaultModel === m.id)} />
          </div>
        ))}
      </div>

      {/* API Keys & URLs */}
      <div style={s.section}>
        <div style={s.sectionTitle}>서비스 연결</div>
        {config && [
          { key: 'ANTHROPIC_API_KEY', label: 'Anthropic API Key', type: 'password', placeholder: 'sk-ant-...' },
          { key: 'VSCODE_TUNNEL_URL', label: 'VS Code Tunnel URL', placeholder: 'https://vscode.dev/tunnel/...' },
          { key: 'KASM_URL', label: 'KasmVNC URL', placeholder: 'http://localhost:6901' },
          { key: 'PROJECTS_BASE', label: '프로젝트 기본 경로', placeholder: '/home/user/projects' },
        ].map(({ key, label, type, placeholder }) => (
          <div key={key} style={s.inputGroup}>
            <label style={s.label}>{label}</label>
            <input
              type={type || 'text'}
              value={config[key] || ''}
              onChange={e => setConfig(c => ({ ...c, [key]: e.target.value }))}
              placeholder={placeholder}
              style={{ ...s.input, fontFamily: type === 'password' ? 'var(--font-mono)' : 'var(--font-ui)' }}
            />
          </div>
        ))}
      </div>

      {/* Desktop */}
      <div style={s.section}>
        <div style={s.sectionTitle}>데스크톱</div>
        <button style={s.resetBtn} onClick={resetIconPositions}>
          🔄 아이콘 위치 초기화
        </button>
      </div>

      {/* Save bar */}
      <div style={s.saveBar}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          설정은 브라우저에 자동 저장됩니다
        </div>
        <button style={s.saveBtn(saved)} onClick={saveConfig}>
          {saved ? '✓ 저장됨' : '서버 설정 저장'}
        </button>
      </div>
    </div>
  )
}
