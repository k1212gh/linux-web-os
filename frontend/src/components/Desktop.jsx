import { useEffect, useState, useCallback } from 'react'
import { useWindowStore } from '../store/windowStore'
import AppIcon from './AppIcon'
import Taskbar from './Taskbar'
import Window from './Window'
import TerminalApp from './apps/Terminal'
import VSCodeApp from './apps/VSCode'
import ClaudeApp from './apps/Claude'
import SystemMonitor from './apps/SystemMonitor'
import KasmApp from './apps/Kasm'
import SettingsApp from './apps/Settings'
import ClaudeCodeApp from './apps/ClaudeCode'
import GitDashboardApp from './apps/GitDashboard'
import CICDApp from './apps/CICD'
import FileManagerApp from './apps/FileManager'
import MemoApp from './apps/Memo'
import CalculatorApp from './apps/Calculator'
import LLMDashboardApp from './apps/LLMDashboard'
import HarnessManagerApp from './apps/HarnessManager'
import ProfileApp from './apps/Profile'
import ResumeApp from './apps/Resume'
import ProjectsApp from './apps/Projects'
import BlogApp from './apps/Blog'
import TimelineApp from './apps/Timeline'
import ContactApp from './apps/Contact'

const APPS = [
  { id: 'terminal', title: 'Terminal', icon: '⌨', label: 'Terminal', gradient: 'linear-gradient(135deg, #0d1117, #161b22)', component: TerminalApp },
  { id: 'vscode', title: 'VS Code', icon: '◈', label: 'VS Code', gradient: 'linear-gradient(135deg, #007acc, #005b9a)', component: VSCodeApp },
  { id: 'claude', title: 'Claude', icon: '✦', label: 'Claude', gradient: 'linear-gradient(135deg, #c47f6b, #8b4513)', component: ClaudeApp },
  { id: 'claude-code', title: 'Claude Code', icon: '🤖', label: 'Claude Code', gradient: 'linear-gradient(135deg, #d97706, #92400e)', component: ClaudeCodeApp },
  { id: 'monitor', title: '시스템 모니터', icon: '📊', label: 'Monitor', gradient: 'linear-gradient(135deg, #1a3a5c, #0d2137)', component: SystemMonitor },
  { id: 'llm-dashboard', title: 'LLM 대시보드', icon: '🧠', label: 'LLM UI', gradient: 'linear-gradient(135deg, #7c3aed, #4c1d95)', component: LLMDashboardApp },
  { id: 'kasm', title: '원격 데스크톱', icon: '🖥', label: 'Desktop', gradient: 'linear-gradient(135deg, #1a1a2e, #16213e)', component: KasmApp },
  { id: 'git', title: 'Git 대시보드', icon: '🔀', label: 'Git', gradient: 'linear-gradient(135deg, #f97316, #c2410c)', component: GitDashboardApp },
  { id: 'cicd', title: 'CI/CD', icon: '🔨', label: 'CI/CD', gradient: 'linear-gradient(135deg, #14b8a6, #0f766e)', component: CICDApp },
  { id: 'filemanager', title: '파일 관리자', icon: '📂', label: 'Files', gradient: 'linear-gradient(135deg, #eab308, #a16207)', component: FileManagerApp },
  { id: 'harness', title: '하네스', icon: '🔧', label: 'Harness', gradient: 'linear-gradient(135deg, #a855f7, #7e22ce)', component: HarnessManagerApp },
  { id: 'memo', title: '메모장', icon: '📒', label: 'Memo', gradient: 'linear-gradient(135deg, #fbbf24, #d97706)', component: MemoApp },
  { id: 'calculator', title: '계산기', icon: '🧮', label: 'Calc', gradient: 'linear-gradient(135deg, #6b7280, #374151)', component: CalculatorApp },
  { id: 'settings', title: '설정', icon: '⚙', label: 'Settings', gradient: 'linear-gradient(135deg, #2d2d2d, #1a1a1a)', component: SettingsApp },
  { id: 'profile', title: '프로필', icon: '👤', label: 'Profile', gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', component: ProfileApp },
  { id: 'resume', title: '이력서', icon: '📄', label: 'Resume', gradient: 'linear-gradient(135deg, #22c55e, #15803d)', component: ResumeApp },
  { id: 'projects', title: '프로젝트', icon: '💼', label: 'Projects', gradient: 'linear-gradient(135deg, #f59e0b, #b45309)', component: ProjectsApp },
  { id: 'blog', title: '블로그', icon: '📝', label: 'Blog', gradient: 'linear-gradient(135deg, #6366f1, #4338ca)', component: BlogApp },
  { id: 'timeline', title: '타임라인', icon: '📅', label: 'Timeline', gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', component: TimelineApp },
  { id: 'contact', title: '연락처', icon: '✉', label: 'Contact', gradient: 'linear-gradient(135deg, #ef4444, #b91c1c)', component: ContactApp },
]

/* ─── Snap Preview ─── */
function SnapPreview() {
  const snapPreview = useWindowStore((s) => s.snapPreview)
  if (!snapPreview) return null
  const pos = {
    left:  { left: 4, top: 4, width: 'calc(50% - 6px)', height: 'calc(100vh - 64px)' },
    right: { right: 4, top: 4, width: 'calc(50% - 6px)', height: 'calc(100vh - 64px)' },
    top:   { left: 4, top: 4, width: 'calc(100% - 8px)', height: 'calc(100vh - 64px)' },
  }
  return <div style={{ position: 'fixed', ...pos[snapPreview], background: 'rgba(59,130,246,0.1)', border: '2px solid rgba(59,130,246,0.3)', borderRadius: 12, zIndex: 5, pointerEvents: 'none', animation: 'snapPreviewPulse 1.5s ease infinite' }} />
}

/* ─── Boot Screen ─── */
function BootScreen({ onDone }) {
  const [progress, setProgress] = useState(0)
  const [msg, setMsg] = useState('')
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const last = localStorage.getItem('agentos-boot')
    if (last && Date.now() - parseInt(last) < 3600000) { setVisible(false); onDone(); return }
    const msgs = ['시스템 초기화...', '프로필 로딩...', '앱 등록 중...', '데스크톱 준비 완료']
    let i = 0
    const iv = setInterval(() => {
      i++; setProgress(Math.min((i / msgs.length) * 100, 100))
      setMsg(msgs[Math.min(i - 1, msgs.length - 1)])
      if (i >= msgs.length) { clearInterval(iv); setTimeout(() => { setVisible(false); localStorage.setItem('agentos-boot', Date.now().toString()); onDone() }, 600) }
    }, 450)
    return () => clearInterval(iv)
  }, [onDone])
  if (!visible) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#07090f', zIndex: 99999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {['#3b82f6', '#22c55e', '#f59e0b', '#ef4444'].map(c => <div key={c} style={{ width: 14, height: 14, borderRadius: 3, background: c }} />)}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: 4, marginBottom: 4 }}>AgentOS</div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 32 }}>김건희 Portfolio & Workstation</div>
      <div style={{ width: 240, height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ height: '100%', background: 'linear-gradient(90deg, #3b82f6, #22c55e)', borderRadius: 2, width: `${progress}%`, transition: 'width 0.3s' }} />
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-mono)' }}>{msg}</div>
    </div>
  )
}

