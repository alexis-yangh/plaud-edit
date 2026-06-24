'use client'
import { useState } from 'react'
import { PROMPTS } from '@/lib/prompts'
import NavBar from '@/app/components/NavBar'

interface Issue {
  excerpt: string
  problem: string
  severity: 'fail' | 'flag'
  fix: string
}

interface AuditResult {
  score: number
  verdict: string
  tone_match: string
  pillar: string
  issues: Issue[]
  rewrite: string
}

const CONTENT_TYPES = [
  { value: '', label: 'Any / General' },
  { value: 'Ad', label: 'Ad Suite' },
  { value: 'Landing hero', label: 'Landing Hero' },
  { value: 'EDM', label: 'EDM' },
  { value: 'Full landing page', label: 'Full Landing Page' },
  { value: 'PR boilerplate', label: 'PR Boilerplate' },
  { value: 'Product description', label: 'Product Description' },
]

const TONE_VARIANTS = ['Consumer', 'Neutral', 'Lifestyle', 'Technical', 'Professional'] as const
type ToneVariant = typeof TONE_VARIANTS[number] | ''

function ScoreRing({ score }: { score: number }) {
  const isGood   = score >= 90
  const isOk     = score >= 70
  const isWeak   = score >= 50

  const bg    = isGood ? 'bg-plaud-green/10' : isOk ? 'bg-plaud-warm-dark/8' : 'bg-plaud-black'
  const text  = isGood ? 'text-plaud-black'  : isOk ? 'text-plaud-black'      : 'text-plaud-white'
  const sub   = isGood ? 'text-plaud-warm-dark' : isOk ? 'text-plaud-warm-dark' : 'text-white/60'
  const label =
    score >= 90 ? 'Ready to ship' :
    score >= 70 ? 'Minor fixes needed' :
    score >= 50 ? 'Revision needed' :
    'Does not match Plaud voice'

  return (
    <div className={`flex flex-col items-center justify-center rounded-plaud p-8 ${bg}`}>
      <span className={`text-7xl font-semibold tabular-nums tracking-tight ${text}`}>{score}</span>
      <span className={`text-xs font-semibold mt-2 uppercase tracking-[0.12em] ${sub}`}>{label}</span>
    </div>
  )
}

