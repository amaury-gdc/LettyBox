import { useState } from 'react'
import { useClientStore } from '../../store/clientStore.js'
import styles from './EmailItem.module.css'

export default function EmailItem({ email }) {
  const [expanded, setExpanded] = useState(false)
  const { getClientByEmail } = useClientStore()

  const linkedClient = getClientByEmail(email.from.email)
  const displayName = linkedClient ? linkedClient.name : email.from.email

  return (
    <article
      className={`${styles.item} ${!email.isRead ? styles.unread : ''} ${email.isUrgent ? styles.urgent : ''} ${expanded ? styles.expanded : ''}`}
      onClick={() => setExpanded((v) => !v)}
    >
      <div className={styles.row}>
        <span
          className={styles.indicator}
          style={{ background: email.isUrgent ? 'var(--urgent)' : !email.isRead ? 'var(--accent)' : 'var(--surface-3)' }}
        />

        <span className={styles.sender}>{displayName}</span>

        <span className={styles.subject}>{email.subject}</span>

        <span className={styles.snippet}>{email.snippet}</span>

        <time className={styles.time}>{formatDate(email.date)}</time>
      </div>

      {expanded && (
        <div className={styles.details} onClick={(e) => e.stopPropagation()}>
          {email.claudeSummary && (
            <div className={styles.aiSummary}>
              <div className={styles.aiLabel}>
                <span>◆</span>
                <span>Résumé IA</span>
              </div>
              <p className={styles.aiText}>{email.claudeSummary}</p>
            </div>
          )}

          <p className={styles.fullSnippet}>{email.snippet}</p>

          <div className={styles.actions}>
            {linkedClient ? (
              <span className={styles.linkedClientTag}>
                Client lié : <strong>{linkedClient.name}</strong>
              </span>
            ) : (
              <button
                className={styles.actionBtn}
                onClick={() => {
                  useClientStore.getState().createClient({
                    name: email.from.name,
                    company: '',
                    email: email.from.email,
                    phone: '',
                    status: 'prospect',
                    priority: 'medium',
                    notes: '',
                  })
                }}
              >
                + Créer fiche client
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  )
}

function formatDate(isoDate) {
  const date = new Date(isoDate)
  const now = new Date()
  const diff = now - date
  const hours = Math.floor(diff / 3600000)

  if (hours < 1) return `${Math.floor(diff / 60000)} min`
  if (hours < 24) return `${hours}h`
  if (hours < 48) return 'hier'
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}
