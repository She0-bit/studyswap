'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { ExternalLink, CheckCircle, Loader2 } from 'lucide-react'

type Props = {
  formId: string
  formLink: string
  estimatedMinutes: number
  pointsReward: number
  isLoggedIn: boolean
  isOwner: boolean
  alreadyFilled: boolean
}

type Phase = 'idle' | 'opened' | 'waiting' | 'ready' | 'claiming' | 'done'

export default function FillButton({
  formId, formLink, estimatedMinutes, pointsReward,
  isLoggedIn, isOwner, alreadyFilled,
}: Props) {
  const [phase, setPhase] = useState<Phase>(alreadyFilled ? 'done' : 'idle')
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [error, setError] = useState('')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Minimum wait = estimated time in seconds (capped 30s–300s for UX)
  const waitSeconds = Math.min(Math.max(estimatedMinutes * 60, 30), 300)

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  function openForm() {
    window.open(formLink, '_blank', 'noopener,noreferrer')
    setPhase('waiting')
    setSecondsLeft(waitSeconds)
    timerRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(timerRef.current!)
          setPhase('ready')
          return 0
        }
        return s - 1
      })
    }, 1000)
  }

  async function claimPoints() {
    setPhase('claiming')
    setError('')
    const { error: rpcError } = await supabase.rpc('fill_form', { form_id_input: formId })
    if (rpcError) {
      setError(rpcError.message)
      setPhase('ready')
      return
    }
    setPhase('done')
    router.refresh()
  }

  if (!isLoggedIn) {
    return (
      <a
        href="/auth"
        className="block w-full text-center bg-indigo-600 text-white py-3 rounded-xl font-medium text-sm hover:bg-indigo-700 transition-colors"
      >
        Sign in to fill this form & earn {pointsReward} pts
      </a>
    )
  }

  if (isOwner) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center text-sm text-slate-500">
        This is your form — share it to get more responses!
      </div>
    )
  }

  if (phase === 'done') {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
        <CheckCircle className="text-emerald-500 mx-auto mb-2" size={28} />
        <p className="font-semibold text-emerald-700">You filled this form!</p>
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
        <button
          onClick={openForm}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl font-medium text-sm hover:bg-indigo-700 transition-colors"
        >
          <ExternalLink size={16} />
          Open & fill this form (earn +{pointsReward} pts)
        </button>
      )}

      {phase === 'waiting' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center space-y-3">
          <Loader2 className="text-amber-500 mx-auto animate-spin" size={24} />
          <p className="text-sm font-medium text-amber-700">
            Fill out the form, then come back here
          </p>
          <div className="text-3xl font-bold text-amber-600 tabular-nums">
            {Math.floor(secondsLeft / 60).toString().padStart(2, '0')}:
            {(secondsLeft % 60).toString().padStart(2, '0')}
          </div>
          <p className="text-xs text-amber-500">
            Claim your points when the timer reaches 0
          </p>
        </div>
      )}

      {phase === 'ready' && (
        <button
          onClick={claimPoints}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-medium text-sm hover:bg-emerald-700 transition-colors animate-pulse"
        >
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
          The form opened in a new tab. Complete it there, then come back and claim your points.
        </p>
      )}
    </div>
  )
}
