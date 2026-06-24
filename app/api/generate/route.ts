export const runtime = 'edge'

import { PROMPTS } from '@/lib/prompts'

const MODEL = 'claude-sonnet-4-5@20250514'
const REGION = 'us-east5'
const PROJECT = 'dummy'

function proxyUrl(stream: boolean) {
  const action = stream ? 'streamRawPredict' : 'rawPredict'
  return `${process.env.ANTHROPIC_VERTEX_BASE_URL}/projects/${PROJECT}/locations/${REGION}/publishers/anthropic/models/${MODEL}:${action}`
}

export async function POST(request: Request) {
  const { promptKey, brief, toneVariant } = await request.json()

  const prompt = PROMPTS[promptKey]
  if (!prompt) return new Response('Unknown prompt key', { status: 400 })
  if (!brief?.trim()) return new Response('Brief is required', { status: 400 })

  const toneGuide: Record<string, string> = {
    Consumer: 'conversational, warm, benefit-first, relatable',
    Neutral: 'balanced, clear, neither casual nor formal',
    Lifestyle: 'aspirational, visual, identity-led, emotionally resonant',
    Technical: 'spec-led, precise, feature-forward, quantified',
    Professional: 'structured, authoritative, strategic, confident',
  }
  const toneInstruction = toneVariant ? `TONE VARIANT: ${toneVariant} — ${toneGuide[toneVariant] ?? ''}\nAdapt your register to match this tone throughout all copy.\n\n---\n\n` : ''
  const userMessage = `BRIEF\n\n${brief.trim()}\n\n---\n\n${toneInstruction}TASK\n\n${prompt.taskInstruction}\n\n---\n\nQA CHECK\n\n${prompt.qaInstruction}`

  let upstream: Response
  try {
    upstream = await fetch(proxyUrl(true), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ANTHROPIC_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        anthropic_version: 'vertex-2023-10-16',
        max_tokens: 4096,
        system: prompt.systemContext,
        messages: [{ role: 'user', content: userMessage }],
        stream: true,
      }),
    })
  } catch (err: any) {
    console.error('Generate fetch error:', String(err), 'URL:', proxyUrl(true))
    return new Response('Generation failed', { status: 500 })
  }

  if (!upstream.ok) {
    const err = await upstream.text()
    console.error('Generate upstream error:', upstream.status, err)
    return new Response('Generation failed', { status: 500 })
  }

  // Forward the SSE stream, extracting text deltas
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6).trim()
            if (data === '[DONE]') continue
            try {
              const evt = JSON.parse(data)
              if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
                controller.enqueue(encoder.encode(evt.delta.text))
              }
            } catch {}
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
