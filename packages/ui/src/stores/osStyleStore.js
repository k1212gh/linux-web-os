import { create } from 'zustand'

// OS styles: 'macos' | 'windows' | 'gnome'
const STORAGE_KEY = 'agentos-os-style'

const initialStyle = typeof window !== 'undefined'
  ? (localStorage.getItem(STORAGE_KEY) || 'windows')
  : 'windows'

export const useOsStyleStore = create((set) => ({
  osStyle: initialStyle,

  setOsStyle: (style) => {
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, style)
    set({ osStyle: style })
  },
}))
