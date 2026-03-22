import { useState, useRef } from 'react'
import { useClientStore } from '../../store/clientStore.js'
import { useEmailStore } from '../../store/emailStore.js'
import { useToastStore } from '../../store/toastStore.js'
import styles from './EmailItem.module.css'

export default function EmailItem({ email }) {
  const [expanded, setExpanded] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const iframeRef = useRef(null)

  const { getClientByEmail, groups, clients } = useClientStore()
  const { removeEmail, linkEmailToClient, unlinkEmail } = useEmailStore()
  const toast = useToastStore((s) => s.show)

  function handleIframeLoad() {
    const iframe = iframeRef.current
    if (!iframe?.contentDocument) return
    const height = iframe.contentDocument.documentElement.scrollHeight
    iframe.style.height = height + 'px'
  }

  // Resolve linked client: manual link takes priority over email-address match
  const manualClient = email.linkedClientId
    ? clients.find((c) => c.id === email.linkedClientId)
    : null
  const autoClient = getClientByEmail(email.from.email)
  const linkedClient = manualClient ?? autoClient
  const isManualLink = !!manualClient

  const displayName = linkedClient ? linkedClient.name : (email.from.name || email.from.email)
  const isFavorite = linkedClient?.isFavorite ?? false
  const clientGroups = linkedClient
    ? groups.filter((g) => linkedClient.groups?.includes(g.id))
    : []

  return (
    <>
      <article
        className={`${styles.item} ${!email.isRead ? styles.unread : ''} ${email.isUrgent ? styles.urgent : ''} ${expanded ? styles.expanded : ''} ${isFavorite ? styles.favorite : ''}`}
        onClick={() => setExpanded((v) => !v)}
      >
        <div className={styles.row}>
          <span
            className={styles.indicator}
            style={{ background: email.isUrgent ? 'var(--urgent)' : !email.isRead ? 'var(--accent)' : 'var(--surface-3)' }}
          />
          <span className={styles.sender}>
            <span className={styles.senderName}>{displayName}</span>
            {clientGroups.map((g) => (
              <span
                key={g.id}
                className={styles.senderGroupDot}
                style={{ background: g.color.text }}
                title={g.name}
              />
            ))}
          </span>
          <span className={styles.subject}>{email.subject}</span>
          <span className={styles.snippet}>{email.snippet}</span>
          <time className={styles.time}>{formatDate(email.date)}</time>
        </div>

        {expanded && (
          <div className={styles.details} onClick={(e) => e.stopPropagation()}>
            {email.claudeSummary && (
              <div className={styles.aiSummary}>
                <div className={styles.aiLabel}>
                  <span>◆</span>
                  <span>Résumé IA</span>
                </div>
                <p className={styles.aiText}>{email.claudeSummary}</p>
              </div>
            )}

            {email.bodyHtml ? (
              <iframe
                ref={iframeRef}
                className={styles.emailFrame}
                srcDoc={buildSrcdoc(email.bodyHtml)}
                sandbox="allow-same-origin allow-popups"
                onLoad={handleIframeLoad}
                title="Contenu de l'email"
              />
            ) : (
              <p className={styles.fullSnippet}>{email.body || email.snippet}</p>
            )}

            <div className={styles.actions}>
              <div className={styles.clientLinkArea}>
                {linkedClient ? (
                  <>
                    <span className={styles.linkedClientTag}>
                      <span className={styles.linkedDot} />
                      <strong>{linkedClient.name}</strong>
                    </span>
                    <button
                      className={styles.changeLinkBtn}
                      onClick={() => setShowPicker((v) => !v)}
                    >
                      Changer
                    </button>
                    {isManualLink && (
                      <button
                        className={styles.unlinkBtn}
                        onClick={() => { unlinkEmail(email.id); toast('Client délié') }}
                        title="Délier ce client"
                      >
                        ×
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      className={styles.actionBtn}
                      onClick={() => {
                        useClientStore.getState().createClient({
                          name: email.from.name || email.from.email,
                          company: '',
                          email: email.from.email,
                          phone: '',
                          status: 'prospect',
                          priority: 'medium',
                          notes: '',
                        })
                        toast('Fiche client créée')
                      }}
                    >
                      + Créer fiche client
                    </button>
                    <button
                      className={styles.actionBtn}
                      onClick={() => setShowPicker((v) => !v)}
                    >
                      Lier à un client ▾
                    </button>
                  </>
                )}

                {showPicker && (
                  <ClientPicker
                    clients={clients}
                    currentClientId={linkedClient?.id}
                    onSelect={(clientId) => {
                      linkEmailToClient(email.id, clientId)
                      setShowPicker(false)
                      const c = clients.find((cl) => cl.id === clientId)
                      toast(c ? `Lié à ${c.name}` : 'Client lié')
                    }}
                    onClose={() => setShowPicker(false)}
                  />
                )}
              </div>

              <button
                className={`${styles.actionBtn} ${styles.doneBtn}`}
                onClick={() => setShowModal(true)}
              >
                ✓ Mail traité
              </button>
            </div>
          </div>
        )}
      </article>

      {showModal && (
        <ProcessModal
          onConfirm={() => { setShowModal(false); removeEmail(email.id) }}
          onCancel={() => setShowModal(false)}
        />
      )}
    </>
  )
}

function ClientPicker({ clients, currentClientId, onSelect, onClose }) {
  const [search, setSearch] = useState('')
  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={styles.picker}>
      <input
        className={styles.pickerSearch}
        placeholder="Rechercher un client…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        autoFocus
      />
      <div className={styles.pickerList}>
        {filtered.length === 0 ? (
          <div className={styles.pickerEmpty}>Aucun client trouvé</div>
        ) : (
          filtered.map((c) => (
            <button
              key={c.id}
              className={`${styles.pickerItem} ${c.id === currentClientId ? styles.pickerItemActive : ''}`}
              onClick={() => onSelect(c.id)}
            >
              <span className={styles.pickerName}>{c.name}</span>
              {c.email && <span className={styles.pickerEmail}>{c.email}</span>}
            </button>
          ))
        )}
      </div>
    </div>
  )
}

function ProcessModal({ onConfirm, onCancel }) {
  const [checks, setChecks] = useState({ client: false, replied: false, payment: false })
  const allChecked = Object.values(checks).every(Boolean)
  const toggle = (key) => setChecks((c) => ({ ...c, [key]: !c[key] }))

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>Traiter cet email</h3>
        <p className={styles.modalSubtitle}>Confirme avoir bien effectué les étapes suivantes :</p>
        <div className={styles.checklist}>
          <label className={styles.checkItem}>
            <input type="checkbox" checked={checks.client} onChange={() => toggle('client')} className={styles.checkbox} />
            <span>Informations client enregistrées</span>
          </label>
          <label className={styles.checkItem}>
            <input type="checkbox" checked={checks.replied} onChange={() => toggle('replied')} className={styles.checkbox} />
            <span>Réponse envoyée</span>
          </label>
          <label className={styles.checkItem}>
            <input type="checkbox" checked={checks.payment} onChange={() => toggle('payment')} className={styles.checkbox} />
            <span>Paiements vérifiés</span>
          </label>
        </div>
        <div className={styles.modalActions}>
          <button className={styles.cancelBtn} onClick={onCancel}>Annuler</button>
          <button className={styles.confirmBtn} onClick={onConfirm} disabled={!allChecked}>
            OK — Marquer comme traité
          </button>
        </div>
      </div>
    </div>
  )
}

function buildSrcdoc(html) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    * { box-sizing: border-box; }
    body {
      font-family: Roboto, Arial, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #1c1a17;
      background: #ffffff;
      padding: 16px;
      margin: 0;
      word-break: break-word;
      overflow-wrap: break-word;
    }
    img { max-width: 100%; height: auto; }
    a { color: #9b2335; }
    p { margin-bottom: 10px; }
    pre { white-space: pre-wrap; font-family: inherit; }
    table { max-width: 100% !important; width: auto !important; }
    td, th { word-break: break-word; }
  </style></head><body>${html}</body></html>`
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
