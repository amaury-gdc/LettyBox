import { create } from 'zustand'
import { mockClients } from '../data/mockClients'

const STORAGE_KEY = 'lettybox_clients'

// Predefined group color palette — warm tones matching ARIRANG design system
const GROUP_COLORS = [
  { bg: '#e8edf8', text: '#1a3870' }, // indigo
  { bg: '#e8f4ed', text: '#1a5c30' }, // forest
  { bg: '#f8ede8', text: '#7a2d10' }, // terracotta
  { bg: '#f0e8f8', text: '#4a1a7a' }, // purple
  { bg: '#f8e8f2', text: '#7a1a50' }, // rose
  { bg: '#e8f4f2', text: '#1a5048' }, // teal
  { bg: '#f8f2e8', text: '#7a5218' }, // amber
]

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    // Migrate old format (plain array) to new format
    if (Array.isArray(parsed)) return { clients: parsed, groups: [] }
    return parsed
  } catch {
    return null
  }
}

function saveToStorage({ clients, groups }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ clients, groups }))
  } catch {}
}

const stored = loadFromStorage()
const initialClients = (stored?.clients ?? mockClients).map((c) => ({
  isFavorite: false,
  groups: [],
  ...c,
}))
const initialGroups = stored?.groups ?? []

export const useClientStore = create((set, get) => ({
  // State
  clients: initialClients,
  groups: initialGroups,
  selectedClientId: null,
  filterStatus: 'all',
  filterPriority: 'all',
  filterGroup: 'all',
  searchQuery: '',

  // Selectors
  getFilteredClients: () => {
    const { clients, filterStatus, filterPriority, filterGroup, searchQuery } = get()
    return clients.filter((c) => {
      if (filterStatus !== 'all' && c.status !== filterStatus) return false
      if (filterPriority !== 'all' && c.priority !== filterPriority) return false
      if (filterGroup === 'favorites' && !c.isFavorite) return false
      if (filterGroup !== 'all' && filterGroup !== 'favorites' && !c.groups?.includes(filterGroup)) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (
          !c.name.toLowerCase().includes(q) &&
          !c.company?.toLowerCase().includes(q) &&
          !c.email?.toLowerCase().includes(q)
        ) return false
      }
      return true
    })
  },

  getClientByEmail: (email) =>
    get().clients.find((c) => c.email?.toLowerCase() === email?.toLowerCase()),

  // Actions — clients
  setSelectedClient: (id) => set({ selectedClientId: id }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setFilterPriority: (priority) => set({ filterPriority: priority }),
  setFilterGroup: (group) => set({ filterGroup: group }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  createClient: (data) => {
    const client = {
      id: `client_${Date.now()}`,
      exchanges: [],
      isFavorite: false,
      groups: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    }
    set((state) => {
      const clients = [client, ...state.clients]
      saveToStorage({ clients, groups: state.groups })
      return { clients }
    })
    return client
  },

  updateClient: (id, data) => {
    set((state) => {
      const clients = state.clients.map((c) =>
        c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
      )
      saveToStorage({ clients, groups: state.groups })
      return { clients }
    })
  },

  deleteClient: (id) => {
    set((state) => {
      const clients = state.clients.filter((c) => c.id !== id)
      saveToStorage({ clients, groups: state.groups })
      return {
        clients,
        selectedClientId: state.selectedClientId === id ? null : state.selectedClientId,
      }
    })
  },

  toggleFavorite: (id) => {
    set((state) => {
      const clients = state.clients.map((c) =>
        c.id === id ? { ...c, isFavorite: !c.isFavorite, updatedAt: new Date().toISOString() } : c
      )
      saveToStorage({ clients, groups: state.groups })
      return { clients }
    })
  },

  addExchange: (clientId, exchange) => {
    set((state) => {
      const clients = state.clients.map((c) =>
        c.id === clientId
          ? { ...c, exchanges: [exchange, ...c.exchanges], updatedAt: new Date().toISOString() }
          : c
      )
      saveToStorage({ clients, groups: state.groups })
      return { clients }
    })
  },

  // Actions — groups
  createGroup: (name) => {
    const { groups } = get()
    const color = GROUP_COLORS[groups.length % GROUP_COLORS.length]
    const group = { id: `group_${Date.now()}`, name, color }
    set((state) => {
      const newGroups = [...state.groups, group]
      saveToStorage({ clients: state.clients, groups: newGroups })
      return { groups: newGroups }
    })
    return group
  },

  deleteGroup: (groupId) => {
    set((state) => {
      const groups = state.groups.filter((g) => g.id !== groupId)
      const clients = state.clients.map((c) => ({
        ...c,
        groups: c.groups?.filter((gid) => gid !== groupId) ?? [],
      }))
      saveToStorage({ clients, groups })
      return { clients, groups }
    })
  },

  toggleClientGroup: (clientId, groupId) => {
    set((state) => {
      const clients = state.clients.map((c) => {
        if (c.id !== clientId) return c
        const has = c.groups?.includes(groupId)
        return {
          ...c,
          groups: has
            ? c.groups.filter((gid) => gid !== groupId)
            : [...(c.groups ?? []), groupId],
          updatedAt: new Date().toISOString(),
        }
      })
      saveToStorage({ clients, groups: state.groups })
      return { clients }
    })
  },
}))
