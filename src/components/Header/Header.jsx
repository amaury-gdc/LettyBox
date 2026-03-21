import { useGoogleLogin } from '@react-oauth/google'
import { useEmailStore } from '../../store/emailStore.js'
import styles from './Header.module.css'

export default function Header() {
  const { isAuthenticated, emails, digest, isLoading } = useEmailStore()
  const urgentCount = emails.filter((e) => e.isUrgent).length
  const unreadCount = emails.filter((e) => !e.isRead).length

  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/gmail.readonly',
    onSuccess: (response) => {
      const store = useEmailStore.getState()
      store.setAuthenticated(response.access_token)
      store.loadEmails(response.access_token)
    },
    onError: (err) => console.error('OAuth error:', err),
  })

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.logo}>✦</span>
        <h1 className={styles.title}>LettyBox</h1>
      </div>

      <div className={styles.searchBar}>
        <div className={styles.searchWrapper}>
          <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Rechercher dans les emails"
          />
        </div>
      </div>

      <div className={styles.stats}>
        {unreadCount > 0 && (
          <span className={styles.statBadge}>
            <span className={styles.statValue}>{unreadCount}</span>
            <span className={styles.statLabel}>non lus</span>
          </span>
        )}
        {urgentCount > 0 && (
          <span className={`${styles.statBadge} ${styles.urgent}`}>
            <span className={styles.statValue}>{urgentCount}</span>
            <span className={styles.statLabel}>urgent{urgentCount > 1 ? 's' : ''}</span>
          </span>
        )}
        {digest && (
          <span className={styles.digestTime}>
            Digest il y a {formatRelative(digest.generatedAt)}
          </span>
        )}
      </div>

      <div className={styles.actions}>
        <button
          className={styles.refreshBtn}
          disabled={isLoading || !isAuthenticated}
          onClick={() => {
            const store = useEmailStore.getState()
            if (store.accessToken) store.loadEmails(store.accessToken)
          }}
          title="Actualiser les emails"
        >
          <RefreshIcon spinning={isLoading} />
          <span>Refresh</span>
        </button>
        {isAuthenticated ? (
          <button className={styles.authBtn} onClick={() => useEmailStore.getState().logout()}>
            Déconnexion
          </button>
        ) : (
          <button className={`${styles.authBtn} ${styles.authBtnPrimary}`} onClick={() => login()}>
            Connecter Gmail
          </button>
        )}
      </div>
    </header>
  )
}

function RefreshIcon({ spinning }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ animation: spinning ? 'spin 1s linear infinite' : 'none' }}
    >
      <path d="M21 2v6h-6" />
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M3 22v-6h6" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    </svg>
  )
}

function formatRelative(isoDate) {
  const diff = Date.now() - new Date(isoDate).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "quelques secondes"
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}j`
}
