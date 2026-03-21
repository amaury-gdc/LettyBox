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
  const emails = await Promise.all(
    messages.map((m) => fetchMessage(m.id, accessToken))
  )

  return emails.filter(Boolean)
}

async function fetchMessage(messageId, accessToken) {
  const headers = { Authorization: `Bearer ${accessToken}` }
  const res = await fetch(
    `${GMAIL_API}/users/me/messages/${messageId}?format=metadata&metadataHeaders=From,Subject,Date`,
    { headers }
  )
  if (!res.ok) return null

  const data = await res.json()
  const headers_ = data.payload?.headers ?? []
  const getHeader = (name) =>
    headers_.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? ''

  const fromRaw = getHeader('From')
  const fromParsed = parseFrom(fromRaw)

  return {
    id: data.id,
    threadId: data.threadId,
    from: fromParsed,
    subject: getHeader('Subject') || '(sans objet)',
    snippet: data.snippet ?? '',
    date: new Date(parseInt(data.internalDate)).toISOString(),
    isRead: false,
    isUrgent: false,
    claudeSummary: '',
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
