'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { ExternalLink, CheckCircle, Loader2 } from 'lucide-react'

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

type Phase = 'idle' | 'waiting' | 'ready' | 'claiming' | 'done'

export default function FillButton({
  formId, formLink, estimatedMinutes, pointsReward,
  isLoggedIn, isOwner, alreadyFilled, referrerId,
}: Props) {
  const [phase, setPhase]             = useState<Phase>(alreadyFilled ? 'done' : 'idle')
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [error, setError]             = useState('')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const router   = useRouter()
  const supabase = createClient()

  // Wait = estimated minutes in seconds, capped between 30s and 300s
  const waitSeconds = Math.min(Math.max(estimatedMinutes * 60, 30), 300)
  const STORAGE_KEY = `fill_timer_${formId}`

  // On mount: check localStorage for a timer that started in another tab
  useEffect(() => {
    if (alreadyFilled) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const { startTime, wait } = JSON.parse(raw) as { startTime: number; wait: number }
      const elapsed   = Math.floor((Date.now() - startTime) / 1000)
      const remaining = wait - elapsed
      if (remaining > 0) {
        setPhase('waiting')
        setSecondsLeft(remaining)
        startCountdown(remaining)
      } else {
        localStorage.removeItem(STORAGE_KEY)
        setPhase('ready')
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

  function startCountdown(fromSeconds: number) {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(timerRef.current!)
          localStorage.removeItem(STORAGE_KEY)
          setPhase('ready')
          return 0
        }
        return s - 1
      })
    }, 1000)
    setSecondsLeft(fromSeconds)
  }

  function openForm() {
    window.open(formLink, '_blank', 'noopener,noreferrer')
    setPhase('waiting')
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ startTime: Date.now(), wait: waitSeconds }))
    startCountdown(waitSeconds)
  }

  async function claimPoints() {
    setPhase('claiming')
    setError('')
    localStorage.removeItem(STORAGE_KEY)
    const { error: rpcError } = await supabase.rpc('fill_form', {
      form_id_input:     formId,
      referrer_id_input: referrerId ?? null,
    })
    if (rpcError) { setError(rpcError.message); setPhase('ready'); return }
    setPhase('done')
    router.refresh()
  }

  if (!isLoggedIn) {
    return (
      <a href="/auth"
        className="block w-full text-center bg-charcoal text-white py-3 rounded-xl font-medium text-sm hover:bg-charcoal-deep transition-colors">
        Sign in to fill this survey & earn {pointsReward} pts
      </a>
    )
  }

  if (isOwner) {
    return (
      <div className="bg-ivory border border-ivory-border rounded-xl p-4 text-center text-sm text-slate-500">
        This is your survey — share it to get more responses!
      </div>
    )
  }

  if (phase === 'done') {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
        <CheckCircle className="text-emerald-500 mx-auto mb-2" size={28} />
        <p className="font-semibold text-emerald-700">You filled this survey!</p>
        <p className="text-sm text-emerald-600 mt-0.5">+{pointsReward} points added to your account</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</div>
      )}

      {phase === 'idle' && (
        <button onClick={openForm}
          className="w-full flex items-center justify-center gap-2 bg-charcoal text-white py-3 rounded-xl font-medium text-sm hover:bg-charcoal-deep transition-colors">
          <ExternalLink size={16} />
          Open & fill this survey (earn +{pointsReward} pts)
        </button>
      )}

      {phase === 'waiting' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center space-y-3">
          <Loader2 className="text-amber-500 mx-auto animate-spin" size={24} />
          <p className="text-sm font-medium text-amber-700">Fill out the survey, then come back here</p>
          <div className="text-3xl font-bold text-amber-600 tabular-nums">
            {Math.floor(secondsLeft / 60).toString().padStart(2, '0')}:
            {(secondsLeft % 60).toString().padStart(2, '0')}
          </div>
          <p className="text-xs text-amber-500">
            Timer keeps running even if you switch tabs — come back when it's done
          </p>
        </div>
      )}

      {phase === 'ready' && (
        <button onClick={claimPoints}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-medium text-sm hover:bg-emerald-700 transition-colors">
          <CheckCircle size={16} />
          I filled it — claim +{pointsReward} points!
        </button>
      )}

      {phase === 'claiming' && (
        <button disabled className="w-full flex items-center justify-center gap-2 bg-emerald-600/70 text-white py-3 rounded-xl font-medium text-sm">
          <Loader2 size={16} className="animate-spin" /> Awarding points…
        </button>
      )}

      {(phase === 'waiting' || phase === 'ready') && (
        <p className="text-xs text-slate-400 text-center">
          The survey opened in a new tab. Complete it there, then come back and claim your points.
        </p>
      )}
    </div>
  )
}
