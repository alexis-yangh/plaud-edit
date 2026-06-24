import { NextResponse } from 'next/server'

const USERNAME = 'localization.plaud'
const PASSWORD = 'PlaudLocalization2026'

export async function POST(request: Request) {
  const { username, password } = await request.json()
  if (username === USERNAME && password === PASSWORD) {
    const res = NextResponse.json({ ok: true })
    res.cookies.set('plaud-auth', 'ok', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return res
  }
  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
}
