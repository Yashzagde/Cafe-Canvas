import { create } from 'zustand'

export type ScreenType = 'login' | 'dashboard' | 'staff' | 'locations' | 'settings' | 'ai'

interface UIState {
  currentScreen: ScreenType
  setScreen: (screen: ScreenType) => void
}

export const useUIStore = create<UIState>((set) => ({
  currentScreen: 'login',
  setScreen: (screen) => set({ currentScreen: screen })
}))
