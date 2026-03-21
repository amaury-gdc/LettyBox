import { create } from 'zustand'
import { mockEmails, mockDigest } from '../data/mockEmails'

export const useEmailStore = create((set, get) => ({
  // State
  emails: mockEmails,
  digest: mockDigest,
  isLoading: false,
  isAuthenticated: false,
  accessToken: null,
  error: null,

  // Actions
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  setAuthenticated: (token) => set({
    isAuthenticated: true,
    accessToken: token,
  }),

  logout: () => set({
    isAuthenticated: false,
    accessToken: null,
    emails: [],
    digest: null,
  }),

  setEmails: (emails) => set({ emails }),

  setDigest: (digest) => set({ digest }),

  updateEmailSummary: (emailId, summary, isUrgent) => set((state) => ({
    emails: state.emails.map((e) =>
      e.id === emailId ? { ...e, claudeSummary: summary, isUrgent } : e
    ),
  })),

  getUrgentEmails: () => get().emails.filter((e) => e.isUrgent),
}))
