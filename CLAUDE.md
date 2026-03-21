# LettyBox — CLAUDE.md

## Qui je suis

Je suis le meilleur développeur du monde. Pas par arrogance — par exigence. Chaque ligne de code que j'écris est pensée, propre, et intentionnelle. Je ne fais pas de compromis sur la qualité. Je livre du code qui marche du premier coup, une architecture qui respire, et un design system pixel-perfect. Quand je scaffold un projet, il est prêt à tourner. Quand je refactor, rien ne casse. Quand je debug, je trouve la cause racine, pas le symptôme. Mon code est ma signature.

---

## Vue d'ensemble du projet

LettyBox est mon app web React + Vite qui fait deux choses :
1. **Digest IA des emails Gmail non lus** — connexion OAuth Gmail, récupération des non lus, analyse par Claude qui retourne un digest global (2-3 phrases), un résumé par email, et une détection d'urgence
2. **CRM léger** — fiches clients avec historique auto-alimenté depuis les emails analysés, création manuelle ou suggestion automatique par Claude quand il détecte un nouvel expéditeur inconnu

## Stack technique

| Couche | Choix |
|--------|-------|
| Framework | React 18 + Vite 5 |
| State | Zustand (persist middleware pour localStorage) |
| Styling | CSS Modules — pas de framework CSS, tout custom |
| OAuth | `@react-oauth/google` |
| IA | API Anthropic — `claude-sonnet-4-6` |
| Backend | Aucun pour l'instant — tout client-side + localStorage |
| Fonts | Google Fonts (DM Serif Display, Syne, DM Mono) |

## Design System

Dark theme validé visuellement. Tout passe par des CSS custom properties.

| Token | Valeur | Usage |
|-------|--------|-------|
| `--bg` | `#0e0e11` | Fond principal |
| `--surface` | `#16161a` | Cartes, panneaux |
| `--surface-2` | `#1e1e24` | Inputs, zones secondaires |
| `--border` | `#2a2a35` | Bordures |
| `--accent` | `#c8f064` | Vert citron — actions, highlights |
| `--text` | `#e8e8f0` | Texte principal |
| `--text-muted` | `#8888a0` | Texte secondaire |
| `--urgent` | `#ff6b6b` | Badges urgence |
| `--font-display` | `'DM Serif Display', serif` | Titres |
| `--font-ui` | `'Syne', sans-serif` | Interface |
| `--font-mono` | `'DM Mono', monospace` | Code, badges, meta |

## Architecture des composants

```
src/
├── main.jsx                  # Entry point, GoogleOAuthProvider
├── App.jsx                   # Layout 2 colonnes (grid 1fr 1fr)
├── App.module.css
├── global.css                # Reset + CSS variables + scrollbar + utils
├── store/
│   ├── emailStore.js         # Zustand : emails, digest, auth, loading
│   └── clientStore.js        # Zustand : CRUD clients, filtres, localStorage
├── data/
│   ├── mockEmails.js         # 6 emails mock dont 2 urgents + digest
│   └── mockClients.js        # 5 clients mock avec historique échanges
├── services/
│   ├── gmailService.js       # Appels API Gmail REST (Phase 2)
│   └── claudeService.js      # Appels API Anthropic claude-sonnet-4-6 (Phase 3)
└── components/
    ├── Header/               # Brand + stats + boutons auth/refresh
    ├── EmailPanel/            # Colonne gauche : digest + liste emails
    ├── EmailItem/             # Carte email expandable + résumé IA
    ├── DigestBlock/           # Bloc digest IA global (accent vert)
    ├── ClientPanel/           # Colonne droite : recherche + filtres + liste + form création
    └── ClientCard/            # Fiche client expandable (contacts, notes, historique)
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
- `claude-sonnet-4-6` (bon équilibre vitesse/qualité pour le digest)

## Phases de développement

### Phase 1 — Scaffold + composants statiques ✅
- Projet Vite + React initialisé
- Design system CSS complet (variables, typo, scrollbar, reset)
- Tous les composants créés avec mock data réaliste
- Layout 2 colonnes fonctionnel + responsive 768px
- Stores Zustand initialisés avec CRUD complet
- Services stub prêts pour Phase 2/3

### Phase 2 — Intégration Gmail OAuth
- `@react-oauth/google` configuré
- Flux OAuth complet (login/logout)
- `gmailService.js` : fetch emails non lus via API Gmail REST
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
- États loading/error avec skeleton loaders
- Animations (fade-in cards)
- Responsive (breakpoint 768px → colonne unique)
- Raccourcis clavier (R = refresh, N = nouveau client)

## Conventions

- **CSS Modules** partout — jamais de CSS global sauf `global.css`
- **Composant = dossier** — `ComponentName/ComponentName.jsx` + `ComponentName.module.css`
- **Zustand** sans boilerplate — actions et selectors dans le même store
- **Pas de TypeScript** pour l'instant — JSX pur, rapide, lisible
- **Pas de backend** — tout tourne client-side, localStorage pour la persistance
- **Imports explicites** — pas de barrel files, import direct du composant
