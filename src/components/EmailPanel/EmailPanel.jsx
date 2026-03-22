import { useEmailStore } from '../../store/emailStore.js'
import DigestBlock from '../DigestBlock/DigestBlock.jsx'
import EmailItem from '../EmailItem/EmailItem.jsx'
import styles from './EmailPanel.module.css'

export default function EmailPanel() {
  const { digest, isLoading, isAnalyzing, error, warning, searchQuery, getFilteredEmails } = useEmailStore()
  const emails = getFilteredEmails()

  return (
    <section className={styles.panel}>
      <div className={styles.body}>
        {isAnalyzing && (
          <div className={styles.analyzingBanner}>
            <span className={styles.analyzingDot} />
            <span>Claude analyse vos emails…</span>
          </div>
        )}
        {warning && (
          <div className={styles.warningBanner}>
            <span>⚠</span>
            <span>{warning}</span>
          </div>
        )}
        {digest && <DigestBlock digest={digest} />}

        <div className={styles.emailList}>
          {isLoading ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>Chargement des emails…</p>
            </div>
          ) : error ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>Erreur lors du chargement</p>
              <p className={styles.emptyHint}>{error}</p>
            </div>
          ) : emails.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>
                {searchQuery ? 'Aucun résultat' : 'Aucun email non lu'}
              </p>
              <p className={styles.emptyHint}>
                {searchQuery ? 'Essayez un autre terme de recherche' : 'Connectez votre compte Gmail pour commencer'}
              </p>
            </div>
          ) : (
            emails.map((email) => (
              <EmailItem key={email.id} email={email} />
            ))
          )}
        </div>
      </div>
    </section>
  )
}
