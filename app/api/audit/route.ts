import { AUDIT_SYSTEM_PROMPT } from '@/lib/prompts'

const MODEL = 'claude-sonnet-4-5@20250514'
const REGION = 'us-east5'
const PROJECT = 'dummy'

function proxyUrl() {
  return `${process.env.ANTHROPIC_VERTEX_BASE_URL}/projects/${PROJECT}/locations/${REGION}/publishers/anthropic/models/${MODEL}:rawPredict`
}

export async function POST(request: Request) {
  const { draft, contentType } = await request.json()
  if (!draft?.trim()) return Response.json({ error: 'Draft is required' }, { status: 400 })

  const userMessage = contentType
    ? `Content type: ${contentType}\n\nCopy to audit:\n\n${draft.trim()}`
    : `Copy to audit:\n\n${draft.trim()}`

  try {
    const upstream = await fetch(proxyUrl(), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ANTHROPIC_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        anthropic_version: 'vertex-2023-10-16',
        max_tokens: 2048,
        system: AUDIT_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      }),
    })

    if (!upstream.ok) {
      const err = await upstream.text()
      console.error('Audit upstream error:', upstream.status, err)
      return Response.json({ error: `Upstream error ${upstream.status}` }, { status: 500 })
    }

    const data = await upstream.json()
    const raw = data.content?.[0]?.text ?? ''
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return Response.json({ error: 'Failed to parse audit result' }, { status: 500 })

    const result = JSON.parse(jsonMatch[0])
    return Response.json(result)
  } catch (err: any) {
    console.error('Audit error:', String(err))
    return Response.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
