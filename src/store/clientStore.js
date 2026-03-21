import { create } from 'zustand'
import { mockClients } from '../data/mockClients'

const STORAGE_KEY = 'lettybox_clients'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveToStorage(clients) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients))
  } catch {
    // silently fail
  }
}

export const useClientStore = create((set, get) => ({
  // State — hydrate from localStorage, fallback to mock data
  clients: loadFromStorage() ?? mockClients,
  selectedClientId: null,
  filterStatus: 'all',
  filterPriority: 'all',
  searchQuery: '',

  // Selectors
  getFilteredClients: () => {
    const { clients, filterStatus, filterPriority, searchQuery } = get()
    return clients.filter((c) => {
      if (filterStatus !== 'all' && c.status !== filterStatus) return false
      if (filterPriority !== 'all' && c.priority !== filterPriority) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (
          !c.name.toLowerCase().includes(q) &&
          !c.company.toLowerCase().includes(q) &&
          !c.email.toLowerCase().includes(q)
        ) return false
      }
      return true
    })
  },

  getClientByEmail: (email) =>
    get().clients.find((c) => c.email.toLowerCase() === email.toLowerCase()),

  // Actions
  setSelectedClient: (id) => set({ selectedClientId: id }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setFilterPriority: (priority) => set({ filterPriority: priority }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  createClient: (data) => {
    const client = {
      id: `client_${Date.now()}`,
      exchanges: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    }
    set((state) => {
      const clients = [client, ...state.clients]
      saveToStorage(clients)
      return { clients }
    })
    return client
  },

  updateClient: (id, data) => {
    set((state) => {
      const clients = state.clients.map((c) =>
        c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
      )
      saveToStorage(clients)
      return { clients }
    })
  },

  deleteClient: (id) => {
    set((state) => {
      const clients = state.clients.filter((c) => c.id !== id)
      saveToStorage(clients)
      return { clients, selectedClientId: state.selectedClientId === id ? null : state.selectedClientId }
    })
  },

  addExchange: (clientId, exchange) => {
    set((state) => {
      const clients = state.clients.map((c) =>
        c.id === clientId
          ? {
              ...c,
              exchanges: [exchange, ...c.exchanges],
              updatedAt: new Date().toISOString(),
            }
          : c
      )
      saveToStorage(clients)
      return { clients }
    })
  },
}))
