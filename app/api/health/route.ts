export async function GET() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  const baseUrl = process.env.ANTHROPIC_VERTEX_BASE_URL

  const url = `${baseUrl}/projects/dummy/locations/us-east5/publishers/anthropic/models/claude-sonnet-4-5@20250514:rawPredict`

  let proxyResult: any = null
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        anthropic_version: 'vertex-2023-10-16',
        max_tokens: 20,
        messages: [{ role: 'user', content: 'Say hi' }],
      }),
    })
    const text = await r.text()
    proxyResult = { status: r.status, body: text.slice(0, 300) }
  } catch (e: any) {
    proxyResult = { error: e?.name + ': ' + e?.message, cause: String(e?.cause) }
  }

  return Response.json({
    apiKey: apiKey ? `set (${apiKey.length} chars, starts: ${apiKey.slice(0, 8)})` : 'MISSING',
    baseUrl: baseUrl ?? 'MISSING',
    url,
    proxyResult,
  })
}
