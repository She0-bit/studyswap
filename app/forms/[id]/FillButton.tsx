'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { ExternalLink, CheckCircle, Loader2, AlertCircle } from 'lucide-react'

type Props = {
  formId:           string
  formLink:         string
  estimatedMinutes: number
  pointsReward:     number
  isLoggedIn:       boolean
  isOwner:          boolean
  alreadyFilled:    boolean
  referrerId:       string | null
}

type Phase = 'idle' | 'open' | 'claiming' | 'done' | 'toosoon'

// Minimum time (seconds) before we accept a completion
const MIN_SECONDS = 60

export default function FillButton({
  formId, formLink, estimatedMinutes, pointsReward,
  isLoggedIn, isOwner, alreadyFilled, referrerId,
}: Props) {
  const [phase, setPhase]   = useState<Phase>(alreadyFilled ? 'done' : 'idle')
  const [error, setError]   = useState('')
  const startTimeRef        = useRef<number | null>(null)
  const STORAGE_KEY         = `fill_start_${formId}`
  const router              = useRouter()
  const supabase            = createClient()

  // On mount: restore startTime from localStorage if user already opened the survey
  useEffect(() => {
    if (alreadyFilled) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        startTimeRef.current = parseInt(raw, 10)
        setPhase('open')
      }
    } catch { /* ignore */ }
  }, [])

  function openForm() {
    const now = Date.now()
    startTimeRef.current = now
    try { localStorage.setItem(STORAGE_KEY, String(now)) } catch { /* ignore */ }
    window.open(formLink, '_blank', 'noopener,noreferrer')
    setPhase('open')
  }

  async function handleFinished() {
    const elapsed = startTimeRef.current
      ? Math.floor((Date.now() - startTimeRef.current) / 1000)
      : 0

    if (elapsed < MIN_SECONDS) {
      setPhase('toosoon')
      return
    }

    setPhase('claiming')
    setError('')
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }

    const { error: rpcError } = await supabase.rpc('fill_form', {
      form_id_input:     formId,
      referrer_id_input: referrerId ?? null,
    })
    if (rpcError) { setError(rpcError.message); setPhase('open'); return }
    setPhase('done')
    router.refresh()
  }

  // ── Not logged in ────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <a href="/auth"
        className="block w-full text-center bg-charcoal text-white py-3 rounded-xl font-medium text-sm hover:bg-charcoal-deep transition-colors">
        Sign in to fill this survey & earn {pointsReward} pts
      </a>
    )
  }

  // ── Owner ────────────────────────────────────────────────────
  if (isOwner) {
    return (
      <div className="bg-ivory border border-ivory-border rounded-xl p-4 text-center text-sm text-slate-500">
        This is your survey — share it to get more responses!
      </div>
    )
  }

  // ── Already done ─────────────────────────────────────────────
  if (phase === 'done') {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
        <CheckCircle className="text-emerald-500 mx-auto mb-2" size={28} />
        <p className="font-semibold text-emerald-700">You filled this survey!</p>
        <p className="text-sm text-emerald-600 mt-0.5">+{pointsReward} points added to your account</p>
      </div>
    )
  }

  // ── Idle ─────────────────────────────────────────────────────
  if (phase === 'idle') {
    return (
      <button onClick={openForm}
        className="w-full flex items-center justify-center gap-2 bg-charcoal text-white py-3 rounded-xl font-medium text-sm hover:bg-charcoal-deep transition-colors">
        <ExternalLink size={16} />
        Open & fill this survey (earn +{pointsReward} pts)
      </button>
    )
  }

  // ── Too soon ─────────────────────────────────────────────────
  if (phase === 'toosoon') {
    return (
      <div className="space-y-3">
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
          <AlertCircle className="text-red-400 mx-auto mb-2" size={26} />
          <p className="font-semibold text-red-700">That was too fast</p>
          <p className="text-sm text-red-600 mt-1">
            You need at least 1 minute to fill this survey.<br />
            Please go back and actually complete it.
          </p>
        </div>
        <button onClick={() => { window.open(formLink, '_blank', 'noopener,noreferrer'); setPhase('open') }}
          className="w-full flex items-center justify-center gap-2 bg-charcoal text-white py-3 rounded-xl font-medium text-sm hover:bg-charcoal-deep transition-colors">
          <ExternalLink size={16} /> Open survey again
        </button>
      </div>
    )
  }

  // ── Survey is open / claiming ────────────────────────────────
  return (
    <div className="space-y-3">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-center">
        <p className="text-sm font-medium text-amber-800">Survey opened in a new tab</p>
        <p className="text-xs text-amber-600 mt-1">
          Complete it, then come back here and click the button below.
        </p>
      </div>

      {phase === 'open' && (
        <button onClick={handleFinished}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-medium text-sm hover:bg-emerald-700 transition-colors">
          <CheckCircle size={16} />
          I've finished filling it — claim +{pointsReward} pts
        </button>
      )}

      {phase === 'claiming' && (
        <button disabled
          className="w-full flex items-center justify-center gap-2 bg-emerald-600/70 text-white py-3 rounded-xl font-medium text-sm cursor-not-allowed">
          <Loader2 size={16} className="animate-spin" /> Awarding points…
        </button>
      )}

      <p className="text-xs text-slate-400 text-center">
        Claiming without filling the survey will result in no points being awarded.
      </p>
    </div>
  )
}