export default function AuditPage() {
  const [draft, setDraft] = useState('')
  const [contentType, setContentType] = useState('')
  const [toneVariant, setToneVariant] = useState<ToneVariant>('')
  const [result, setResult] = useState<AuditResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copiedRewrite, setCopiedRewrite] = useState(false)

  async function handleAudit() {
    if (!draft.trim() || loading) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft, contentType, toneVariant }),
      })
      if (!res.ok) throw new Error('Audit failed')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
    } catch {
      setError('Audit failed. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  async function copyRewrite() {
    if (!result) return
    await navigator.clipboard.writeText(result.rewrite)
    setCopiedRewrite(true)
    setTimeout(() => setCopiedRewrite(false), 2000)
  }

  return (
    <div className="min-h-screen bg-plaud-warm-light">
      <NavBar active="audit" />
      <div className="max-w-2xl mx-auto px-5 py-8">

        <p className="text-sm text-plaud-warm-dark mb-7 leading-relaxed">
          Score any draft against Plaud&apos;s brand voice. Catch off-voice copy before it ships.
        </p>

        {/* Draft input */}
        <div className="mb-5">
          <p className="text-[10px] font-semibold text-plaud-warm-dark uppercase tracking-[0.15em] mb-3">
            Draft to audit
          </p>
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            rows={8}
            placeholder="Paste any copy — a headline, a post, an ad, an email, anything."
            className="w-full px-4 py-3.5 bg-plaud-white border border-transparent rounded-plaud text-sm leading-relaxed focus:outline-none focus:border-plaud-black resize-none transition-colors text-plaud-black placeholder-plaud-warm-dark/60"
          />
        </div>

        {/* Content type */}
        <div className="mb-5">
          <p className="text-[10px] font-semibold text-plaud-warm-dark uppercase tracking-[0.15em] mb-3">
            Content type
            <span className="ml-2 normal-case tracking-normal font-normal text-plaud-warm-dark/60">(optional)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {CONTENT_TYPES.map(ct => (
              <button
                key={ct.value}
                onClick={() => setContentType(ct.value)}
                className={`px-3.5 py-1.5 rounded-plaud text-sm font-medium transition-colors ${
                  contentType === ct.value
                    ? 'bg-plaud-black text-white'
                    : 'bg-plaud-white text-plaud-black hover:bg-black/5'
                }`}
              >
                {ct.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tone variant */}
        <div className="mb-6">
          <p className="text-[10px] font-semibold text-plaud-warm-dark uppercase tracking-[0.15em] mb-3">
            Tone variant
            <span className="ml-2 normal-case tracking-normal font-normal text-plaud-warm-dark/60">(optional)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {TONE_VARIANTS.map(tone => (
              <button
                key={tone}
                onClick={() => setToneVariant(toneVariant === tone ? '' : tone)}
                className={`px-3.5 py-1.5 rounded-plaud text-sm font-medium transition-colors ${
                  toneVariant === tone
                    ? 'bg-plaud-black text-white'
                    : 'bg-plaud-white text-plaud-black hover:bg-black/5'
                }`}
              >
                {tone}
              </button>
            ))}
          </div>
        </div>

        {/* Audit — AI action → gradient CTA */}
        <button
          onClick={handleAudit}
          disabled={loading || !draft.trim()}
          className="w-full py-3.5 rounded-plaud text-sm font-semibold transition-opacity disabled:opacity-30 flex items-center justify-center gap-2 text-plaud-black"
          style={{ background: 'linear-gradient(90deg, #21EF6A 0%, #2CA3FF 50%, #8F53ED 100%)' }}
        >
          {loading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-black/30 border-t-plaud-black rounded-full animate-spin" />
              Auditing…
            </>
          ) : (
            'Run audit →'
          )}
        </button>

        {error && (
          <p className="text-[#cc0000] text-xs mt-3 text-center">{error}</p>
        )}

        {/* Result */}
        {result && (
          <div className="mt-7 space-y-3">

            {/* Score */}
            <ScoreRing score={result.score} />

            {/* Verdict */}
            <div className="bg-plaud-white rounded-plaud p-5 space-y-3">
              <p className="text-sm font-semibold text-plaud-black leading-snug">{result.verdict}</p>
              <p className="text-xs text-plaud-warm-dark leading-relaxed">{result.tone_match}</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] text-plaud-warm-dark uppercase tracking-[0.12em] font-semibold">Pillar</span>
                <span className="text-xs font-semibold text-plaud-black bg-plaud-warm-light px-2.5 py-1 rounded-plaud">
                  {result.pillar}
                </span>
              </div>
            </div>

            {/* Issues */}
            {result.issues.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-plaud-warm-dark uppercase tracking-[0.15em] mb-2.5 mt-1">
                  Issues ({result.issues.length})
                </p>
                <div className="space-y-2">
                  {result.issues.map((issue, i) => (
                    <div
                      key={i}
                      className={`rounded-plaud p-4 space-y-2.5 ${
                        issue.severity === 'fail'
                          ? 'bg-plaud-black text-plaud-white'
                          : 'bg-plaud-warm-dark/10 text-plaud-black'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className={`text-[9px] font-bold uppercase tracking-[0.15em] mt-1 shrink-0 px-1.5 py-0.5 rounded-plaud ${
                          issue.severity === 'fail'
                            ? 'bg-white/15 text-white'
                            : 'bg-plaud-warm-dark/20 text-plaud-warm-dark'
                        }`}>
                          {issue.severity}
                        </span>
                        <blockquote className={`text-xs italic leading-relaxed border-l-2 pl-2 ${
                          issue.severity === 'fail' ? 'border-white/30 text-white/80' : 'border-plaud-warm-dark/30 text-plaud-warm-dark'
                        }`}>
                          &ldquo;{issue.excerpt}&rdquo;
                        </blockquote>
                      </div>
                      <p className={`text-xs font-medium ${
                        issue.severity === 'fail' ? 'text-white/90' : 'text-plaud-black'
                      }`}>
                        {issue.problem}
                      </p>
                      <div className="flex items-start gap-1.5">
                        <span className={`text-[10px] font-bold uppercase tracking-[0.1em] shrink-0 mt-0.5 ${
                          issue.severity === 'fail' ? 'text-plaud-green' : 'text-plaud-warm-dark'
                        }`}>
                          Fix
                        </span>
                        <p className={`text-xs leading-relaxed ${
                          issue.severity === 'fail' ? 'text-plaud-green' : 'text-plaud-warm-dark'
                        }`}>
                          {issue.fix}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rewrite */}
            {result.rewrite && (
              <div>
                <div className="flex items-center justify-between mb-2.5 mt-1">
                  <p className="text-[10px] font-semibold text-plaud-warm-dark uppercase tracking-[0.15em]">
                    Suggested rewrite
                  </p>
                  <button
                    onClick={copyRewrite}
                    className="text-[11px] text-plaud-warm-dark hover:text-plaud-black transition-colors font-semibold"
                  >
                    {copiedRewrite ? 'Copied ✓' : 'Copy'}
                  </button>
                </div>
                <div className="bg-plaud-white rounded-plaud p-5">
                  <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed text-plaud-black">{result.rewrite}</pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
