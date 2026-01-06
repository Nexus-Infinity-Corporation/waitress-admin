import { createStore } from "zustand/vanilla"

export type UIState = {
  sidebarOpen: boolean
  isMobileMenuOpen: boolean
}

export type UIActions = {
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setMobileMenuOpen: (open: boolean) => void
  toggleMobileMenu: () => void
}

export type UIStore = UIState & UIActions

export const defaultUIState: UIState = {
  sidebarOpen: true,
  isMobileMenuOpen: false,
}

export const createUIStore = (initState: UIState = defaultUIState) => {
  return createStore<UIStore>()((set) => ({
    ...initState,
    setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setMobileMenuOpen: (open: boolean) => set({ isMobileMenuOpen: open }),
    toggleMobileMenu: () =>
      set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  }))
}

