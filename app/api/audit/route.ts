import AnthropicVertex from '@anthropic-ai/vertex-sdk'
import { AUDIT_SYSTEM_PROMPT } from '@/lib/prompts'

const MODEL = 'claude-sonnet-4-5@20250514'

function makeClient() {
  return new AnthropicVertex({
    projectId: 'dummy',
    region: 'us-east5',
    baseURL: process.env.ANTHROPIC_VERTEX_BASE_URL,
    authClient: {
      projectId: 'dummy',
      getRequestHeaders: async () => ({
        Authorization: `Bearer ${process.env.ANTHROPIC_API_KEY}`,
      }),
    } as any,
  })
}

export async function POST(request: Request) {
  const { draft, contentType } = await request.json()
  if (!draft?.trim()) return Response.json({ error: 'Draft is required' }, { status: 400 })

  const userMessage = contentType
    ? `Content type: ${contentType}\n\nCopy to audit:\n\n${draft.trim()}`
    : `Copy to audit:\n\n${draft.trim()}`

  const client = makeClient()

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: AUDIT_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return Response.json({ error: 'Failed to parse audit result' }, { status: 500 })

    const result = JSON.parse(jsonMatch[0])
    return Response.json(result)
  } catch (err: any) {
    console.error('Audit error:', err?.status, err?.message, err?.error)
    return Response.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}
