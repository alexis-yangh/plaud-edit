import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAuthenticated = request.cookies.get('plaud-auth')?.value === 'ok'

  if (pathname.startsWith('/api/')) return NextResponse.next()
  if (pathname === '/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/generate', request.url))
  }
  if (pathname !== '/login' && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.ico$).*)'],
}
