'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PlaudLogo from './PlaudLogo'

export default function NavBar({ active }: { active: 'generate' | 'audit' }) {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-10 bg-plaud-warm-light/95 backdrop-blur border-b border-black/[0.06]">
      <div className="max-w-2xl mx-auto px-5 h-14 flex items-center justify-between">
        <PlaudLogo className="h-9" />
        <div className="flex items-center gap-1">
          <Link
            href="/generate"
            className={`px-3 py-1.5 rounded-plaud text-sm font-medium transition-colors ${
              active === 'generate'
                ? 'bg-plaud-black text-white'
                : 'text-plaud-warm-dark hover:text-plaud-black'
            }`}
          >
            Generate
          </Link>
          <Link
            href="/audit"
            className={`px-3 py-1.5 rounded-plaud text-sm font-medium transition-colors ${
              active === 'audit'
                ? 'bg-plaud-black text-white'
                : 'text-plaud-warm-dark hover:text-plaud-black'
            }`}
          >
            Audit
          </Link>
          <button
            onClick={handleLogout}
            className="ml-2 px-3 py-1.5 text-sm font-medium text-plaud-warm-dark hover:text-plaud-black transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}
