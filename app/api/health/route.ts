export async function GET() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  const baseUrl = process.env.ANTHROPIC_VERTEX_BASE_URL
  return Response.json({
    apiKey: apiKey ? `set (${apiKey.length} chars, starts: ${apiKey.slice(0, 8)})` : 'MISSING',
    baseUrl: baseUrl ? `set: ${baseUrl}` : 'MISSING',
  })
}
