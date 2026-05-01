'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { SPECIALTIES } from '@/lib/types'
import { Link2, Clock, BookOpen, ChevronRight } from 'lucide-react'

export default function SubmitPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [link, setLink] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [institution, setInstitution] = useState('')
  const [estimatedMinutes, setEstimatedMinutes] = useState(5)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Validate URL
    try { new URL(link) } catch {
      setError('Please enter a valid URL (include https://)')
      return
    }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }

    const { error: insertError } = await supabase.from('forms').insert({
      user_id: user.id,
      title: title.trim(),
      description: description.trim(),
      link: link.trim(),
      specialty,
      institution: institution.trim(),
      estimated_minutes: estimatedMinutes,
    })

    if (insertError) { setError(insertError.message); setLoading(false); return }

    router.push('/?submitted=1')
    router.refresh()
  }

  const pointsEarned = 10 + estimatedMinutes * 2

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Submit your form</h1>
        <p className="text-slate-500 text-sm mt-1">
          Your form will appear in the feed. The more you fill others' forms, the higher it ranks.
        </p>
      </div>

      {/* Info card */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-8 text-sm text-indigo-700">
        <p className="font-medium mb-1">How ranking works</p>
        <p>Every form you fill earns you <strong>{pointsEarned} pts</strong> (for a {estimatedMinutes}-min form). Your total points determine how high your form appears in the list. Start filling to climb up!</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
        {error && (
          <div className="mb-5 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Study title *</label>
            <input
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={120}
              placeholder="e.g. Prevalence of burnout among medical interns"
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description *</label>
            <textarea
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              maxLength={400}
              placeholder="Brief description of your study — what it's about, who it's for, any inclusion criteria"
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
            <p className="text-xs text-slate-400 mt-1">{description.length}/400</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Link2 size={14} /> Form link *
            </label>
            <input
              required
              type="url"
              value={link}
              onChange={e => setLink(e.target.value)}
              placeholder="https://forms.gle/..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-slate-400 mt-1">Google Forms, SurveyMonkey, REDCap — any link works</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Clock size={14} /> Estimated time (min) *
              </label>
              <input
                type="number"
                required
                min={1}
                max={60}
                value={estimatedMinutes}
                onChange={e => setEstimatedMinutes(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-emerald-600 mt-1">Fillers earn {pointsEarned} pts for this</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                <BookOpen size={14} /> Specialty
              </label>
              <select
                value={specialty}
                onChange={e => setSpecialty(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">Select…</option>
                {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Institution <span className="text-slate-400 font-normal">(optional)</span></label>
            <input
              value={institution}
              onChange={e => setInstitution(e.target.value)}
              placeholder="e.g. King Abdulaziz University"
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
          >
            {loading ? 'Submitting…' : <><span>Submit form</span> <ChevronRight size={16} /></>}
          </button>
        </form>
      </div>
    </div>
  )
}
