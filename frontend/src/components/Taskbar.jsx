import { useState, useEffect } from 'react'
import { useWindowStore } from '../store/windowStore'

// Pinned apps that always show in dock
const PINNED = ['terminal', 'claude-code', 'profile', 'projects', 'blog', 'settings']

export default function Taskbar({ apps }) {
  const { windows, open, focus, minimize } = useWindowStore()
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')
  const [sysInfo, setSysInfo] = useState(null)
  const [hoveredId, setHoveredId] = useState(null)

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
    const fetchInfo = () =>
      fetch('/api/system/quick').then(r => r.json()).then(setSysInfo).catch(() => {})
    fetchInfo()
    const id = setInterval(fetchInfo, 5000)
    return () => clearInterval(id)
  }, [])

  const handleClick = (id) => {
    const win = windows[id]
    if (!win?.isOpen) {
      open(id)
    } else if (win.isMinimized) {
      focus(id)
    } else if (useWindowStore.getState().activeId === id) {
      minimize(id)
    } else {
      focus(id)
    }
  }

  // Combine pinned + open (non-pinned)
  const openIds = Object.values(windows).filter(w => w.isOpen && !PINNED.includes(w.id)).map(w => w.id)
  const allDockIds = [...PINNED, ...openIds]

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      height: 'var(--taskbar-h)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 9999, userSelect: 'none',
      padding: '0 12px',
    }}>
      {/* Center dock */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 3,
        background: 'rgba(6,10,18,0.85)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14, padding: '5px 8px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}>
        {allDockIds.map((appId, i) => {
          const app = apps.find(a => a.id === appId)
          if (!app) return null
          const win = windows[appId]
          const isOpen = win?.isOpen && !win?.isMinimized
          const isActive = useWindowStore.getState().activeId === appId
          const isHovered = hoveredId === appId
          const isPinned = PINNED.includes(appId)

          return (
            <div key={appId} style={{ position: 'relative' }}>
              {/* Separator before non-pinned apps */}
              {i === PINNED.length && openIds.length > 0 && (
                <div style={{
                  position: 'absolute', left: -3, top: 6, bottom: 6,
                  width: 1, background: 'rgba(255,255,255,0.1)',
                }} />
              )}
              <button
                onClick={() => handleClick(appId)}
                onMouseEnter={() => setHoveredId(appId)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: app.gradient,
                  border: isActive ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, cursor: 'pointer',
                  transform: isHovered ? 'scale(1.18) translateY(-4px)' : 'scale(1)',
                  transition: 'transform 0.15s cubic-bezier(0.34,1.56,0.64,1), border 0.15s',
                  boxShadow: isHovered
                    ? '0 8px 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)'
                    : '0 2px 8px rgba(0,0,0,0.3)',
                  position: 'relative',
                }}
                title={app.title}
              >
                {app.icon}
              </button>

              {/* Running indicator dot */}
              {win?.isOpen && (
                <div style={{
                  position: 'absolute', bottom: -3, left: '50%',
                  transform: 'translateX(-50%)',
                  width: isActive ? 6 : 4, height: 3,
                  borderRadius: 2,
                  background: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                  transition: 'all 0.15s',
                }} />
              )}

              {/* Hover tooltip */}
              {isHovered && (
                <div style={{
                  position: 'absolute', bottom: 46, left: '50%',
                  transform: 'translateX(-50%)',
                  padding: '4px 10px', borderRadius: 6,
                  background: 'rgba(20,24,36,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--text-primary)',
                  fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                  animation: 'fadeIn 0.1s ease',
                  pointerEvents: 'none',
                }}>
                  {app.title}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* System tray — right side */}
      <div style={{
        position: 'absolute', right: 12,
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'rgba(6,10,18,0.75)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 10, padding: '5px 12px',
      }}>
        {sysInfo && (
          <div style={{ display: 'flex', gap: 6, fontSize: 10, color: 'var(--text-muted)' }}>
            <span style={{ color: '#58a6ff' }}>GPU {Math.round(sysInfo.gpu_util ?? 0)}%</span>
            <span style={{ color: '#bc8cff' }}>{(sysInfo.vram_used ?? 0).toFixed(1)}G</span>
          </div>
        )}
        {sysInfo && <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.08)' }} />}
        <div style={{ textAlign: 'right', lineHeight: 1.3, cursor: 'default' }}>
          <div style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
            {time}
          </div>
          <div style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>{date}</div>
        </div>
      </div>
    </div>
  )
}
