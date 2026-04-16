import { useState, useRef, useCallback, useEffect } from 'react'
import { Rnd } from 'react-rnd'
import { useWindowStore } from '../store/windowStore'

const TITLEBAR_H = 36
const SNAP_THRESHOLD = 12

export default function Window({ id, title, icon, children }) {
  const { windows, close, _remove, minimize, maximize, focus, move, resize, restoreAt, snapLeft, snapRight, setSnapPreview } = useWindowStore()
  const win = windows[id]
  const isActive = useWindowStore((s) => s.activeId === id)
  const [btnHover, setBtnHover] = useState(null)
  const [titleMenu, setTitleMenu] = useState(null)
  const dragStartRef = useRef(null)

  // Close animation: wait for animation to finish, then remove
  useEffect(() => {
    if (win?.isClosing) {
      const timer = setTimeout(() => _remove(id), 160)
      return () => clearTimeout(timer)
    }
  }, [win?.isClosing, id, _remove])

  const onTitleDoubleClick = useCallback((e) => {
    if (e.target.closest('button')) return
    maximize(id)
  }, [id, maximize])

  const onTitleContextMenu = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setTitleMenu({ x: e.clientX, y: e.clientY })
  }, [])

  const onDragStart = useCallback((e, d) => {
    if (win?.isMaximized) {
      const prevW = win._prevW || 700
      const cursorX = d.lastX ?? d.x
      restoreAt(id, Math.max(0, cursorX - prevW / 2), d.y)
    }
    dragStartRef.current = { x: d.x, y: d.y }
  }, [win?.isMaximized, win?._prevW, id, restoreAt])

  // Detect snap zones during drag
  const onDrag = useCallback((e, d) => {
    const x = d.x
    const y = d.y
    if (x <= SNAP_THRESHOLD) setSnapPreview('left')
    else if (x + (win?.w || 700) >= window.innerWidth - SNAP_THRESHOLD) setSnapPreview('right')
    else if (y <= SNAP_THRESHOLD / 2) setSnapPreview('top')
    else setSnapPreview(null)
  }, [win?.w, setSnapPreview])

  const onDragStop = useCallback((e, d) => {
    setSnapPreview(null)
    if (d.y <= SNAP_THRESHOLD / 2 && !win?.isMaximized) {
      maximize(id)
    } else if (d.x <= SNAP_THRESHOLD) {
      snapLeft(id)
    } else if (d.x + (win?.w || 700) >= window.innerWidth - SNAP_THRESHOLD) {
      snapRight(id)
    } else {
      move(id, d.x, d.y)
    }
  }, [id, win?.isMaximized, win?.w, maximize, snapLeft, snapRight, move, setSnapPreview])

  // Early return AFTER all hooks
  if (!win || !win.isOpen || (win.isMinimized && !win.isClosing)) return null

  const isClosing = win.isClosing

  const btnStyle = (type) => {
    const colors = { close: '#ff5f57', min: '#febc2e', max: '#28c840' }
    const isH = btnHover === type
    return {
      width: 12, height: 12, borderRadius: '50%',
      background: isActive ? colors[type] : 'rgba(255,255,255,0.12)',
      border: 'none', cursor: 'pointer', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.15s',
      transform: isH ? 'scale(1.25)' : 'scale(1)',
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

  const menuItems = [
    { label: win.isMaximized ? '↙ 복원' : '↗ 최대화', action: () => maximize(id) },
    { label: '— 최소화', action: () => minimize(id) },
    { label: '◧ 왼쪽 스냅', action: () => snapLeft(id) },
    { label: '◨ 오른쪽 스냅', action: () => snapRight(id) },
    { type: 'divider' },
    { label: '✕ 닫기', action: () => close(id), color: '#ff5f57' },
  ]

  return (
    <>
      <Rnd
        style={{
          zIndex: win.zIndex,
          animation: isClosing ? 'windowClose 0.15s ease-in forwards' : 'windowOpen 0.2s ease-out',
          position: 'absolute',
          // Dim inactive windows
          opacity: isClosing ? undefined : (isActive ? 1 : 0.82),
          filter: isActive ? 'none' : 'brightness(0.75)',
          transition: 'opacity 0.2s, filter 0.2s',
          pointerEvents: isClosing ? 'none' : 'auto',
        }}
        size={{ width: win.w, height: win.h }}
        position={{ x: win.x, y: win.y }}
        minWidth={320}
        minHeight={220}
        bounds="parent"
        dragHandleClassName="titlebar-drag"
        enableResizing={!win.isMaximized && !win.snapped}
        onDragStart={onDragStart}
        onDrag={onDrag}
        onDragStop={onDragStop}
        onResizeStop={(e, dir, ref, delta, pos) => resize(id, ref.offsetWidth, ref.offsetHeight, pos.x, pos.y)}
        onMouseDown={() => focus(id)}
      >
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column',
          background: 'var(--bg-window)',
          border: isActive ? '1px solid rgba(59,130,246,0.25)' : '1px solid var(--border)',
          borderRadius: (win.isMaximized || win.snapped) ? 0 : 'var(--radius-window)',
          boxShadow: isActive ? 'var(--shadow-window-active)' : 'var(--shadow-window)',
          overflow: 'hidden',
          transition: 'border-color var(--transition-normal), box-shadow var(--transition-normal), border-radius var(--transition-fast)',
        }}>
          {/* Titlebar */}
          <div className="titlebar-drag" onDoubleClick={onTitleDoubleClick} onContextMenu={onTitleContextMenu}
            style={{
              height: TITLEBAR_H, minHeight: TITLEBAR_H,
              background: isActive ? 'var(--bg-titlebar)' : 'var(--bg-titlebar-inactive)',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', padding: '0 12px', gap: 10, userSelect: 'none',
            }}
          >
            <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
              {['close', 'min', 'max'].map(type => (
                <button key={type} style={btnStyle(type)}
                  onMouseEnter={() => setBtnHover(type)} onMouseLeave={() => setBtnHover(null)}
                  onClick={e => { e.stopPropagation(); if (type === 'close') close(id); if (type === 'min') minimize(id); if (type === 'max') maximize(id) }}
                >{btnIcon(type)}</button>
              ))}
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <span style={{ fontSize: 13 }}>{icon}</span>
              <span style={{ fontSize: 12.5, color: isActive ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 500 }}>{title}</span>
            </div>
            <div style={{ width: 52 }} />
          </div>

          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>{children}</div>
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
            padding: '4px 0', minWidth: 160, boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
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
