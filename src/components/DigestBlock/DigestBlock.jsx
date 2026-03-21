import styles from './DigestBlock.module.css'

export default function DigestBlock({ digest }) {
  const { globalSummary, urgentCount, generatedAt } = digest

  return (
    <div className={styles.block}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.icon}>◆</span>
          <span className={styles.title}>Digest IA</span>
        </div>
        <time className={styles.time} dateTime={generatedAt}>
          {formatRelative(generatedAt)}
        </time>
      </div>

      <p className={styles.summary}>{globalSummary}</p>

      {urgentCount > 0 && (
        <div className={styles.urgentBanner}>
          <span className={styles.urgentDot} />
          <span className={styles.urgentText}>
            {urgentCount} email{urgentCount > 1 ? 's' : ''} nécessite{urgentCount > 1 ? 'nt' : ''} votre attention
          </span>
        </div>
      )}
    </div>
  )
}

function formatRelative(isoDate) {
  const diff = Date.now() - new Date(isoDate).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'À l\'instant'
  if (minutes < 60) return `Il y a ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Il y a ${hours}h`
  return `Il y a ${Math.floor(hours / 24)}j`
}
