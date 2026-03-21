import { useState } from 'react'
import { useClientStore } from '../../store/clientStore.js'
import { useEmailStore } from '../../store/emailStore.js'
import { fetchEmailsFromSender } from '../../services/gmailService.js'
import styles from './ClientCard.module.css'

const STATUS_LABELS = { actif: 'Actif', prospect: 'Prospect', inactif: 'Inactif' }
const PRIORITY_LABELS = { high: 'Haute', medium: 'Moyenne', low: 'Basse' }

export default function ClientCard({ client, isSelected, onSelect }) {
  const [editingNotes, setEditingNotes] = useState(false)
  const [notesValue, setNotesValue] = useState(client.notes)
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState(client.name)
  const [showGroupMenu, setShowGroupMenu] = useState(false)
  const [clientEmails, setClientEmails] = useState(null)
  const [loadingEmails, setLoadingEmails] = useState(false)

  const { updateClient, deleteClient, toggleFavorite, groups, toggleClientGroup } = useClientStore()
  const accessToken = useEmailStore((s) => s.accessToken)

  const clientGroups = groups.filter((g) => client.groups?.includes(g.id))
  const availableGroups = groups.filter((g) => !client.groups?.includes(g.id))

  function saveName() {
    const trimmed = nameValue.trim()
    if (trimmed && trimmed !== client.name) updateClient(client.id, { name: trimmed })
    else setNameValue(client.name)
    setEditingName(false)
  }

  function saveNotes() {
    updateClient(client.id, { notes: notesValue })
    setEditingNotes(false)
  }

  function handleDelete(e) {
    e.stopPropagation()
    if (confirm(`Supprimer la fiche de ${client.name} ?`)) deleteClient(client.id)
  }

  async function handleLoadEmails(e) {
    e.stopPropagation()
    if (!accessToken || !client.email) return
    setLoadingEmails(true)
    try {
      const emails = await fetchEmailsFromSender(accessToken, client.email)
      setClientEmails(emails)
    } catch {
      setClientEmails([])
    } finally {
      setLoadingEmails(false)
    }
  }

  return (
    <article
      className={`${styles.card} ${isSelected ? styles.selected : ''} ${styles[`priority_${client.priority}`]} ${client.isFavorite ? styles.favorite : ''}`}
      onClick={onSelect}
    >
      <div className={styles.header}>
        <div className={styles.identity}>
          <div className={styles.names}>
            {/* Name row — star + name + edit icon + group badges inline */}
            <div className={styles.nameRow}>
              <button
                className={`${styles.favBtn} ${client.isFavorite ? styles.favActive : ''}`}
                onClick={(e) => { e.stopPropagation(); toggleFavorite(client.id) }}
                title={client.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              >
                {client.isFavorite ? '★' : '☆'}
              </button>
              {editingName ? (
                <input
                  className={styles.nameInput}
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  onBlur={saveName}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveName()
                    if (e.key === 'Escape') { setNameValue(client.name); setEditingName(false) }
                  }}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <>
                  <span className={styles.name}>{client.name}</span>
                  <button
                    className={styles.editNameBtn}
                    onClick={(e) => { e.stopPropagation(); setEditingName(true) }}
                    title="Renommer"
                  >
                    ✎
                  </button>
                </>
              )}
              {!editingName && clientGroups.map((g) => (
                <span
                  key={g.id}
                  className={styles.groupBadge}
                  style={{ background: g.color.bg, color: g.color.text }}
                >
                  {g.name}
                </span>
              ))}
            </div>
            {client.company && <span className={styles.company}>{client.company}</span>}
          </div>
        </div>

        <div className={styles.badges}>
          <span className={`${styles.statusBadge} ${styles[`status_${client.status}`]}`}>
            {STATUS_LABELS[client.status]}
          </span>
          <button className={styles.deleteBtn} onClick={handleDelete} title="Supprimer">×</button>
        </div>
      </div>

      {isSelected && (
        <div className={styles.body} onClick={(e) => e.stopPropagation()}>
          <div className={styles.contacts}>
            {client.email && <ContactRow icon="@" value={client.email} href={`mailto:${client.email}`} />}
            {client.phone && <ContactRow icon="☎" value={client.phone} href={`tel:${client.phone}`} />}
          </div>

          <div className={styles.metaRow}>
            <MetaChip label="Priorité" value={PRIORITY_LABELS[client.priority]} />
            <MetaChip label="Échanges" value={client.exchanges.length} />
            <MetaChip label="Créé" value={formatDate(client.createdAt)} />
          </div>

          {/* Groups section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>Groupes</span>
              <div className={styles.groupActions}>
                {clientGroups.map((g) => (
                  <span
                    key={g.id}
                    className={styles.groupTag}
                    style={{ background: g.color.bg, color: g.color.text }}
                    onClick={() => toggleClientGroup(client.id, g.id)}
                    title="Retirer du groupe"
                  >
                    {g.name} ×
                  </span>
                ))}
                {availableGroups.length > 0 && (
                  <div className={styles.groupDropdownWrapper}>
                    <button
                      className={styles.addGroupBtn}
                      onClick={() => setShowGroupMenu((v) => !v)}
                    >
                      + Groupe
                    </button>
                    {showGroupMenu && (
                      <div className={styles.groupDropdown}>
                        {availableGroups.map((g) => (
                          <button
                            key={g.id}
                            className={styles.groupDropdownItem}
                            style={{ '--group-bg': g.color.bg, '--group-text': g.color.text }}
                            onClick={() => { toggleClientGroup(client.id, g.id); setShowGroupMenu(false) }}
                          >
                            <span className={styles.groupDot} style={{ background: g.color.text }} />
                            {g.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notes section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>Notes</span>
              {!editingNotes && (
                <button className={styles.editBtn} onClick={() => setEditingNotes(true)}>Modifier</button>
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
                  <button className={styles.cancelNoteBtn} onClick={() => { setNotesValue(client.notes); setEditingNotes(false) }}>Annuler</button>
                  <button className={styles.saveNoteBtn} onClick={saveNotes}>Enregistrer</button>
                </div>
              </div>
            ) : (
              <p className={styles.notes}>
                {client.notes || <span className={styles.noNotes}>Aucune note</span>}
              </p>
            )}
          </div>

          {/* Exchange history */}
          {client.exchanges.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionLabel}>Historique</span>
                <span className={styles.exchangeCount}>{client.exchanges.length}</span>
              </div>
              <div className={styles.exchanges}>
                {client.exchanges.map((ex, i) => <ExchangeRow key={i} exchange={ex} />)}
              </div>
            </div>
          )}

          {/* Load all emails from Gmail */}
          {client.email && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionLabel}>Emails Gmail</span>
                <button
                  className={styles.loadEmailsBtn}
                  onClick={handleLoadEmails}
                  disabled={!accessToken || loadingEmails}
                  title={!accessToken ? 'Connectez Gmail pour charger les emails' : ''}
                >
                  {loadingEmails ? 'Chargement…' : clientEmails ? 'Actualiser' : 'Charger les emails'}
                </button>
              </div>
              {clientEmails && (
                clientEmails.length === 0 ? (
                  <p className={styles.noNotes}>Aucun email trouvé pour ce contact</p>
                ) : (
                  <div className={styles.exchanges}>
                    {clientEmails.map((email) => (
                      <div key={email.id} className={styles.exchange}>
                        <div className={styles.exchangeMeta}>
                          <time className={styles.exchangeDate}>{formatDate(email.date)}</time>
                        </div>
                        <div className={styles.exchangeSubject}>{email.subject}</div>
                        <p className={styles.exchangeSummary}>{email.snippet}</p>
                      </div>
                    ))}
                  </div>
                )
              )}
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
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}
