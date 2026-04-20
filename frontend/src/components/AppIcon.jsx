import { useState, useRef } from 'react'
import { useWindowStore } from '../store/windowStore'

const STORAGE_KEY = 'agentos-icon-positions'

function loadPositions() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {} } catch { return {} }
}

function savePositions(pos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pos))
}

export default function AppIcon({ id, label, icon, gradient, index }) {
  const { open, focus, windows } = useWindowStore()
  const [hover, setHover] = useState(false)
  const [clicking, setClicking] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [pos, setPos] = useState(() => {
    const saved = loadPositions()[id]
    if (saved) return saved
    // Default grid: 2 columns, 90px apart
    const col = index % 2
    const row = Math.floor(index / 2)
    return { x: 16 + col * 88, y: 16 + row * 96 }
  })
  const dragRef = useRef({ sx: 0, sy: 0, ox: 0, oy: 0 })
  const win = windows[id]
  const isOpen = win?.isOpen && !win?.isMinimized

  const handleDoubleClick = (e) => {
    if (dragging) return
    if (win?.isOpen && !win?.isMinimized) {
      focus(id)
    } else {
      open(id)
    }
  }

  const onPointerDown = (e) => {
    dragRef.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y }
    setClicking(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e) => {
    if (!clicking) return
    const dx = e.clientX - dragRef.current.sx
    const dy = e.clientY - dragRef.current.sy
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      setDragging(true)
      const maxX = window.innerWidth - 80
      const maxY = window.innerHeight - 96 - 60 // taskbar
      setPos({
        x: Math.max(0, Math.min(maxX, dragRef.current.ox + dx)),
        y: Math.max(0, Math.min(maxY, dragRef.current.oy + dy)),
      })
    }
  }

  const onPointerUp = () => {
    setClicking(false)
    if (dragging) {
      // Save position
      const all = loadPositions()
      all[id] = pos
      savePositions(all)
      setTimeout(() => setDragging(false), 50)
    }
  }

  return (
    <div
      onDoubleClick={handleDoubleClick}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setClicking(false) }}
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 5,
        padding: '8px 6px',
        borderRadius: 10,
        cursor: dragging ? 'grabbing' : 'pointer',
        width: 78,
        background: hover ? 'rgba(255,255,255,0.07)' : 'transparent',
        border: hover ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
        transform: clicking && !dragging ? 'scale(0.93)' : 'scale(1)',
        transition: dragging ? 'none' : 'all 0.12s ease',
        userSelect: 'none',
        zIndex: dragging ? 100 : 1,
        touchAction: 'none',
      }}
    >
      {/* Icon */}
      <div style={{
        width: 46,
        height: 46,
        borderRadius: 12,
        background: gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
        boxShadow: hover
          ? '0 8px 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)'
          : '0 4px 12px rgba(0,0,0,0.4)',
        transition: 'box-shadow 0.15s',
        position: 'relative',
      }}>
        {icon}
        {isOpen && (
          <div style={{
            position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)',
            width: 4, height: 4, borderRadius: '50%',
            background: 'var(--accent)', boxShadow: '0 0 6px var(--accent-glow)',
          }} />
        )}
      </div>

      {/* Label */}
      <span style={{
        fontSize: 10.5,
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'center',
        lineHeight: 1.25,
        textShadow: '0 1px 4px rgba(0,0,0,0.9)',
        fontWeight: 400,
        maxWidth: 72,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
    </div>
  )
}
