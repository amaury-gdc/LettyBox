# LettyBox — CLAUDE.md

## Vue d'ensemble

LettyBox est une app web React + Vite qui fait deux choses :
1. **Digest IA des emails Gmail non lus** — connexion OAuth Gmail, récupération des non lus, analyse par Claude
2. **CRM léger** — fiches clients avec historique auto-alimenté depuis les emails analysés

## Design System

| Token | Valeur |
|-------|--------|
| `--bg` | `#0e0e11` |
| `--surface` | `#16161a` |
| `--surface-2` | `#1e1e24` |
| `--border` | `#2a2a35` |
| `--accent` | `#c8f064` |
| `--text` | `#e8e8f0` |
| `--text-muted` | `#8888a0` |
| `--urgent` | `#ff6b6b` |
| `--font-display` | `'DM Serif Display', serif` |
| `--font-ui` | `'Syne', sans-serif` |
| `--font-mono` | `'DM Mono', monospace` |

## Architecture des composants

```
src/
├── main.jsx                  # Entry point, GoogleOAuthProvider
├── App.jsx                   # Layout 2 colonnes + routing état
├── App.module.css
├── store/
│   ├── emailStore.js         # Zustand : emails, digest, état loading
│   └── clientStore.js        # Zustand : clients, persistance localStorage
├── data/
│   ├── mockEmails.js         # Mock data Phase 1
│   └── mockClients.js        # Mock data Phase 1
├── services/
│   ├── gmailService.js       # Appels API Gmail (Phase 2)
│   └── claudeService.js      # Appels API Anthropic (Phase 2)
└── components/
    ├── Header/
    │   ├── Header.jsx
    │   └── Header.module.css
    ├── EmailPanel/
    │   ├── EmailPanel.jsx    # Colonne gauche : digest + liste emails
    │   └── EmailPanel.module.css
    ├── EmailItem/
    │   ├── EmailItem.jsx     # Carte email individuelle
    │   └── EmailItem.module.css
    ├── DigestBlock/
    │   ├── DigestBlock.jsx   # Bloc digest IA global
    │   └── DigestBlock.module.css
    ├── ClientPanel/
    │   ├── ClientPanel.jsx   # Colonne droite : liste + création clients
    │   └── ClientPanel.module.css
    └── ClientCard/
        ├── ClientCard.jsx    # Fiche client expandable
        └── ClientCard.module.css
```

## Modèle de données

### Email
```js
{
  id: string,
  from: { name: string, email: string },
  subject: string,
  snippet: string,           // preview texte
  date: string,              // ISO 8601
  isRead: boolean,
  isUrgent: boolean,         // détecté par Claude
  claudeSummary: string,     // résumé par email (Claude)
  threadId: string,
}
```

### Digest (global)
```js
{
  globalSummary: string,     // 2-3 phrases résumé global
  urgentCount: number,
  generatedAt: string,       // ISO 8601
}
```

### Client
```js
{
  id: string,
  name: string,
  company: string,
  email: string,
  phone: string,
  status: 'actif' | 'prospect' | 'inactif',
  priority: 'low' | 'medium' | 'high',
  notes: string,
  exchanges: [              // historique auto-alimenté depuis emails
    {
      date: string,
      subject: string,
      summary: string,
      emailId: string,
    }
  ],
  createdAt: string,
  updatedAt: string,
}
```

## Contrat API Claude

### Prompt système
```
Tu es un assistant qui analyse des emails professionnels.
Réponds UNIQUEMENT en JSON valide, sans markdown, sans commentaires.
```

### Prompt utilisateur (analyse batch)
```
Analyse ces emails non lus et retourne un JSON avec cette structure exacte :
{
  "globalSummary": "2-3 phrases résumant l'ensemble des emails",
  "urgentCount": <nombre d'emails urgents>,
  "emails": [
    {
      "id": "<id de l'email>",
      "summary": "1-2 phrases de résumé",
      "isUrgent": <true|false>,
      "suggestedClient": {
        "name": "<nom si nouvel expéditeur inconnu, sinon null>",
        "email": "<email expéditeur>",
        "company": "<entreprise si détectable, sinon null>"
      }
    }
  ]
}

Emails à analyser :
<JSON des emails>
```

### Modèle
- `claude-sonnet-4-6` (sonnet, bon équilibre vitesse/qualité pour le digest)

## Phases de développement

### Phase 1 — Scaffold + composants statiques ✅
- Projet Vite + React initialisé
- Design system CSS (variables, typographie)
- Tous les composants créés avec mock data
- Layout 2 colonnes fonctionnel
- Stores Zustand initialisés

### Phase 2 — Intégration Gmail OAuth
- `@react-oauth/google` configuré
- Flux OAuth complet (login/logout)
- `gmailService.js` : fetch emails non lus via API Gmail
- Hydratation du emailStore depuis Gmail

### Phase 3 — Intégration Claude
- `claudeService.js` : appel `claude-sonnet-4-6` avec prompt batch
- Parse du JSON retourné par Claude
- Mise à jour du digest et des résumés par email
- Détection isUrgent

### Phase 4 — CRM vivant
- Liaison emails → clients via email expéditeur
- Auto-suggestion de fiche client pour nouveaux expéditeurs
- Historique exchanges auto-alimenté
- Persistance localStorage via Zustand middleware persist

### Phase 5 — Polish
- États loading/error
- Animations (fade-in cards, skeleton loaders)
- Responsive (breakpoint 768px → colonne unique)
- Raccourcis clavier (R = refresh, N = nouveau client)
