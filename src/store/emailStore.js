import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { fetchUnreadEmails } from '../services/gmailService'
import { analyzeEmails } from '../services/claudeService'

export const useEmailStore = create(
  persist(
    (set, get) => ({
      // State
      emails: [],
      digest: null,
      isLoading: false,
      isAnalyzing: false,
      isAuthenticated: false,
      accessToken: null,
      error: null,
      warning: null,
      searchQuery: '',

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
        set({ isLoading: true, error: null, warning: null })
        try {
          const { emails: fetched, failedCount } = await fetchUnreadEmails(accessToken)
          const existing = get().emails
          const existingIds = new Set(existing.map((e) => e.id))
          const newEmails = fetched.filter((e) => !existingIds.has(e.id))
          // New emails go to the top
          const allEmails = [...newEmails, ...existing]
          set({
            emails: allEmails,
            isLoading: false,
            warning: failedCount > 0
              ? `${failedCount} email${failedCount > 1 ? 's' : ''} n'ont pas pu être chargé${failedCount > 1 ? 's' : ''}`
              : null,
          })

          // Analyze new emails with Claude (non-blocking)
          const emailsToAnalyze = newEmails.filter((e) => !e.claudeSummary)
          if (emailsToAnalyze.length > 0) {
            get().runAnalysis(emailsToAnalyze)
          }
        } catch (err) {
          set({ error: err.message, isLoading: false })
        }
      },

      runAnalysis: async (emailsToAnalyze) => {
        set({ isAnalyzing: true })
        try {
          const result = await analyzeEmails(emailsToAnalyze)

          // Update digest
          set({
            digest: {
              globalSummary: result.globalSummary,
              urgentCount: result.urgentCount,
              generatedAt: new Date().toISOString(),
            },
          })

          // Update per-email summaries and urgency
          for (const analyzed of (result.emails ?? [])) {
            get().updateEmailSummary(analyzed.id, analyzed.summary, analyzed.isUrgent)
          }

          set({ isAnalyzing: false })
        } catch (err) {
          console.error('Claude analysis failed:', err)
          set({
            isAnalyzing: false,
            error: `Analyse IA échouée : ${err.message}`,
          })
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

      setSearchQuery: (searchQuery) => set({ searchQuery }),

      getFilteredEmails: () => {
        const { emails, searchQuery } = get()
        if (!searchQuery.trim()) return emails
        const q = searchQuery.toLowerCase()
        return emails.filter((e) =>
          (e.from?.name ?? '').toLowerCase().includes(q) ||
          (e.from?.email ?? '').toLowerCase().includes(q) ||
          (e.subject ?? '').toLowerCase().includes(q) ||
          (e.snippet ?? '').toLowerCase().includes(q)
        )
      },

      getUrgentEmails: () => get().emails.filter((e) => e.isUrgent),
    }),
    {
      name: 'lettybox-emails',
      partialize: (state) => ({ emails: state.emails, digest: state.digest }),
    }
  )
)
