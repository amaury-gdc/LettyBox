import { useState } from 'react'
import { useClientStore } from '../../store/clientStore.js'
import styles from './ClientCard.module.css'

const STATUS_LABELS = {
  actif: 'Actif',
  prospect: 'Prospect',
  inactif: 'Inactif',
}

const PRIORITY_LABELS = {
  high: 'Haute',
  medium: 'Moyenne',
  low: 'Basse',
}

export default function ClientCard({ client, isSelected, onSelect }) {
  const [editingNotes, setEditingNotes] = useState(false)
  const [notesValue, setNotesValue] = useState(client.notes)
  const { updateClient, deleteClient } = useClientStore()

  function saveNotes() {
    updateClient(client.id, { notes: notesValue })
    setEditingNotes(false)
  }

  function handleDelete(e) {
    e.stopPropagation()
    if (confirm(`Supprimer la fiche de ${client.name} ?`)) {
      deleteClient(client.id)
    }
  }

  return (
    <article
      className={`${styles.card} ${isSelected ? styles.selected : ''} ${styles[`priority_${client.priority}`]}`}
      onClick={onSelect}
    >
      <div className={styles.header}>
        <div className={styles.identity}>
          <div className={styles.avatarWrapper}>
            <div className={`${styles.avatar} ${styles[`status_${client.status}`]}`}>
              {getInitials(client.name)}
            </div>
            <span className={`${styles.priorityDot} ${styles[`dot_${client.priority}`]}`} />
          </div>
          <div className={styles.names}>
            <span className={styles.name}>{client.name}</span>
            {client.company && (
              <span className={styles.company}>{client.company}</span>
            )}
          </div>
        </div>

        <div className={styles.badges}>
          <span className={`${styles.statusBadge} ${styles[`status_${client.status}`]}`}>
            {STATUS_LABELS[client.status]}
          </span>
          <button
            className={styles.deleteBtn}
            onClick={handleDelete}
            title="Supprimer"
          >
            ×
          </button>
        </div>
      </div>

      {isSelected && (
        <div className={styles.body} onClick={(e) => e.stopPropagation()}>
          <div className={styles.contacts}>
            {client.email && (
              <ContactRow icon="@" value={client.email} href={`mailto:${client.email}`} />
            )}
            {client.phone && (
              <ContactRow icon="☎" value={client.phone} href={`tel:${client.phone}`} />
            )}
          </div>

          <div className={styles.metaRow}>
            <MetaChip label="Priorité" value={PRIORITY_LABELS[client.priority]} />
            <MetaChip label="Échanges" value={client.exchanges.length} />
            <MetaChip label="Créé" value={formatDate(client.createdAt)} />
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>Notes</span>
              {!editingNotes && (
                <button
                  className={styles.editBtn}
                  onClick={() => setEditingNotes(true)}
                >
                  Modifier
                </button>
              )}
            </div>

            {editingNotes ? (
              <div className={styles.notesEdit}>
                <textarea
                  className={styles.notesTextarea}
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  rows={4}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
                <div className={styles.notesActions}>
                  <button
                    className={styles.cancelNoteBtn}
                    onClick={() => { setNotesValue(client.notes); setEditingNotes(false) }}
                  >
                    Annuler
                  </button>
                  <button className={styles.saveNoteBtn} onClick={saveNotes}>
                    Enregistrer
                  </button>
                </div>
              </div>
            ) : (
              <p className={styles.notes}>
                {client.notes || <span className={styles.noNotes}>Aucune note</span>}
              </p>
            )}
          </div>

          {client.exchanges.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionLabel}>Historique</span>
                <span className={styles.exchangeCount}>{client.exchanges.length}</span>
              </div>
              <div className={styles.exchanges}>
                {client.exchanges.map((ex, i) => (
                  <ExchangeRow key={i} exchange={ex} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  )
}

function ContactRow({ icon, value, href }) {
  return (
    <a className={styles.contactRow} href={href} onClick={(e) => e.stopPropagation()}>
      <span className={styles.contactIcon}>{icon}</span>
      <span className={styles.contactValue}>{value}</span>
    </a>
  )
}

function MetaChip({ label, value }) {
  return (
    <div className={styles.metaChip}>
      <span className={styles.metaLabel}>{label}</span>
      <span className={styles.metaValue}>{value}</span>
    </div>
  )
}

function ExchangeRow({ exchange }) {
  return (
    <div className={styles.exchange}>
      <div className={styles.exchangeMeta}>
        <time className={styles.exchangeDate}>{formatDate(exchange.date)}</time>
        {exchange.emailId && <span className={styles.emailLink}>email</span>}
      </div>
      <div className={styles.exchangeSubject}>{exchange.subject}</div>
      <p className={styles.exchangeSummary}>{exchange.summary}</p>
    </div>
  )
}

function getInitials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
