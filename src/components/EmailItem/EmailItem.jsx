import { useState } from 'react'
import { useClientStore } from '../../store/clientStore.js'
import styles from './EmailItem.module.css'

export default function EmailItem({ email }) {
  const [expanded, setExpanded] = useState(false)
  const { getClientByEmail } = useClientStore()

  const linkedClient = getClientByEmail(email.from.email)

  return (
    <article
      className={`${styles.item} ${email.isUrgent ? styles.urgent : ''} ${expanded ? styles.expanded : ''}`}
      onClick={() => setExpanded((v) => !v)}
    >
      <div className={styles.main}>
        <div className={styles.meta}>
          <div className={styles.sender}>
            <Avatar name={email.from.name} isUrgent={email.isUrgent} />
            <div className={styles.senderInfo}>
              <span className={styles.senderName}>{email.from.name}</span>
              <span className={styles.senderEmail}>{email.from.email}</span>
            </div>
          </div>

          <div className={styles.right}>
            {email.isUrgent && (
              <span className={styles.urgentBadge}>urgent</span>
            )}
            {linkedClient && (
              <span className={styles.clientBadge} title={`Lié à ${linkedClient.name}`}>
                ◆
              </span>
            )}
            <time className={styles.time}>{formatDate(email.date)}</time>
            <ChevronIcon expanded={expanded} />
          </div>
        </div>

        <div className={styles.subject}>{email.subject}</div>

        {!expanded && (
          <p className={styles.snippet}>{email.snippet}</p>
        )}
      </div>

      {expanded && (
        <div className={styles.details} onClick={(e) => e.stopPropagation()}>
          {email.claudeSummary && (
            <div className={styles.aiSummary}>
              <div className={styles.aiLabel}>
                <span className={styles.aiIcon}>◆</span>
                <span>Résumé IA</span>
              </div>
              <p className={styles.aiText}>{email.claudeSummary}</p>
            </div>
          )}

          <div className={styles.snippet}>{email.snippet}</div>

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

function Avatar({ name, isUrgent }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className={`${styles.avatar} ${isUrgent ? styles.avatarUrgent : ''}`}>
      {initials}
    </div>
  )
}

function ChevronIcon({ expanded }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 200ms ease',
        flexShrink: 0,
        color: 'var(--text-faint)',
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
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
