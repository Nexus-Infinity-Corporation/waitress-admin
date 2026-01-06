"use client"

import { type ReactNode, createContext, useState, useContext } from "react"
import { useStore } from "zustand"

import { type UIStore, createUIStore } from "@/stores/ui-store"

export type UIStoreApi = ReturnType<typeof createUIStore>

export const UIStoreContext = createContext<UIStoreApi | undefined>(undefined)

export interface StoreProviderProps {
  children: ReactNode
}

export const StoreProvider = ({ children }: StoreProviderProps) => {
  const [uiStore] = useState(() => createUIStore())

  return (
    <UIStoreContext.Provider value={uiStore}>
      {children}
    </UIStoreContext.Provider>
  )
}

export const useUIStore = <T,>(selector: (store: UIStore) => T): T => {
  const uiStoreContext = useContext(UIStoreContext)
  if (!uiStoreContext) {
    throw new Error(`useUIStore must be used within StoreProvider`)
  }

  return useStore(uiStoreContext, selector)
}

