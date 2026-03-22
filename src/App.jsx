import { useState } from 'react'
import Header from './components/Header/Header.jsx'
import EmailPanel from './components/EmailPanel/EmailPanel.jsx'
import ClientPanel from './components/ClientPanel/ClientPanel.jsx'
import Toast from './components/Toast/Toast.jsx'
import styles from './App.module.css'

export default function App() {
  const [activeTab, setActiveTab] = useState('inbox')

  return (
    <div className={styles.app}>
      <Header />
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'inbox' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('inbox')}
        >
          Boîte de réception
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'clients' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('clients')}
        >
          Clients
        </button>
      </div>
      <main className={styles.main}>
        {activeTab === 'inbox' && <EmailPanel />}
        {activeTab === 'clients' && <ClientPanel />}
      </main>
      <Toast />
    </div>
  )
}
