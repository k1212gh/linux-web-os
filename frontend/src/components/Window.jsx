import { useRef, useEffect } from 'react'
import { Rnd } from 'react-rnd'
import { useWindowStore } from '../store/windowStore'

const TITLEBAR_H = 38

export default function Window({ id, title, icon, children }) {
  const { windows, close, minimize, maximize, focus, move, resize } = useWindowStore()
  const win = windows[id]
  if (!win || !win.isOpen || win.isMinimized) return null

  const isActive = useWindowStore((s) => s.activeId === id)

  return (
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
      onDragStop={(e, d) => move(id, d.x, d.y)}
      onResizeStop={(e, dir, ref, delta, pos) => {
        resize(id, ref.offsetWidth, ref.offsetHeight, pos.x, pos.y)
      }}
      onMouseDown={() => focus(id)}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-window)',
          border: isActive ? '1px solid rgba(59,130,246,0.35)' : '1px solid var(--border)',
          borderRadius: 'var(--radius-window)',
          boxShadow: isActive ? 'var(--shadow-window), 0 0 0 1px rgba(59,130,246,0.1)' : 'var(--shadow-window)',
          overflow: 'hidden',
          transition: 'border-color 0.15s',
        }}
      >
        {/* Titlebar */}
        <div
          className="titlebar-drag"
          style={{
            height: TITLEBAR_H,
            minHeight: TITLEBAR_H,
            background: 'var(--bg-titlebar)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 14px',
            gap: 10,
            cursor: 'move',
            userSelect: 'none',
          }}
        >
          {/* Traffic lights */}
          <div style={{ display: 'flex', gap: 6 }}>
            {['close', 'min', 'max'].map((action) => (
              <button
                key={action}
                className={`win-btn-${action}`}
                onClick={(e) => {
                  e.stopPropagation()
                  if (action === 'close')    close(id)
                  if (action === 'min')      minimize(id)
                  if (action === 'max')      maximize(id)
                }}
                style={{
                  width: 13, height: 13, borderRadius: '50%',
                  border: 'none', cursor: 'pointer', flexShrink: 0,
                  transition: 'filter 0.1s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.2)'}
                onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
              />
            ))}
          </div>

          {/* Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 1 }}>
            {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
            <span style={{
              fontSize: 12,
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: 500,
              letterSpacing: '0.01em',
            }}>
              {title}
            </span>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      </div>
    </Rnd>
  )
}
