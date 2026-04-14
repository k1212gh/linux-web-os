import { useState } from 'react'
import { useWindowStore } from '../store/windowStore'

export default function AppIcon({ id, label, icon, gradient }) {
  const { open, focus, windows } = useWindowStore()
  const [hover, setHover] = useState(false)
  const [clicking, setClicking] = useState(false)
  const win = windows[id]
  const isOpen = win?.isOpen && !win?.isMinimized

  const handleClick = () => {
    if (win?.isOpen && !win?.isMinimized) {
      focus(id)
    } else {
      open(id)
    }
  }

  return (
    <div
      onDoubleClick={handleClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setClicking(false) }}
      onMouseDown={() => setClicking(true)}
      onMouseUp={() => setClicking(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        padding: '10px 8px',
        borderRadius: 10,
        cursor: 'pointer',
        width: 76,
        background: hover ? 'rgba(255,255,255,0.07)' : 'transparent',
        border: hover ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
        transform: clicking ? 'scale(0.93)' : 'scale(1)',
        transition: 'all 0.12s ease',
        userSelect: 'none',
      }}
    >
      {/* Icon */}
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 11,
        background: gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
        boxShadow: hover
          ? `0 8px 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)`
          : '0 4px 12px rgba(0,0,0,0.4)',
        transition: 'box-shadow 0.15s',
        position: 'relative',
      }}>
        {icon}
        {/* Running indicator */}
        {isOpen && (
          <div style={{
            position: 'absolute',
            bottom: -6,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: 'var(--accent)',
            boxShadow: '0 0 6px var(--accent-glow)',
          }} />
        )}
      </div>

      {/* Label */}
      <span style={{
        fontSize: 11,
        color: 'rgba(255,255,255,0.82)',
        textAlign: 'center',
        lineHeight: 1.3,
        textShadow: '0 1px 4px rgba(0,0,0,0.9)',
        fontWeight: 400,
      }}>
        {label}
      </span>
    </div>
  )
}
