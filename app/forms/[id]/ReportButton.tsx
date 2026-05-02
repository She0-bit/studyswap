'use client'

import { useState } from 'react'
import { Flag, X, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'

const REASONS = [
  'Spam or fake survey',
  'Inappropriate content',
  'Broken or invalid link',
  'Duplicate survey',
  'Other',
]

export default function ReportButton({ formId }: { formId: string }) {
  const [open, setOpen]       = useState(false)
  const [reason, setReason]   = useState('')
  const [note, setNote]       = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)
  const supabase = createClient()

  async function submit() {
    if (!reason) return
    setLoading(true)
    await supabase.from('reports').insert({
      form_id: formId,
      reason,
      note: note.trim() || null,
    })
    setLoading(false)
    setDone(true)
    setTimeout(() => { setOpen(false); setDone(false); setReason(''); setNote('') }, 2000)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors mx-auto"
      >
        <Flag size={12} /> Report this survey
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Flag size={15} className="text-red-500" /> Report survey
              </h3>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            {done ? (
              <p className="text-center text-emerald-600 font-medium py-4">✓ Report sent — thank you!</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">Reason</p>
                  <div className="space-y-2">
                    {REASONS.map(r => (
                      <label key={r} className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
                        <input
                          type="radio"
                          name="reason"
                          value={r}
                          checked={reason === r}
                          onChange={() => setReason(r)}
                          className="accent-charcoal"
                        />
                        {r}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Additional note <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    rows={2}
                    maxLength={300}
                    placeholder="Describe the issue…"
                    className="w-full border border-ivory-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal resize-none"
                  />
                </div>

                <button
                  onClick={submit}
                  disabled={!reason || loading}
                  className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  <Send size={14} /> {loading ? 'Sending…' : 'Send report'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
