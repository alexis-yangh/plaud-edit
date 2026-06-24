import AnthropicVertex from '@anthropic-ai/vertex-sdk'
import { PROMPTS } from '@/lib/prompts'

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
  const { promptKey, brief } = await request.json()

  const prompt = PROMPTS[promptKey]
  if (!prompt) return new Response('Unknown prompt key', { status: 400 })
  if (!brief?.trim()) return new Response('Brief is required', { status: 400 })

  const userMessage = `BRIEF\n\n${brief.trim()}\n\n---\n\nTASK\n\n${prompt.taskInstruction}\n\n---\n\nQA CHECK\n\n${prompt.qaInstruction}`

  const client = makeClient()

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      try {
        const messageStream = client.messages.stream({
          model: MODEL,
          max_tokens: 4096,
          system: prompt.systemContext,
          messages: [{ role: 'user', content: userMessage }],
        })
        for await (const event of messageStream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
