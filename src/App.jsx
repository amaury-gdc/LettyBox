import Header from './components/Header/Header.jsx'
import EmailPanel from './components/EmailPanel/EmailPanel.jsx'
import ClientPanel from './components/ClientPanel/ClientPanel.jsx'
import styles from './App.module.css'

export default function App() {
  return (
    <div className={styles.app}>
      <Header />
      <main className={styles.main}>
        <EmailPanel />
        <ClientPanel />
      </main>
    </div>
  )
}
