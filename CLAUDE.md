# LettyBox — CLAUDE.md

## Who I am

I am the best developer in the world. Not out of arrogance — out of standards. Every line of code I write is intentional, clean, and purposeful. I don't compromise on quality. I ship code that works on the first try, architecture that breathes, and a pixel-perfect design system. When I scaffold a project, it's ready to run. When I refactor, nothing breaks. When I debug, I find the root cause, not the symptom. My code is my signature.

---

## Project Overview

LettyBox is a React + Vite web app that does two things:
1. **AI email digest from Gmail** — Gmail OAuth connection, fetches unread emails, Claude analyzes them and returns a global digest (2-3 sentences), a per-email summary, and urgency detection
2. **Lightweight CRM** — client profiles with history auto-populated from analyzed emails, manual creation or automatic suggestion by Claude when it detects an unknown new sender

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 18 + Vite 5 |
| State | Zustand (persist middleware for localStorage) |
| Styling | CSS Modules — no CSS framework, fully custom |
| OAuth | `@react-oauth/google` |
| AI | Anthropic API — `claude-sonnet-4-6` |
| Backend | None for now — fully client-side + localStorage |
| Fonts | Google Fonts (Playfair Display, Roboto) |

## Design System

### Visual Identity — Inspired by BTS ARIRANG (2026)

The design system is inspired by the visual direction of BTS's album **ARIRANG** (March 20, 2026):
- **Concept**: "Lyrical Armor" — traditional Korean heritage reinterpreted through structured, mature, monochromatic aesthetics
- **Mood**: Introspective, refined, warm monochrome with a deep red accent
- **Typography**: Playfair Display (serif, classic, structured) for display titles; Roboto for UI

Everything goes through CSS custom properties defined in `global.css`.

### Color Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#f4f1ec` | Main background — warm ivory (photobook paper) |
| `--surface` | `#ffffff` | Cards, panels |
| `--surface-2` | `#ece8e2` | List backgrounds, hover states |
| `--surface-3` | `#e2ddd6` | Inputs, secondary zones |
| `--border` | `#d5d0c9` | Borders — warm grays |
| `--border-hover` | `#b8b2ab` | Hover borders |
| `--accent` | `#9b2335` | "Group Red" — primary actions, highlights |
| `--accent-dim` | `rgba(155,35,53,0.09)` | Accent backgrounds |
| `--accent-hover` | `#7f1c2b` | Accent hover |
| `--text` | `#1c1a17` | Primary text — warm near-black |
| `--text-muted` | `#5a5652` | Secondary text |
| `--text-faint` | `#9a9691` | Placeholder, meta |
| `--urgent` | `#c0392b` | Urgency badges |
| `--font-display` | `'Playfair Display', serif` | Titles, digest summaries |
| `--font-ui` | `'Roboto', sans-serif` | Interface |
| `--font-mono` | `'Roboto Mono', monospace` | Code, badges, meta |

### Header

The header uses a **dedicated dark palette** — "Lyrical Armor" black:
- Background: `#0d0b0a` (warm near-black)
- Text: `#f0ece6` (warm white-ivory)
- Accent elements: `#9b2335` (Group Red)
- Inputs/borders: `#1e1a18` / `#2e2a27`
- Title: Playfair Display italic

### Card Styles

- Cards are **white on warm gray background** — clear visual separation
- Unread emails: `#fdf8f5` background + `#e8d5cc` border
- Selected/expanded: `#fdf8f5` background
- AI summary blocks: `#fdf0f0` with left border `var(--accent)`
- Box-shadow: `0 1px 2px rgba(28,26,23,0.08)` — subtle warm shadow

## Component Architecture

