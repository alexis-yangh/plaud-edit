'use client'
import { useState } from 'react'
import { PROMPTS } from '@/lib/prompts'
import NavBar from '@/app/components/NavBar'

type GroupItem = { type: 'single'; key: string; label: string }
type GroupParent = { type: 'group'; id: string; label: string; children: { key: string; label: string }[] }
type Group = GroupItem | GroupParent

const GROUPS: Group[] = [
  { type: 'single', key: 'ad-consumer', label: 'Ad Suite' },
  {
    type: 'group',
    id: 'landing-page',
    label: 'Landing Page',
    children: [
      { key: 'landing-hero-pro', label: 'Hero' },
      { key: 'landing-page-pro', label: 'Full Page' },
    ],
  },
  { type: 'single', key: 'edm-pro', label: 'EDM' },
  { type: 'single', key: 'pr-boilerplate-pro', label: 'PR' },
  { type: 'single', key: 'product-description-pro', label: 'Product' },
]

const LANDING_KEYS = new Set(['landing-hero-pro', 'landing-page-pro'])

export default function GeneratePage() {
  const firstKey = 'ad-consumer'
  const [selectedKey, setSelectedKey] = useState(firstKey)
  const [brief, setBrief] = useState(PROMPTS[firstKey].briefTemplate)
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  function selectKey(key: string) {
    setSelectedKey(key)
    setBrief(PROMPTS[key].briefTemplate)
    setOutput('')
    setError('')
  }

  function handleGroupClick() {
    if (!LANDING_KEYS.has(selectedKey)) selectKey('landing-hero-pro')
  }

  const isLandingActive = LANDING_KEYS.has(selectedKey)

  async function handleGenerate() {
    if (!brief.trim() || loading) return
    setLoading(true)
    setError('')
    setOutput('')

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptKey: selectedKey, brief }),
      })
      if (!res.ok) throw new Error('Generation failed')

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        setOutput(prev => prev + decoder.decode(value, { stream: true }))
      }
    } catch {
      setError('Generation failed. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  async function copyOutput() {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-plaud-warm-light">
      <NavBar active="generate" />

      <div className="max-w-2xl mx-auto px-5 py-8">

        {/* Content type pills */}
        <div className="mb-6">
          <p className="text-[10px] font-semibold text-plaud-warm-dark uppercase tracking-[0.15em] mb-3">
            Content type
          </p>
          <div className="flex flex-wrap gap-2">
            {GROUPS.map(group => {
              if (group.type === 'single') {
                const active = selectedKey === group.key
                return (
                  <button
                    key={group.key}
                    onClick={() => selectKey(group.key)}
                    className={`px-3.5 py-1.5 rounded-plaud text-sm font-medium transition-colors ${
                      active
                        ? 'bg-plaud-black text-white'
                        : 'bg-plaud-white text-plaud-black hover:bg-black/5'
                    }`}
                  >
                    {group.label}
                  </button>
                )
              }

              return (
                <div key={group.id} className="flex flex-col gap-1.5">
                  <button
                    onClick={handleGroupClick}
                    className={`px-3.5 py-1.5 rounded-plaud text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isLandingActive
                        ? 'bg-plaud-black text-white'
                        : 'bg-plaud-white text-plaud-black hover:bg-black/5'
                    }`}
                  >
                    {group.label}
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  {isLandingActive && (
                    <div className="flex gap-1.5 pl-1">
                      {group.children.map(child => (
                        <button
                          key={child.key}
                          onClick={() => selectKey(child.key)}
                          className={`px-3 py-1 rounded-plaud text-xs font-medium transition-colors ${
                            selectedKey === child.key
                              ? 'bg-plaud-black text-white'
                              : 'bg-plaud-white text-plaud-black hover:bg-black/5'
                          }`}
                        >
                          {child.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Selected description */}
          <p className="text-xs text-plaud-warm-dark mt-3 leading-relaxed">
            {PROMPTS[selectedKey].description}
          </p>
        </div>

        {/* Brief */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-semibold text-plaud-warm-dark uppercase tracking-[0.15em]">Brief</p>
            <button
              onClick={() => setBrief(PROMPTS[selectedKey].briefTemplate)}
              className="text-[11px] text-plaud-warm-dark hover:text-plaud-black transition-colors font-medium"
            >
              Reset template
            </button>
          </div>
          <textarea
            value={brief}
            onChange={e => setBrief(e.target.value)}
            rows={13}
            className="w-full px-4 py-3.5 bg-plaud-white border border-transparent rounded-plaud text-sm font-mono leading-relaxed focus:outline-none focus:border-plaud-black resize-none transition-colors text-plaud-black placeholder-plaud-warm-dark"
            spellCheck={false}
          />
          <p className="text-[11px] text-plaud-warm-dark mt-2">
            Fill in each field. Leave optional fields blank or remove them.
          </p>
        </div>

        {/* Generate */}
        <button
          onClick={handleGenerate}
          disabled={loading || !brief.trim()}
          className="w-full py-3.5 rounded-plaud text-sm font-semibold transition-opacity disabled:opacity-30 flex items-center justify-center gap-2 text-plaud-black"
          style={{ background: 'linear-gradient(90deg, #21EF6A 0%, #2CA3FF 50%, #8F53ED 100%)' }}
        >
          {loading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-black/30 border-t-plaud-black rounded-full animate-spin" />
              Generating…
            </>
          ) : (
            'Generate copy →'
          )}
        </button>

        {error && (
          <p className="text-[#cc0000] text-xs mt-3 text-center">{error}</p>
        )}

        {/* Output */}
        {(output || loading) && (
          <div className="mt-7">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold text-plaud-warm-dark uppercase tracking-[0.15em]">Output</p>
              {output && (
                <button
                  onClick={copyOutput}
                  className="text-[11px] text-plaud-warm-dark hover:text-plaud-black transition-colors font-semibold"
                >
                  {copied ? 'Copied ✓' : 'Copy all'}
                </button>
              )}
            </div>
            <div className="bg-plaud-white border border-transparent rounded-plaud p-5 min-h-[120px]">
              {output ? (
                <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed text-plaud-black">{output}</pre>
              ) : (
                <div className="flex items-center gap-2.5 text-plaud-warm-dark text-sm">
                  <span className="inline-block w-4 h-4 border-2 border-plaud-warm-dark/30 border-t-plaud-warm-dark rounded-full animate-spin" />
                  Writing…
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
