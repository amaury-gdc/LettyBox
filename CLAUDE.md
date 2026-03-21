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
- Favorite client emails: `#f0e2d5` background (unread) / `#f5ece4` (read)
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
│   ├── emailStore.js         # Zustand + persist: emails, digest, auth, loading, linking
│   └── clientStore.js        # Zustand: CRUD clients, groups, favorites, filters
├── data/
│   ├── mockEmails.js         # 6 mock emails (2 urgent) + digest (unused in live mode)
│   └── mockClients.js        # 5 mock clients with exchange history
├── services/
│   ├── gmailService.js       # Gmail REST API — format=full, body extraction, sender fetch
│   └── claudeService.js      # Anthropic API claude-sonnet-4-6 (Phase 3)
└── components/
    ├── Header/               # Brand + search bar + stats + auth/refresh buttons
    ├── EmailPanel/           # Inbox tab: digest + email list + error state
    ├── EmailItem/            # Email card: row + expanded + iframe + client picker + ProcessModal
    ├── DigestBlock/          # Global AI digest block (accent red left border)
    ├── ClientPanel/          # Clients tab: search + status/priority filters + group chips + list
    └── ClientCard/           # Expandable client card: name edit, favorite, groups, Gmail history
```

### Layout

The app uses a **tab layout** (not two columns):
- A tab bar below the header switches between "Boîte de réception" and "Clients"
- Only one panel is rendered at a time
- No collapsed/isOpen logic — tabs handle visibility

### EmailItem layout

Single-line Google-style row:
```
● | sender + group dots (180px fixed) | subject (220px fixed) | snippet (flex) | time
```
- Indicator dot: red = urgent, accent red = unread, gray = read
- Sender column: client name (if linked) + small colored dots per group — or raw sender name
- All subjects align on the same column
- Expandable on click — shows AI summary + iframe body + client link area + "✓ Mail traité"

### EmailItem expanded view

When expanded:
1. **AI summary block** (if `claudeSummary` is set) — red left border block
2. **Email body** — rendered in a sandboxed `<iframe srcDoc>` if `bodyHtml` present; falls back to plain text
3. **Client link area** — see Client Linking section below
4. **"✓ Mail traité" button** — opens ProcessModal

### Client Linking (EmailItem)

Each email can be linked to a client in two ways:
- **Auto** — matched by `email.from.email === client.email`
- **Manual** — `linkedClientId` field set explicitly by the user

Manual link takes priority over auto. Stored in emailStore (persisted).

**UI states:**
- No client linked → `[+ Créer fiche client] [Lier à un client ▾]`
- Client linked → `[● ClientName] [Changer] [× (only if manual)]`
- `Lier / Changer` opens an inline `ClientPicker` dropdown with search

**Store actions:** `linkEmailToClient(emailId, clientId)`, `unlinkEmail(emailId)`

### ProcessModal (inside EmailItem)

A fixed overlay modal that appears when the user clicks "✓ Mail traité":
- 3 checkboxes the user must all tick:
  1. Client information saved
  2. Reply sent
  3. Payments verified
- "OK — Marquer comme traité" button — only enabled when all 3 are checked
- On confirm: calls `removeEmail(id)` — email disappears from inbox permanently

### ClientCard layout

No avatar. Header row:
```
[★ favBtn] [name ✎] [group badges inline] | [status badge] [×]
```
- **Favorite star** (★/☆) — leftmost element in the nameRow, tight to the name, `1.3rem`, golden when active
- **Name** — click the ✎ pencil icon to edit inline (Enter saves, Escape cancels)
- **Group badges** — colored pills inline after the name on the same row
- **No avatar** — removed in favor of a cleaner layout

### ClientCard expanded body

Sections (in order):
1. Contact info (email + phone links)
2. Meta chips (priority, exchange count, created date)
3. **Groups section** — current group tags (click × to remove) + "add to group" dropdown
4. **Notes section** — view / inline edit
5. **Exchange history** — CRM exchanges (from analyzed emails)
6. **Gmail emails section** — "Charger les emails" button → fetches all emails from sender via `fetchEmailsFromSender`, displayed as a lightweight list (date + subject + snippet)

## Data Models

### Email
```js
{
  id: string,
  from: { name: string, email: string },
  subject: string,
  snippet: string,           // short text preview (from Gmail API)
  body: string,              // plain text body (decoded from base64)
  bodyHtml: string | null,   // raw HTML body — rendered in sandboxed iframe
  date: string,              // ISO 8601
  isRead: boolean,
  isUrgent: boolean,         // detected by Claude
  claudeSummary: string,     // per-email summary (Claude)
  threadId: string,
  linkedClientId: string | null,  // manual client link — takes priority over auto-match
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
  isFavorite: boolean,       // favorite clients → darker email card background
  groups: string[],          // array of group IDs
  notes: string,
  exchanges: [
    { date: string, subject: string, summary: string, emailId: string }
  ],
  createdAt: string,
  updatedAt: string,
}
```

### Group
```js
{
  id: string,
  name: string,
  color: { bg: string, text: string },  // from predefined ARIRANG-toned palette
}
```

**Group color palette (7 colors, cycling):**
indigo, forest, terracotta, purple, rose, teal, amber — all warm-toned to match design system.

## Client Store — Features

Stored at `lettybox_clients` in localStorage as `{ clients, groups }`.
Handles old format (plain array) with graceful migration.

**Client actions:** `createClient`, `updateClient`, `deleteClient`, `toggleFavorite`, `addExchange`

**Group actions:** `createGroup(name)` — auto-assigns next color from palette, `deleteGroup(id)` — also removes from all clients, `toggleClientGroup(clientId, groupId)`

**Filters:** `filterStatus`, `filterPriority`, `filterGroup` (`'all'` | `'favorites'` | groupId), `searchQuery`

**`filterGroup = 'favorites'`** — shows only clients with `isFavorite: true`

## Gmail Service — Implementation Details

`gmailService.js` uses the Gmail REST API.

**`fetchUnreadEmails(accessToken)`** — `format=full`, fetches up to 20 unread messages.

**`fetchEmailsFromSender(accessToken, senderEmail, maxResults=30)`** — lightweight metadata-only fetch (`format=metadata`) for all emails from a given sender. Used by ClientCard on demand, not persisted.

**Key points:**
- `metadataHeaders` must be repeated per header — `?metadataHeaders=From&metadataHeaders=Subject` not comma-separated
- Body extraction (`extractBody`) handles simple and multipart MIME: prefers `text/plain`, falls back to `text/html` (kept raw for iframe)
- Base64url decoding: replace `-`→`+` and `_`→`/` before `atob()`

## Email Persistence & Refresh Logic

Emails persisted via Zustand `persist` (key: `lettybox-emails`). Only `emails` and `digest` persisted — `accessToken` is session-only.

**On login / refresh:** merge-only — new emails prepended, existing kept (by ID dedup)
**On logout:** auth cleared, emails kept
**`removeEmail(id)`:** permanent removal after ProcessModal confirmation
**`linkEmailToClient` / `unlinkEmail`:** persisted in the same store

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
- **ARIRANG-inspired design system applied** ✅

### Phase 2 — Gmail OAuth + CRM foundations ✅
- Full OAuth flow (login/logout) via `@react-oauth/google`
- Gmail REST API: `format=full` fetch, MIME body extraction, base64url decode
- Email HTML rendered in sandboxed `<iframe srcDoc>`
- Persistence: Zustand `persist`, merge-on-refresh, no data loss
- "✓ Mail traité" → ProcessModal (3-step checklist) → `removeEmail`
- **Client features:** favorites (★), groups (colored badges inline with name), inline name rename (✎), load all Gmail emails from a sender on demand
- **Email–client linking:** manual `linkedClientId` overrides auto email-match; `ClientPicker` inline dropdown with search
- Group colored dots shown in email sender column

### Phase 3 — Claude integration
- `claudeService.js`: call `claude-sonnet-4-6` with batch prompt
- Parse JSON, update digest + per-email summaries, detect isUrgent

### Phase 4 — Living CRM
- Auto-populate exchanges history from analyzed emails
- Auto-suggest client profile for new unknown senders

### Phase 5 — Polish
- Loading/error states with skeleton loaders
- Animations (fade-in cards)
- Responsive (breakpoint 768px → single column)
- Keyboard shortcuts (R = refresh, N = new client)

## Conventions

- **CSS Modules** everywhere — never global CSS except `global.css`
- **Component = folder** — `ComponentName/ComponentName.jsx` + `ComponentName.module.css`
- **Zustand** without boilerplate — actions and selectors in the same store
- **No TypeScript** — pure JSX, fast, readable
- **No backend** — fully client-side, localStorage for persistence
- **Explicit imports** — no barrel files, direct component import
- **No inline styles** except dynamic values (e.g. computed colors passed as `style` prop)
- **Email HTML rendering** — always use sandboxed `<iframe srcDoc>`, never `dangerouslySetInnerHTML`
- **Modal pattern** — fixed overlay with `backdrop-filter: blur`, rendered via `<>` fragment sibling to the triggering card
- **Inline dropdowns** (pickers, group menus) — `position: absolute` within a `position: relative` wrapper, `z-index: 20`
- **No avatar** — ClientCard uses name + pencil icon layout, no avatar circle
