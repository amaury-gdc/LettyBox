import { useState } from 'react'
import Header from './components/Header/Header.jsx'
import EmailPanel from './components/EmailPanel/EmailPanel.jsx'
import ClientPanel from './components/ClientPanel/ClientPanel.jsx'
import styles from './App.module.css'

export default function App() {
  const [emailOpen, setEmailOpen] = useState(true)
  const [clientOpen, setClientOpen] = useState(true)

  const gridCols = emailOpen && clientOpen
    ? '1fr 1fr'
    : !emailOpen && clientOpen
      ? '40px 1fr'
      : emailOpen && !clientOpen
        ? '1fr 40px'
        : '1fr 1fr'

  return (
    <div className={styles.app}>
      <Header />
      <main className={styles.main} style={{ gridTemplateColumns: gridCols }}>
        <EmailPanel
          isOpen={emailOpen}
          onClose={() => setEmailOpen(false)}
          onOpen={() => setEmailOpen(true)}
        />
        <ClientPanel
          isOpen={clientOpen}
          onClose={() => setClientOpen(false)}
          onOpen={() => setClientOpen(true)}
        />
      </main>
    </div>
  )
}
