import { create } from 'zustand'

// OS styles: 'macos' | 'windows' | 'gnome'
const STORAGE_KEY = 'agentos-os-style'

export const useOsStyleStore = create((set) => ({
  osStyle: localStorage.getItem(STORAGE_KEY) || 'windows',

  setOsStyle: (style) => {
    localStorage.setItem(STORAGE_KEY, style)
    set({ osStyle: style })
  },
}))
