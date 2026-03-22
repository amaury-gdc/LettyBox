import { create } from 'zustand'

export const useToastStore = create((set) => ({
  message: null,
  show: (message, duration = 2500) => {
    set({ message })
    setTimeout(() => set({ message: null }), duration)
  },
}))
