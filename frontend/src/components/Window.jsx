import { useState, useRef, useCallback } from 'react'
import { Rnd } from 'react-rnd'
import { useWindowStore } from '../store/windowStore'

const TITLEBAR_H = 36

export default function Window({ id, title, icon, children }) {
  const { windows, close, minimize, maximize, focus, move, resize } = useWindowStore()
  const win = windows[id]
  const isActive = useWindowStore((s) => s.activeId === id)
  const [btnHover, setBtnHover] = useState(null)
  const [titleMenu, setTitleMenu] = useState(null) // {x, y} or null
  const dragStartRef = useRef(null)

  if (!win || !win.isOpen || win.isMinimized) return null

  const btnStyle = (type) => {
    const colors = { close: '#ff5f57', min: '#febc2e', max: '#28c840' }
    const isHovered = btnHover === type
    return {
      width: 12, height: 12, borderRadius: '50%',
      background: isActive ? colors[type] : 'rgba(255,255,255,0.12)',
      border: 'none', cursor: 'pointer', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.15s',
      boxShadow: isHovered ? `0 0 8px rgba(255,255,255,0.1)` : 'none',
      transform: isHovered ? 'scale(1.25)' : 'scale(1)',
    }
  }

  const btnIcon = (type) => {
    if (!isActive && btnHover !== type) return null
    const s = { width: 7, height: 7, strokeWidth: 1.8, stroke: 'rgba(0,0,0,0.6)', fill: 'none' }
    if (type === 'close') return <svg viewBox="0 0 8 8" style={s}><line x1="1.5" y1="1.5" x2="6.5" y2="6.5" /><line x1="6.5" y1="1.5" x2="1.5" y2="6.5" /></svg>
    if (type === 'min') return <svg viewBox="0 0 8 8" style={s}><line x1="1.5" y1="4" x2="6.5" y2="4" /></svg>
    if (type === 'max') return (
      <svg viewBox="0 0 8 8" style={s}>
        {win.isMaximized ? <><rect x="0.5" y="2" width="5" height="5" rx="0.5" /><path d="M2.5 2V1h5v5h-1" /></> : <rect x="1" y="1" width="6" height="6" rx="0.5" />}
      </svg>
    )
    return null
  }

  // Double-click titlebar → toggle maximize
  const onTitleDoubleClick = useCallback((e) => {
    if (e.target.closest('button')) return
    maximize(id)
  }, [id, maximize])

  // Titlebar right-click → window menu
  const onTitleContextMenu = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setTitleMenu({ x: e.clientX, y: e.clientY })
  }, [])

  // When maximized, dragging titlebar should restore then drag
  const onDragStart = useCallback((e, d) => {
    if (win.isMaximized) {
      // Restore window: position it so cursor is centered on titlebar
      const newW = win._prevW || 700
      const newH = win._prevH || 500
      const newX = Math.max(0, d.x - newW / 2)
      const newY = d.y
      maximize(id) // toggles off maximized
      // After maximize toggles off, set position
      setTimeout(() => {
        move(id, newX, newY)
        resize(id, newW, newH, newX, newY)
      }, 0)
    }
    dragStartRef.current = { x: d.x, y: d.y }
  }, [win, id, maximize, move, resize])

  // Snap to top edge → maximize
  const onDragStop = useCallback((e, d) => {
    if (d.y <= 2 && !win.isMaximized) {
      maximize(id)
    } else {
      move(id, d.x, d.y)
    }
  }, [id, win.isMaximized, maximize, move])

  // Window menu items
  const menuItems = [
    { label: '최대화/복원', action: () => maximize(id) },
    { label: '최소화', action: () => minimize(id) },
    { type: 'divider' },
    { label: '닫기', action: () => close(id), color: '#ff5f57' },
  ]

  return (
    <>
      <Rnd
        style={{
          zIndex: win.zIndex,
          animation: 'windowOpen 0.18s ease-out',
          position: 'absolute',
        }}
        size={{ width: win.w, height: win.h }}
        position={{ x: win.x, y: win.y }}
        minWidth={320}
        minHeight={220}
        bounds="parent"
        dragHandleClassName="titlebar-drag"
        enableResizing={!win.isMaximized}
        disableDragging={false}
        onDragStart={onDragStart}
        onDragStop={onDragStop}
        onResizeStop={(e, dir, ref, delta, pos) => {
          resize(id, ref.offsetWidth, ref.offsetHeight, pos.x, pos.y)
        }}
        onMouseDown={() => focus(id)}
      >
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column',
          background: 'var(--bg-window)',
          border: isActive ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(255,255,255,0.06)',
          borderRadius: win.isMaximized ? 0 : 'var(--radius-window)',
          boxShadow: isActive
            ? '0 24px 60px rgba(0,0,0,0.7), 0 4px 16px rgba(0,0,0,0.5)'
            : '0 16px 40px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          transition: 'border-color 0.15s, box-shadow 0.2s, border-radius 0.15s',
        }}>
          {/* Titlebar */}
          <div
            className="titlebar-drag"
            onDoubleClick={onTitleDoubleClick}
            onContextMenu={onTitleContextMenu}
            style={{
              height: TITLEBAR_H, minHeight: TITLEBAR_H,
              background: isActive ? 'var(--bg-titlebar)' : 'rgba(12,16,26,0.95)',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              display: 'flex', alignItems: 'center',
              padding: '0 12px', gap: 10,
              cursor: win.isMaximized ? 'default' : 'default',
              userSelect: 'none',
            }}
          >
            {/* Controls */}
            <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
              {['close', 'min', 'max'].map((type) => (
                <button
                  key={type}
                  style={btnStyle(type)}
                  onMouseEnter={() => setBtnHover(type)}
                  onMouseLeave={() => setBtnHover(null)}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (type === 'close') close(id)
                    if (type === 'min') minimize(id)
                    if (type === 'max') maximize(id)
                  }}
                >
                  {btnIcon(type)}
                </button>
              ))}
            </div>

            {/* Title centered */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <span style={{ fontSize: 13 }}>{icon}</span>
              <span style={{ fontSize: 12.5, color: isActive ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 500, opacity: isActive ? 1 : 0.7 }}>
                {title}
              </span>
            </div>

            {/* Right spacer */}
            <div style={{ width: 52 }} />
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {children}
          </div>
        </div>
      </Rnd>

      {/* Titlebar context menu */}
      {titleMenu && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 99998 }} onClick={() => setTitleMenu(null)} />
          <div style={{
            position: 'fixed', left: titleMenu.x, top: titleMenu.y, zIndex: 99999,
            background: 'rgba(14,18,28,0.96)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
            padding: '4px 0', minWidth: 140, boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          }}>
            {menuItems.map((item, i) => {
              if (item.type === 'divider') return <div key={i} style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '3px 0' }} />
              return (
                <div key={i} onClick={() => { item.action(); setTitleMenu(null) }}
                  style={{ padding: '6px 14px', fontSize: 12, color: item.color || 'var(--text-primary)', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  {item.label}
                </div>
              )
            })}
          </div>
        </>
      )}
    </>
  )
}
