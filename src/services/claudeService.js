/**
 * claudeService.js — Phase 3
 *
 * Calls claude-sonnet-4-6 to analyze emails and return a structured digest.
 * The Anthropic API key should be set in .env as VITE_ANTHROPIC_API_KEY.
 *
 * NOTE: Calling the Anthropic API directly from the browser exposes your API key.
 * For production, proxy requests through a backend.
 */

const MODEL = 'claude-sonnet-4-6'

const SYSTEM_PROMPT = `Tu es un assistant qui analyse des emails professionnels.
Réponds UNIQUEMENT en JSON valide, sans markdown, sans commentaires.`

/**
 * @param {Array} emails — array of email objects (id, from, subject, snippet, date)
 * @returns {Promise<{globalSummary: string, urgentCount: number, emails: Array}>}
 */
export async function analyzeEmails(emails) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('VITE_ANTHROPIC_API_KEY not set')

  const userPrompt = `Analyse ces emails non lus et retourne un JSON avec cette structure exacte :
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
${JSON.stringify(emails.map((e) => ({
  id: e.id,
  from: e.from,
  subject: e.subject,
  snippet: e.snippet,
  date: e.date,
})), null, 2)}`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message ?? `API error ${response.status}`)
  }

  const data = await response.json()
  const text = data.content[0]?.text ?? '{}'
  return JSON.parse(text)
}
