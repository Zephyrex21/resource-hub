import { create } from 'zustand'

// Cross-cutting UI state that used to be prop-drilled between RootLayout and
// Navbar (searchOpen + a setter passed down two levels). Zustand lets any
// component — Navbar's search button, the ⌘K shortcut, CommandPalette
// itself — read/write this directly without threading props, and gives us a
// single place to grow shared UI state (recent searches, palette history)
// without more prop plumbing.
interface UIState {
  commandPaletteOpen: boolean
  openCommandPalette: () => void
  closeCommandPalette: () => void
  toggleCommandPalette: () => void

  recentSearches: string[]
  addRecentSearch: (query: string) => void

  askPanelOpen: boolean
  openAskPanel: () => void
  closeAskPanel: () => void
  toggleAskPanel: () => void
}

const MAX_RECENT_SEARCHES = 5

export const useUIStore = create<UIState>((set, get) => ({
  commandPaletteOpen: false,
  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),
  toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),

  recentSearches: [],
  addRecentSearch: (query) => {
    const trimmed = query.trim()
    if (!trimmed) return
    const existing = get().recentSearches.filter((q) => q.toLowerCase() !== trimmed.toLowerCase())
    set({ recentSearches: [trimmed, ...existing].slice(0, MAX_RECENT_SEARCHES) })
  },

  askPanelOpen: false,
  openAskPanel: () => set({ askPanelOpen: true }),
  closeAskPanel: () => set({ askPanelOpen: false }),
  toggleAskPanel: () => set((s) => ({ askPanelOpen: !s.askPanelOpen })),
}))
