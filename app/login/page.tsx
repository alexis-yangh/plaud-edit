'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PlaudLogo from '@/app/components/PlaudLogo'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (res.ok) {
        router.push('/generate')
        router.refresh()
      } else {
        setError('Incorrect username or password.')
      }
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-plaud-black">
      <div className="w-full max-w-sm">

        {/* Wordmark */}
        <div className="mb-12">
          <PlaudLogo className="h-7" variant="white" />
          <p className="text-white/40 text-sm mt-3 tracking-wide">Plaud Edit by Localization</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-[0.15em] mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-[#111111] border border-[#333333] rounded-plaud text-sm text-white placeholder-white/20 focus:outline-none focus:border-plaud-green transition-colors"
              autoComplete="username"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-[0.15em] mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#111111] border border-[#333333] rounded-plaud text-sm text-white placeholder-white/20 focus:outline-none focus:border-plaud-green transition-colors"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-[#ff4444] text-xs pt-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full mt-2 py-3 bg-plaud-white text-plaud-black rounded-plaud text-sm font-semibold hover:bg-plaud-warm-light disabled:opacity-30 transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign in →'}
          </button>
        </form>

        <p className="text-white/20 text-[11px] mt-10 tracking-wide">
          Amplify human intelligence.
        </p>
      </div>
    </div>
  )
}
