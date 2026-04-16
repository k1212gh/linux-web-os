import { create } from 'zustand'

let zCounter = 100

const DEFAULT_SIZES = {
  terminal:  { w: 700, h: 440 },
  vscode:    { w: 860, h: 580 },
  claude:    { w: 480, h: 560 },
  monitor:   { w: 560, h: 420 },
  files:     { w: 600, h: 440 },
  kasm:      { w: 900, h: 600 },
  settings:  { w: 480, h: 440 },
  'claude-code': { w: 860, h: 600 },
  'llm-dashboard': { w: 900, h: 600 },
  git:           { w: 680, h: 480 },
  cicd:          { w: 700, h: 500 },
  filemanager:   { w: 780, h: 500 },
  harness:    { w: 700, h: 520 },
  memo:       { w: 520, h: 440 },
  calculator: { w: 320, h: 440 },
  profile:   { w: 520, h: 600 },
  resume:    { w: 680, h: 560 },
  projects:  { w: 760, h: 520 },
  blog:      { w: 800, h: 560 },
  timeline:  { w: 560, h: 520 },
  contact:   { w: 480, h: 520 },
}

const DEFAULT_POS = (id, index = 0) => ({
  x: 80 + index * 32,
  y: 48 + index * 28,
})

const TASKBAR_H = 56
const LAYOUT_KEY = 'agentos-window-layout'

// Save/restore window positions
function saveLayout(windows) {
  try {
    const layout = {}
    Object.entries(windows).forEach(([id, w]) => {
      if (w.isOpen) {
        layout[id] = { x: w.x, y: w.y, w: w.w, h: w.h, isMaximized: w.isMaximized, snapped: w.snapped }
      }
    })
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout))
  } catch {}
}

function loadLayout() {
  try { return JSON.parse(localStorage.getItem(LAYOUT_KEY)) || {} } catch { return {} }
}

// Debounce layout save
let saveTimer = null
function debounceSaveLayout(windows) {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => saveLayout(windows), 500)
}

export const useWindowStore = create((set, get) => ({
  windows: {},
  activeId: null,
  snapPreview: null,

  registerApp: (app) => set((state) => {
    if (state.windows[app.id]) return state
    const size = DEFAULT_SIZES[app.id] || { w: 600, h: 400 }
    const pos = DEFAULT_POS(app.id, Object.keys(state.windows).length)
    // Restore saved position if exists
    const saved = loadLayout()[app.id]
    return {
      windows: {
        ...state.windows,
        [app.id]: {
          ...app, isOpen: false, isMinimized: false, isClosing: false,
          zIndex: zCounter,
          x: saved?.x ?? pos.x,
          y: saved?.y ?? pos.y,
          w: saved?.w ?? size.w,
          h: saved?.h ?? size.h,
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
        [id]: { ...state.windows[id], isOpen: true, isMinimized: false, isClosing: false, zIndex: z }
      }
    }
  }),

  // Start close animation (isClosing=true). Window.jsx calls _remove after animation.
  close: (id) => set((state) => ({
    windows: {
      ...state.windows,
      [id]: { ...state.windows[id], isClosing: true }
    }
  })),

  // Actually remove window (called after close animation finishes)
  _remove: (id) => set((state) => ({
    activeId: state.activeId === id ? null : state.activeId,
    windows: {
      ...state.windows,
      [id]: { ...state.windows[id], isOpen: false, isClosing: false }
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
        [id]: { ...state.windows[id], zIndex: z, isMinimized: false }
      }
    }
  }),

  move: (id, x, y) => set((state) => ({
    windows: { ...state.windows, [id]: { ...state.windows[id], x, y } }
  })),

  resize: (id, w, h, x, y) => set((state) => ({
    windows: { ...state.windows, [id]: { ...state.windows[id], w, h, x, y } }
  })),

  maximize: (id) => set((state) => {
    const win = state.windows[id]
    const was = win.isMaximized
    return {
      windows: {
        ...state.windows,
        [id]: {
          ...win, isMaximized: !was, snapped: null,
          ...(was
            ? { x: win._prevX, y: win._prevY, w: win._prevW, h: win._prevH }
            : { _prevX: win.x, _prevY: win.y, _prevW: win.w, _prevH: win.h,
                x: 0, y: 0, w: window.innerWidth, h: window.innerHeight - TASKBAR_H })
        }
      }
    }
  }),

  restoreAt: (id, x, y) => set((state) => {
    const win = state.windows[id]
    if (!win?.isMaximized) return state
    return {
      windows: {
        ...state.windows,
        [id]: { ...win, isMaximized: false, snapped: null, x, y, w: win._prevW || 700, h: win._prevH || 500 }
      }
    }
  }),

  snapLeft: (id) => set((state) => {
    const win = state.windows[id]
    return {
      snapPreview: null,
      windows: {
        ...state.windows,
        [id]: {
          ...win, isMaximized: false, snapped: 'left',
          _prevX: win._prevX ?? win.x, _prevY: win._prevY ?? win.y,
          _prevW: win._prevW ?? win.w, _prevH: win._prevH ?? win.h,
          x: 0, y: 0, w: Math.floor(window.innerWidth / 2), h: window.innerHeight - TASKBAR_H,
        }
      }
    }
  }),

  snapRight: (id) => set((state) => {
    const win = state.windows[id]
    return {
      snapPreview: null,
      windows: {
        ...state.windows,
        [id]: {
          ...win, isMaximized: false, snapped: 'right',
          _prevX: win._prevX ?? win.x, _prevY: win._prevY ?? win.y,
          _prevW: win._prevW ?? win.w, _prevH: win._prevH ?? win.h,
          x: Math.floor(window.innerWidth / 2), y: 0,
          w: Math.floor(window.innerWidth / 2), h: window.innerHeight - TASKBAR_H,
        }
      }
    }
  }),

  setSnapPreview: (zone) => set({ snapPreview: zone }),
}))

// Auto-save window layout on every state change (debounced)
useWindowStore.subscribe((state) => {
  debounceSaveLayout(state.windows)
})
