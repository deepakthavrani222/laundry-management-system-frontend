import { create } from 'zustand'

interface RefreshPromptState {
  showPrompt: boolean
  setShowPrompt: (show: boolean) => void
}

export const useRefreshPromptStore = create<RefreshPromptState>((set) => ({
  showPrompt: false,
  setShowPrompt: (show) => set({ showPrompt: show }),
}))
