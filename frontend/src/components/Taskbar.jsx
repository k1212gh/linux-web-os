import { useState, useEffect, useRef, useCallback } from 'react'
import { useWindowStore } from '../store/windowStore'

const PINNED = ['terminal', 'claude-code', 'profile', 'projects', 'blog', 'settings']
const MAX_SCALE = 1.35
const MAGNIFY_RANGE = 140 // px

export default function Taskbar({ apps, onStartClick, startMenuOpen }) {
  const { windows, open, focus, minimize } = useWindowStore()
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')
  const [sysInfo, setSysInfo] = useState(null)
  const [mouseX, setMouseX] = useState(null)
  const dockRef = useRef(null)
  const iconRefs = useRef({})

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }))
      setDate(now.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const fetchInfo = () => fetch('/api/system/quick').then(r => r.json()).then(setSysInfo).catch(() => {})
    fetchInfo()
    const id = setInterval(fetchInfo, 5000)
    return () => clearInterval(id)
  }, [])

  const handleClick = (id) => {
    const win = windows[id]
    if (!win?.isOpen) open(id)
    else if (win.isMinimized) focus(id)
    else if (useWindowStore.getState().activeId === id) minimize(id)
    else focus(id)
  }

  // Calculate magnification scale based on distance from mouse
  const getScale = useCallback((appId) => {
    if (mouseX === null) return 1
    const el = iconRefs.current[appId]
    if (!el) return 1
    const rect = el.getBoundingClientRect()
    const center = rect.left + rect.width / 2
    const dist = Math.abs(mouseX - center)
    if (dist > MAGNIFY_RANGE) return 1
    return 1 + (MAX_SCALE - 1) * Math.cos((dist / MAGNIFY_RANGE) * Math.PI / 2)
  }, [mouseX])

  const openIds = Object.values(windows).filter(w => w.isOpen && !PINNED.includes(w.id)).map(w => w.id)
  const allDockIds = [...PINNED, ...openIds]

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      height: 'var(--taskbar-h)', display: 'flex', alignItems: 'flex-end',
      justifyContent: 'center', zIndex: 9999, userSelect: 'none',
      padding: '0 12px 6px',
    }}>
      {/* Start button — left of dock */}
      <button
        onClick={onStartClick}
        style={{
          width: 40, height: 40, borderRadius: 12, marginRight: 6,
          background: startMenuOpen ? 'rgba(59,130,246,0.2)' : 'var(--bg-taskbar)',
          backdropFilter: 'blur(16px)',
          border: startMenuOpen ? '1px solid rgba(59,130,246,0.3)' : '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.15s',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        }}
        title="시작 메뉴 (Win 키)"
      >
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="1" width="6" height="6" rx="1.5" fill="#ff6b6b" />
          <rect x="9" y="1" width="6" height="6" rx="1.5" fill="#51cf66" />
          <rect x="1" y="9" width="6" height="6" rx="1.5" fill="#339af0" />
          <rect x="9" y="9" width="6" height="6" rx="1.5" fill="#fcc419" />
        </svg>
      </button>

      {/* Center dock */}
      <div
        ref={dockRef}
        onMouseMove={e => setMouseX(e.clientX)}
        onMouseLeave={() => setMouseX(null)}
        style={{
          display: 'flex', alignItems: 'flex-end', gap: 3,
          background: 'var(--bg-taskbar)',
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid var(--border)',
          borderRadius: 16, padding: '5px 10px 6px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        {allDockIds.map((appId, i) => {
          const app = apps.find(a => a.id === appId)
          if (!app) return null
          const win = windows[appId]
          const isActive = useWindowStore.getState().activeId === appId
          const scale = getScale(appId)

          return (
            <div key={appId} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Separator */}
              {i === PINNED.length && openIds.length > 0 && (
                <div style={{ position: 'absolute', left: -4, top: 4, bottom: 8, width: 1, background: 'var(--border)' }} />
              )}

              <button
                ref={el => iconRefs.current[appId] = el}
                onClick={() => handleClick(appId)}
                style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: app.gradient,
                  border: isActive ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, cursor: 'pointer',
                  transform: `scale(${scale}) translateY(${(scale - 1) * -12}px)`,
                  transition: mouseX !== null ? 'transform 0.08s ease-out' : 'transform 0.2s ease-out',
                  boxShadow: scale > 1.1
                    ? '0 8px 24px rgba(0,0,0,0.5)'
                    : '0 2px 8px rgba(0,0,0,0.3)',
                  position: 'relative',
                  transformOrigin: 'bottom center',
                }}
                title={app.title}
              >
                {app.icon}
              </button>

              {/* Running indicator */}
              {win?.isOpen && (
                <div style={{
                  width: isActive ? 6 : 4, height: 3, borderRadius: 2, marginTop: 3,
                  background: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  transition: 'all 0.15s',
                }} />
              )}

              {/* Tooltip */}
              {scale > 1.15 && (
                <div style={{
                  position: 'absolute', bottom: '100%', marginBottom: 8,
                  padding: '4px 10px', borderRadius: 6,
                  background: 'rgba(10,14,24,0.95)', border: '1px solid var(--border)',
                  color: 'var(--text-primary)', fontSize: 11, fontWeight: 500,
                  whiteSpace: 'nowrap', pointerEvents: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                }}>
                  {app.title}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* System tray */}
      <div style={{
        position: 'absolute', right: 12, bottom: 8,
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'var(--bg-taskbar)', backdropFilter: 'blur(16px)',
        border: '1px solid var(--border)', borderRadius: 10, padding: '5px 12px',
      }}>
        {sysInfo && (
          <>
            <div style={{ display: 'flex', gap: 6, fontSize: 10, color: 'var(--text-muted)' }}>
              <span style={{ color: '#58a6ff' }}>GPU {Math.round(sysInfo.gpu_util ?? 0)}%</span>
              <span style={{ color: '#bc8cff' }}>{(sysInfo.vram_used ?? 0).toFixed(1)}G</span>
            </div>
            <div style={{ width: 1, height: 14, background: 'var(--border)' }} />
          </>
        )}
        <div style={{ textAlign: 'right', lineHeight: 1.3, cursor: 'default' }}>
          <div style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{time}</div>
          <div style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>{date}</div>
        </div>
      </div>
    </div>
  )
}
