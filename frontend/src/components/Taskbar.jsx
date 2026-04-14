import { useState, useEffect } from 'react'
import { useWindowStore } from '../store/windowStore'

export default function Taskbar({ apps }) {
  const { windows, open, focus, minimize } = useWindowStore()
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')
  const [sysInfo, setSysInfo] = useState(null)

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
      fetch('/api/system/quick')
        .then((r) => r.json())
        .then(setSysInfo)
        .catch(() => {})
    fetchInfo()
    const id = setInterval(fetchInfo, 5000)
    return () => clearInterval(id)
  }, [])

  const openWins = Object.values(windows).filter((w) => w.isOpen)

  const handleTaskbarClick = (id) => {
    const win = windows[id]
    if (!win) return
    if (win.isMinimized) {
      focus(id)
    } else if (useWindowStore.getState().activeId === id) {
      minimize(id)
    } else {
      focus(id)
    }
  }

  return (
    <div style={{
      position: 'absolute',
      bottom: 0, left: 0, right: 0,
      height: 'var(--taskbar-h)',
      background: 'var(--bg-taskbar)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 12px',
      gap: 4,
      zIndex: 9999,
      userSelect: 'none',
    }}>
      {/* Start button */}
      <button style={{
        width: 36, height: 32, borderRadius: 8,
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 15, cursor: 'pointer', color: 'white', flexShrink: 0,
        transition: 'background 0.15s',
      }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
      >⊞</button>

      <div style={{ width: 1, height: 22, background: 'var(--border)', margin: '0 4px', flexShrink: 0 }} />

      {/* Running apps */}
      <div style={{ display: 'flex', gap: 3, flex: 1, overflow: 'hidden' }}>
        {openWins.map((win) => {
          const isActive = useWindowStore.getState().activeId === win.id
          return (
            <button
              key={win.id}
              onClick={() => handleTaskbarClick(win.id)}
              style={{
                height: 32, padding: '0 12px',
                borderRadius: 7,
                background: isActive ? 'rgba(59,130,246,0.18)' : 'rgba(255,255,255,0.07)',
                border: isActive ? '1px solid rgba(59,130,246,0.35)' : '1px solid var(--border)',
                color: isActive ? 'white' : 'var(--text-secondary)',
                fontSize: 12, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                whiteSpace: 'nowrap', maxWidth: 140, overflow: 'hidden',
                transition: 'all 0.15s',
                position: 'relative',
              }}
            >
              <span style={{ fontSize: 13 }}>{win.icon}</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{win.title}</span>
              {win.isMinimized && (
                <div style={{ width: 3, height: 3, borderRadius: '50%',
                  background: 'var(--accent)', position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)' }} />
              )}
            </button>
          )
        })}
      </div>

      {/* System tray */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, marginLeft: 8 }}>
        {sysInfo && (
          <div style={{ display: 'flex', gap: 8, fontSize: 11, color: 'var(--text-muted)' }}>
            <span title="GPU" style={{ color: '#58a6ff' }}>
              GPU {Math.round(sysInfo.gpu_util ?? 0)}%
            </span>
            <span title="VRAM" style={{ color: '#bc8cff' }}>
              {(sysInfo.vram_used ?? 0).toFixed(1)}GB
            </span>
          </div>
        )}
        <div style={{ width: 1, height: 18, background: 'var(--border)' }} />
        <div style={{ textAlign: 'right', lineHeight: 1.35, cursor: 'default' }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
            {time}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{date}</div>
        </div>
      </div>
    </div>
  )
}
