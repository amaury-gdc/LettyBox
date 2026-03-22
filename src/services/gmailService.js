/**
 * gmailService.js — Phase 2
 *
 * Fetches unread Gmail messages using the Gmail REST API.
 * Requires a valid Google OAuth access token from @react-oauth/google.
 */

const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1'
const MAX_EMAILS = 20

/**
 * Fetches unread emails from Gmail inbox.
 * @param {string} accessToken — Google OAuth access token
 * @returns {Promise<Array>} — array of email objects matching our data model
 */
export async function fetchUnreadEmails(accessToken) {
  const headers = { Authorization: `Bearer ${accessToken}` }

  // 1. List message IDs
  const listRes = await fetch(
    `${GMAIL_API}/users/me/messages?q=is:unread&maxResults=${MAX_EMAILS}`,
    { headers }
  )
  if (!listRes.ok) throw new Error(`Gmail list error: ${listRes.status}`)
  const listData = await listRes.json()
  const messages = listData.messages ?? []

  // 2. Fetch each message in parallel
  const results = await Promise.all(
    messages.map((m) => fetchMessage(m.id, accessToken))
  )

  const emails = results.filter(Boolean)
  const failedCount = results.length - emails.length

  return { emails, failedCount }
}

async function fetchMessage(messageId, accessToken) {
  const headers = { Authorization: `Bearer ${accessToken}` }
  const res = await fetch(
    `${GMAIL_API}/users/me/messages/${messageId}?format=full`,
    { headers }
  )
  if (!res.ok) return null

  const data = await res.json()
  const headers_ = data.payload?.headers ?? []
  const getHeader = (name) =>
    headers_.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? ''

  const fromRaw = getHeader('From')
  const fromParsed = parseFrom(fromRaw)
  const { bodyText, bodyHtml } = extractBody(data.payload)

  return {
    id: data.id,
    threadId: data.threadId,
    from: fromParsed,
    subject: getHeader('Subject') || '(sans objet)',
    snippet: data.snippet ?? '',
    body: bodyText,
    bodyHtml,
    date: new Date(parseInt(data.internalDate)).toISOString(),
    isRead: false,
    isUrgent: false,
    claudeSummary: '',
  }
}

function extractBody(payload) {
  if (!payload) return { bodyText: '', bodyHtml: null }

  // Simple non-multipart message
  if (payload.body?.data) {
    const decoded = decodeBase64(payload.body.data)
    if (payload.mimeType === 'text/html') return { bodyText: '', bodyHtml: decoded }
    return { bodyText: decoded, bodyHtml: null }
  }

  // Multipart: prefer HTML for rendering, keep plain as fallback
  if (payload.parts) {
    const htmlPart = findPart(payload.parts, 'text/html')
    const plainPart = findPart(payload.parts, 'text/plain')
    return {
      bodyText: plainPart ? decodeBase64(plainPart.body.data) : '',
      bodyHtml: htmlPart ? decodeBase64(htmlPart.body.data) : null,
    }
  }

  return { bodyText: '', bodyHtml: null }
}

function findPart(parts, mimeType) {
  for (const part of parts) {
    if (part.mimeType === mimeType && part.body?.data) return part
    if (part.parts) {
      const found = findPart(part.parts, mimeType)
      if (found) return found
    }
  }
  return null
}

function decodeBase64(data) {
  return decodeURIComponent(
    escape(atob(data.replace(/-/g, '+').replace(/_/g, '/')))
  )
}


/**
 * Fetches all emails (read + unread) from a specific sender.
 * Used by the CRM to load a client's full email history on demand.
 */
export async function fetchEmailsFromSender(accessToken, senderEmail, maxResults = 30) {
  const query = encodeURIComponent(`from:${senderEmail}`)
  const listRes = await fetch(
    `${GMAIL_API}/users/me/messages?q=${query}&maxResults=${maxResults}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  if (!listRes.ok) throw new Error(`Gmail list error: ${listRes.status}`)
  const listData = await listRes.json()
  const messages = listData.messages ?? []

  const emails = await Promise.all(
    messages.map((m) => fetchMessageMeta(m.id, accessToken))
  )
  return emails.filter(Boolean)
}

// Lightweight fetch — metadata only, no body (for client history display)
async function fetchMessageMeta(messageId, accessToken) {
  const res = await fetch(
    `${GMAIL_API}/users/me/messages/${messageId}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  if (!res.ok) return null
  const data = await res.json()
  const headers_ = data.payload?.headers ?? []
  const getHeader = (name) =>
    headers_.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? ''

  return {
    id: data.id,
    subject: getHeader('Subject') || '(sans objet)',
    snippet: data.snippet ?? '',
    date: new Date(parseInt(data.internalDate)).toISOString(),
  }
}

function parseFrom(raw) {
  // "Name <email>" or just "email"
  const match = raw.match(/^(.*?)\s*<(.+?)>$/)
  if (match) {
    return { name: match[1].replace(/^["']|["']$/g, '').trim(), email: match[2].trim() }
  }
  return { name: raw.trim(), email: raw.trim() }
}
