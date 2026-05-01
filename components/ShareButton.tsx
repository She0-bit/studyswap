'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Share2, Copy, Check } from 'lucide-react'

export default function ShareButton({ formId }: { formId: string }) {
  const [userId, setUserId]     = useState<string | null>(null)
  const [copied, setCopied]     = useState(false)
  const [expanded, setExpanded] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
  }, [])

  function getShareUrl() {
    const base = window.location.origin
    return userId
      ? `${base}/forms/${formId}?ref=${userId}`
      : `${base}/forms/${formId}`
  }

  async function copy() {
    await navigator.clipboard.writeText(getShareUrl())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(e => !e)}
        className="flex items-center gap-2 text-sm text-slate-500 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors w-full justify-center"
      >
        <Share2 size={15} />
        Share this survey
      </button>

      {expanded && (
        <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <div>
            <p className="text-sm font-medium text-slate-700 mb-0.5">Your referral link</p>
            <p className="text-xs text-slate-500">
              {userId
                ? 'When someone opens this link and fills the survey on StudySwap, you automatically earn 5 pts — even though it\'s less than filling yourself, it\'s a great way to reach people who match the criteria.'
                : 'Sign in to get a personal referral link that earns you points when shared recipients fill the survey.'}
            </p>
          </div>

          {userId && (
            <>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={getShareUrl()}
                  className="flex-1 text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-600 focus:outline-none"
                />
                <button
                  onClick={copy}
                  className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-colors shrink-0 ${
                    copied
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
                </button>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1 text-center">
                  <p className="font-semibold text-emerald-600">+5 pts</p>
                  <p className="text-slate-400">per person who fills via your link</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1 text-center">
                  <p className="font-semibold text-indigo-600">Unlimited</p>
                  <p className="text-slate-400">share with as many as you want</p>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