```
src/
├── main.jsx                  # Entry point, GoogleOAuthProvider
├── App.jsx                   # Tab layout (Inbox / Clients)
├── App.module.css
├── global.css                # Reset + CSS variables + scrollbar + utils
├── store/
│   ├── emailStore.js         # Zustand: emails, digest, auth, loading
│   └── clientStore.js        # Zustand: CRUD clients, filters, localStorage
├── data/
│   ├── mockEmails.js         # 6 mock emails (2 urgent) + digest
│   └── mockClients.js        # 5 mock clients with exchange history
├── services/
│   ├── gmailService.js       # Gmail REST API calls (Phase 2)
│   └── claudeService.js      # Anthropic API claude-sonnet-4-6 (Phase 3)
└── components/
    ├── Header/               # Brand + search bar + stats + auth/refresh buttons
    ├── EmailPanel/           # Inbox tab: digest + email list
    ├── EmailItem/            # Single-line email card (indicator · sender · subject · snippet · time)
    ├── DigestBlock/          # Global AI digest block (accent red left border)
    ├── ClientPanel/          # Clients tab: search + filters + list + create form
    └── ClientCard/           # Expandable client profile (contacts, notes, history)
```

### Layout

The app uses a **tab layout** (not two columns):
- A tab bar below the header switches between "Boîte de réception" and "Clients"
- Only one panel is rendered at a time
- No collapsed/isOpen logic — tabs handle visibility

### EmailItem layout

Single-line Google-style row:
```
● | sender (180px fixed) | subject (220px fixed) | snippet (flex) | time
```
- Indicator dot: red = urgent, accent red = unread, gray = read
- Sender: client name if linked, email address otherwise (both fixed width)
- All subjects align on the same column
- Expandable on click — shows AI summary + actions

## Data Models

### Email
```js
{
  id: string,
  from: { name: string, email: string },
  subject: string,
  snippet: string,           // text preview
  date: string,              // ISO 8601
  isRead: boolean,
  isUrgent: boolean,         // detected by Claude
  claudeSummary: string,     // per-email summary (Claude)
  threadId: string,
}
```

### Digest (global)
```js
{
  globalSummary: string,     // 2-3 sentence global summary
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
  exchanges: [              // auto-populated from analyzed emails
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

## Claude API Contract

### System prompt
```
Tu es un assistant qui analyse des emails professionnels.
Réponds UNIQUEMENT en JSON valide, sans markdown, sans commentaires.
```

### User prompt (batch analysis)
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

### Model
- `claude-sonnet-4-6` (best speed/quality balance for digest)

## Development Phases

### Phase 1 — Scaffold + static components ✅
- Vite + React project initialized
- Full CSS design system (variables, typography, scrollbar, reset)
- All components built with realistic mock data
- Tab layout functional + responsive at 768px
- Zustand stores initialized with full CRUD
- Service stubs ready for Phase 2/3
- **ARIRANG-inspired design system applied** ✅

### Phase 2 — Gmail OAuth integration
- `@react-oauth/google` configured
- Full OAuth flow (login/logout) — `useGoogleLogin` hooked to Header button
- `gmailService.js`: fetch unread emails via Gmail REST API
- Hydrate emailStore from Gmail

### Phase 3 — Claude integration
- `claudeService.js`: call `claude-sonnet-4-6` with batch prompt
- Parse JSON returned by Claude
- Update digest and per-email summaries
- Detect isUrgent

### Phase 4 — Living CRM
- Link emails → clients via sender email
- Auto-suggest client profile for new senders
- Auto-populate exchanges history
- localStorage persistence via Zustand persist middleware

### Phase 5 — Polish
- Loading/error states with skeleton loaders
- Animations (fade-in cards)
- Responsive (breakpoint 768px → single column)
- Keyboard shortcuts (R = refresh, N = new client)

## Conventions

- **CSS Modules** everywhere — never global CSS except `global.css`
- **Component = folder** — `ComponentName/ComponentName.jsx` + `ComponentName.module.css`
- **Zustand** without boilerplate — actions and selectors in the same store
- **No TypeScript** for now — pure JSX, fast, readable
- **No backend** — fully client-side, localStorage for persistence
- **Explicit imports** — no barrel files, direct component import
- **No inline styles** except dynamic values (e.g. computed colors passed as `style` prop)
