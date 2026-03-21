import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { fetchUnreadEmails } from '../services/gmailService'

export const useEmailStore = create(
  persist(
    (set, get) => ({
      // State
      emails: [],
      digest: null,
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
        error: null,
        // emails kept intentionally — persistent across sessions
      }),

      loadEmails: async (accessToken) => {
        set({ isLoading: true, error: null })
        try {
          const fetched = await fetchUnreadEmails(accessToken)
          const existing = get().emails
          const existingIds = new Set(existing.map((e) => e.id))
          const newEmails = fetched.filter((e) => !existingIds.has(e.id))
          // New emails go to the top
          set({ emails: [...newEmails, ...existing], isLoading: false })
        } catch (err) {
          set({ error: err.message, isLoading: false })
        }
      },

      removeEmail: (emailId) => set((state) => ({
        emails: state.emails.filter((e) => e.id !== emailId),
      })),

      linkEmailToClient: (emailId, clientId) => set((state) => ({
        emails: state.emails.map((e) =>
          e.id === emailId ? { ...e, linkedClientId: clientId } : e
        ),
      })),

      unlinkEmail: (emailId) => set((state) => ({
        emails: state.emails.map((e) =>
          e.id === emailId ? { ...e, linkedClientId: null } : e
        ),
      })),

      setDigest: (digest) => set({ digest }),

      updateEmailSummary: (emailId, summary, isUrgent) => set((state) => ({
        emails: state.emails.map((e) =>
          e.id === emailId ? { ...e, claudeSummary: summary, isUrgent } : e
        ),
      })),

      getUrgentEmails: () => get().emails.filter((e) => e.isUrgent),
    }),
    {
      name: 'lettybox-emails',
      partialize: (state) => ({ emails: state.emails, digest: state.digest }),
    }
  )
)
