import { useEmailStore } from '../../store/emailStore.js'
import DigestBlock from '../DigestBlock/DigestBlock.jsx'
import EmailItem from '../EmailItem/EmailItem.jsx'
import styles from './EmailPanel.module.css'

export default function EmailPanel() {
  const { emails, digest, isLoading, error } = useEmailStore()

  return (
    <section className={styles.panel}>
      <div className={styles.body}>
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
              <p className={styles.emptyText}>Aucun email non lu</p>
              <p className={styles.emptyHint}>Connectez votre compte Gmail pour commencer</p>
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