/* ─── Start Menu (Win key) ─── */
function StartMenu({ onClose, apps }) {
  const { open } = useWindowStore()
  const [search, setSearch] = useState('')

  const filtered = search
    ? apps.filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.label.toLowerCase().includes(search.toLowerCase()))
    : apps

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 99996 }} onClick={onClose} />
      <div style={{
        position: 'fixed', bottom: 62, left: '50%', transform: 'translateX(-50%)',
        width: 420, maxHeight: 500,
        background: 'rgba(14,18,28,0.97)', backdropFilter: 'blur(24px)',
        border: '1px solid var(--border)', borderRadius: 14,
        boxShadow: '0 16px 64px rgba(0,0,0,0.6)',
        zIndex: 99997, overflow: 'hidden',
        animation: 'fadeIn 0.12s ease',
      }}>
        {/* Search */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <input
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="앱 검색..."
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 10,
              background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
              color: 'var(--text-primary)', fontSize: 14, outline: 'none',
              fontFamily: 'var(--font-ui)',
            }}
            onKeyDown={e => {
              if (e.key === 'Escape') onClose()
              if (e.key === 'Enter' && filtered.length > 0) {
                open(filtered[0].id)
                onClose()
              }
            }}
          />
        </div>

        {/* App grid */}
        <div style={{ padding: 12, maxHeight: 380, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
          {filtered.map(app => (
            <button
              key={app.id}
              onClick={() => { open(app.id); onClose() }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                padding: '12px 4px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: 'transparent', color: 'var(--text-primary)',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10, background: app.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}>
                {app.icon}
              </div>
              <span style={{ fontSize: 10.5, color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.2 }}>
                {app.label}
              </span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>AgentOS</span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Win 키로 열기/닫기</span>
        </div>
      </div>
    </>
  )
}

/* ─── Context Menu ─── */
function ContextMenu({ x, y, onClose }) {
  const { open, windows } = useWindowStore()
  const items = [
    { label: '⌨ 터미널 열기', action: () => open('terminal') },
    { label: '🤖 Claude Code', action: () => open('claude-code') },
    { label: '📂 파일 관리자', action: () => open('filemanager') },
    { type: 'divider' },
    { label: '📊 시스템 모니터', action: () => open('monitor') },
    { label: '⚙ 설정', action: () => open('settings') },
    { type: 'divider' },
    { label: '⛶ 전체화면', shortcut: 'F11', action: () => { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen() } },
    { label: '🔀 창 전환', shortcut: 'Ctrl+`', action: () => {
      const wins = Object.values(windows).filter(w => w.isOpen)
      if (wins.length >= 2) { const ids = wins.map(w => w.id); const idx = ids.indexOf(useWindowStore.getState().activeId); useWindowStore.getState().focus(ids[(idx + 1) % ids.length]) }
    }},
    { label: '🖥 바탕화면 보기', shortcut: 'Ctrl+D', action: () => Object.values(windows).forEach(w => { if (w.isOpen && !w.isMinimized) useWindowStore.getState().minimize(w.id) }) },
    { type: 'divider' },
    { label: '🔄 아이콘 위치 초기화', action: () => { localStorage.removeItem('agentos-icon-positions'); location.reload() } },
    { label: '🗑 모든 창 닫기', action: () => Object.keys(windows).forEach(id => { if (windows[id].isOpen) useWindowStore.getState().close(id) }) },
  ]
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 99998 }} onClick={onClose} onContextMenu={e => { e.preventDefault(); onClose() }} />
      <div style={{
        position: 'fixed', left: Math.min(x, window.innerWidth - 220), top: Math.min(y, window.innerHeight - 400),
        zIndex: 99999, background: 'rgba(14,18,28,0.96)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
        padding: '6px 0', minWidth: 200, boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
        animation: 'fadeIn 0.1s ease',
      }}>
        {items.map((item, i) => {
          if (item.type === 'divider') return <div key={i} style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
          return (
            <div key={i} onClick={() => { item.action(); onClose() }}
              style={{ padding: '7px 14px', fontSize: 12.5, color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span>{item.label}</span>
              {item.shortcut && <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 12 }}>{item.shortcut}</span>}
            </div>
          )
        })}
      </div>
    </>
  )
}

/* ─── Main Desktop ─── */
export default function Desktop() {
  const { registerApp, close, minimize, focus } = useWindowStore()
  const [booted, setBooted] = useState(false)
  const [ctxMenu, setCtxMenu] = useState(null)
  const [startMenu, setStartMenu] = useState(false)

  useEffect(() => { APPS.forEach(app => registerApp(app)) }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      const tag = e.target.tagName
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'

      // Win key (Meta) — toggle start menu
      if (e.key === 'Meta') {
        e.preventDefault()
        setStartMenu(prev => !prev)
        return
      }

      // F11 — fullscreen
      if (e.key === 'F11') {
        e.preventDefault()
        document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()
      }

      // Ctrl+W — close active window
      if (e.ctrlKey && e.key === 'w' && !isInput) {
        e.preventDefault()
        const a = useWindowStore.getState().activeId
        if (a) close(a)
      }

      // Ctrl+` — cycle windows
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault()
        const wins = Object.values(useWindowStore.getState().windows).filter(w => w.isOpen)
        if (wins.length < 2) return
        const ids = wins.map(w => w.id)
        const idx = ids.indexOf(useWindowStore.getState().activeId)
        focus(ids[(idx + 1) % ids.length])
      }

      // Ctrl+D — show desktop
      if (e.ctrlKey && (e.key === 'd' || e.key === 'D') && !isInput) {
        e.preventDefault()
        Object.values(useWindowStore.getState().windows).forEach(w => {
          if (w.isOpen && !w.isMinimized) minimize(w.id)
        })
      }

      // Escape — close menus
      if (e.key === 'Escape') {
        setCtxMenu(null)
        setStartMenu(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [close, minimize, focus])

  const onContextMenu = useCallback((e) => {
    if (e.target.closest('.titlebar-drag') || e.target.closest('button')) return
    e.preventDefault()
    setCtxMenu({ x: e.clientX, y: e.clientY })
  }, [])

  const onBootDone = useCallback(() => setBooted(true), [])

  return (
    <>
      <BootScreen onDone={onBootDone} />
      {booted && (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: 'var(--bg-desktop)' }} onContextMenu={onContextMenu}>
          {/* Animated background */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(-45deg, var(--bg-desktop), #12102e, #0a1e3a, #0d1a14)',
            backgroundSize: '500% 500%',
            animation: 'bgShift 40s ease infinite',
          }} />

          {/* Desktop icons */}
          {APPS.map((app, i) => <AppIcon key={app.id} id={app.id} label={app.label} icon={app.icon} gradient={app.gradient} index={i} />)}

          {/* Snap preview */}
          <SnapPreview />

          {/* Windows — leave space for taskbar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 56 }}>
            {APPS.map(app => <Window key={app.id} id={app.id} title={app.title} icon={app.icon}><app.component /></Window>)}
          </div>

          {/* Menus */}
          {ctxMenu && <ContextMenu x={ctxMenu.x} y={ctxMenu.y} onClose={() => setCtxMenu(null)} />}
          {startMenu && <StartMenu onClose={() => setStartMenu(false)} apps={APPS} />}

          {/* Taskbar */}
          <Taskbar apps={APPS} onStartClick={() => setStartMenu(prev => !prev)} startMenuOpen={startMenu} />
        </div>
      )}
    </>
  )
}
