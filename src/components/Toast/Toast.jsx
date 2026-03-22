import { useToastStore } from '../../store/toastStore.js'
import styles from './Toast.module.css'

export default function Toast() {
  const message = useToastStore((s) => s.message)
  if (!message) return null

  return (
    <div className={styles.toast}>
      <span className={styles.icon}>✓</span>
      <span>{message}</span>
    </div>
  )
}
