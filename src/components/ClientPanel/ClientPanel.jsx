import { useState } from 'react'
import { useClientStore } from '../../store/clientStore.js'
import ClientCard from '../ClientCard/ClientCard.jsx'
import styles from './ClientPanel.module.css'

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tous' },
  { value: 'actif', label: 'Actifs' },
  { value: 'prospect', label: 'Prospects' },
  { value: 'inactif', label: 'Inactifs' },
]

const PRIORITY_OPTIONS = [
  { value: 'all', label: 'Toutes priorités' },
  { value: 'high', label: 'Haute' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'low', label: 'Basse' },
]

export default function ClientPanel() {
  const {
    filterStatus,
    filterPriority,
    searchQuery,
    selectedClientId,
    setFilterStatus,
    setFilterPriority,
    setSearchQuery,
    setSelectedClient,
    getFilteredClients,
    createClient,
  } = useClientStore()

  const [showCreateForm, setShowCreateForm] = useState(false)
  const clients = getFilteredClients()

  function handleCreateClient(e) {
    e.preventDefault()
    const fd = new FormData(e.target)
    const client = createClient({
      name: fd.get('name'),
      company: fd.get('company'),
      email: fd.get('email'),
      phone: fd.get('phone'),
      status: fd.get('status'),
      priority: fd.get('priority'),
      notes: fd.get('notes'),
    })
    setSelectedClient(client.id)
    setShowCreateForm(false)
  }

  return (
    <section className={styles.panel}>
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <SearchIcon />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Rechercher…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className={styles.clearSearch} onClick={() => setSearchQuery('')}>×</button>
          )}
        </div>

        <div className={styles.filters}>
          <select className={styles.filterSelect} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select className={styles.filterSelect} value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
            {PRIORITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button className={styles.newBtn} onClick={() => setShowCreateForm(true)}>
            <PlusIcon />
            <span>Nouveau</span>
          </button>
        </div>
      </div>

      <div className={styles.body}>
        {showCreateForm && (
          <CreateClientForm
            onSubmit={handleCreateClient}
            onCancel={() => setShowCreateForm(false)}
          />
        )}

        <div className={styles.clientList}>
          {clients.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>Aucun client trouvé</p>
              {searchQuery || filterStatus !== 'all' || filterPriority !== 'all' ? (
                <p className={styles.emptyHint}>Essayez d'autres filtres</p>
              ) : (
                <p className={styles.emptyHint}>Créez votre premier client</p>
              )}
            </div>
          ) : (
            clients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                isSelected={client.id === selectedClientId}
                onSelect={() => setSelectedClient(client.id === selectedClientId ? null : client.id)}
              />
            ))
          )}
        </div>
      </div>
    </section>
  )
}

function CreateClientForm({ onSubmit, onCancel }) {
  return (
    <form className={styles.createForm} onSubmit={onSubmit}>
      <div className={styles.formHeader}>
        <span className={styles.formTitle}>Nouvelle fiche client</span>
        <button type="button" className={styles.cancelBtn} onClick={onCancel}>×</button>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Nom *</label>
          <input name="name" required className={styles.formInput} placeholder="Jean Dupont" />
        </div>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Entreprise</label>
          <input name="company" className={styles.formInput} placeholder="Acme Corp" />
        </div>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Email</label>
          <input name="email" type="email" className={styles.formInput} placeholder="jean@acme.com" />
        </div>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Téléphone</label>
          <input name="phone" className={styles.formInput} placeholder="+33 6 12 34 56 78" />
        </div>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Statut</label>
          <select name="status" className={styles.formSelect} defaultValue="prospect">
            <option value="prospect">Prospect</option>
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
          </select>
        </div>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Priorité</label>
          <select name="priority" className={styles.formSelect} defaultValue="medium">
            <option value="low">Basse</option>
            <option value="medium">Moyenne</option>
            <option value="high">Haute</option>
          </select>
        </div>
        <div className={`${styles.formField} ${styles.formFieldFull}`}>
          <label className={styles.formLabel}>Notes</label>
          <textarea name="notes" className={styles.formTextarea} rows={3} placeholder="Informations utiles…" />
        </div>
      </div>

      <div className={styles.formActions}>
        <button type="button" className={styles.cancelBtnSm} onClick={onCancel}>Annuler</button>
        <button type="submit" className={styles.submitBtn}>Créer la fiche</button>
      </div>
    </form>
  )
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}
