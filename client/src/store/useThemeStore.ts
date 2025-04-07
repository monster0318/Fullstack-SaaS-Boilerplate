import { create } from "zustand"

interface ThemeState {
  isDarkMode: boolean
  toggleDarkMode: () => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDarkMode: false,
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
}))
