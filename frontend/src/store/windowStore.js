import { create } from 'zustand'

let zCounter = 100

const DEFAULT_SIZES = {
  terminal:  { w: 700, h: 440 },
  vscode:    { w: 860, h: 580 },
  claude:    { w: 480, h: 560 },
  monitor:   { w: 560, h: 420 },
  files:     { w: 600, h: 440 },
  kasm:      { w: 900, h: 600 },
  settings:  { w: 480, h: 380 },
}

const DEFAULT_POS = (id, index = 0) => ({
  x: 80 + index * 32,
  y: 48 + index * 28,
})

export const useWindowStore = create((set, get) => ({
  windows: {},   // id -> { id, title, icon, isOpen, isMinimized, zIndex, x, y, w, h }
  activeId: null,

  registerApp: (app) => set((state) => {
    if (state.windows[app.id]) return state
    const size = DEFAULT_SIZES[app.id] || { w: 600, h: 400 }
    const pos = DEFAULT_POS(app.id, Object.keys(state.windows).length)
    return {
      windows: {
        ...state.windows,
        [app.id]: {
          ...app,
          isOpen: false,
          isMinimized: false,
          isMaximized: false,
          zIndex: zCounter,
          x: pos.x,
          y: pos.y,
          w: size.w,
          h: size.h,
          _prevX: null,
          _prevY: null,
          _prevW: null,
          _prevH: null,
        }
      }
    }
  }),

  open: (id) => set((state) => {
    const z = ++zCounter
    return {
      activeId: id,
      windows: {
        ...state.windows,
        [id]: {
          ...state.windows[id],
          isOpen: true,
          isMinimized: false,
          zIndex: z,
        }
      }
    }
  }),

  close: (id) => set((state) => ({
    activeId: state.activeId === id ? null : state.activeId,
    windows: {
      ...state.windows,
      [id]: { ...state.windows[id], isOpen: false }
    }
  })),

  minimize: (id) => set((state) => ({
    activeId: state.activeId === id ? null : state.activeId,
    windows: {
      ...state.windows,
      [id]: { ...state.windows[id], isMinimized: true }
    }
  })),

  focus: (id) => set((state) => {
    const z = ++zCounter
    return {
      activeId: id,
      windows: {
        ...state.windows,
        [id]: {
          ...state.windows[id],
          zIndex: z,
          isMinimized: false,
        }
      }
    }
  }),

  move: (id, x, y) => set((state) => ({
    windows: {
      ...state.windows,
      [id]: { ...state.windows[id], x, y }
    }
  })),

  resize: (id, w, h, x, y) => set((state) => ({
    windows: {
      ...state.windows,
      [id]: { ...state.windows[id], w, h, x, y }
    }
  })),

  maximize: (id) => set((state) => {
    const win = state.windows[id]
    if (!win) return state
    const isMaximized = Boolean(win.isMaximized)
    const restoreBounds = {
      x: win._prevX ?? 80,
      y: win._prevY ?? 48,
      w: win._prevW ?? 600,
      h: win._prevH ?? 400,
    }
    return {
      windows: {
        ...state.windows,
        [id]: {
          ...win,
          isMaximized: !isMaximized,
          ...(isMaximized
            ? restoreBounds
            : { _prevX: win.x, _prevY: win.y, _prevW: win.w, _prevH: win.h,
                x: 0, y: 0,
                w: window.innerWidth,
                h: window.innerHeight - 48 })
        }
      }
    }
  }),
}))
