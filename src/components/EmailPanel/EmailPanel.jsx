import { useEmailStore } from '../../store/emailStore.js'
import DigestBlock from '../DigestBlock/DigestBlock.jsx'
import EmailItem from '../EmailItem/EmailItem.jsx'
import styles from './EmailPanel.module.css'

export default function EmailPanel() {
  const { emails, digest, isLoading } = useEmailStore()

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.heading}>
          <span className={styles.headingText}>Boîte de réception</span>
          {emails.length > 0 && (
            <span className={styles.count}>{emails.length}</span>
          )}
        </h2>
        <div className={styles.headerMeta}>
          <span className={styles.columnLabel}>emails</span>
        </div>
      </div>

      <div className={styles.body}>
        {digest && <DigestBlock digest={digest} />}

        <div className={styles.emailList}>
          {isLoading ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>Chargement des emails…</p>
            </div>
          ) : emails.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>Aucun email non lu</p>
              <p className={styles.emptyHint}>
                Connectez votre compte Gmail pour commencer
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
