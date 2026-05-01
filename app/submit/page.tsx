'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { SPECIALTY_GROUPS, ROLES } from '@/lib/types'
import { Link2, Clock, BookOpen, ChevronRight, Users } from 'lucide-react'

const COUNTRIES = [
  'Saudi Arabia','Egypt','UAE','Kuwait','Bahrain','Oman','Qatar','Jordan','Lebanon',
  'Iraq','Syria','Libya','Tunisia','Algeria','Morocco','Sudan','Yemen','Palestine',
  'United States','United Kingdom','Canada','Australia','Germany','France',
  'Turkey','Pakistan','India','Malaysia','Other',
]

export default function SubmitPage() {
  const [title, setTitle]               = useState('')
  const [description, setDescription]   = useState('')
  const [link, setLink]                 = useState('')
  const [specialty, setSpecialty]       = useState('')
  const [institution, setInstitution]   = useState('')
  const [estimatedMinutes, setEst]      = useState(5)

  // Sample criteria
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [sex, setSex]                     = useState('any')
  const [minAge, setMinAge]               = useState('')
  const [maxAge, setMaxAge]               = useState('')
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [otherCriteria, setOtherCriteria] = useState('')
  const [customCountry, setCustomCountry] = useState('')

  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  function toggleRole(val: string) {
    setSelectedRoles(r => r.includes(val) ? r.filter(x => x !== val) : [...r, val])
  }

  function toggleCountry(val: string) {
    if (val === 'Other') return // handled separately
    setSelectedCountries(c => c.includes(val) ? c.filter(x => x !== val) : [...c, val])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try { new URL(link) } catch { setError('Please enter a valid URL (include https://)'); return }
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }

    const countries = [...selectedCountries]
    if (customCountry.trim()) countries.push(...customCountry.split(',').map(s => s.trim()).filter(Boolean))

    const sample_criteria = {
      roles:    selectedRoles,
      sex,
      min_age:  minAge ? parseInt(minAge) : null,
      max_age:  maxAge ? parseInt(maxAge) : null,
      countries,
      other:    otherCriteria.trim(),
    }

    const { error: insertError } = await supabase.from('forms').insert({
      user_id: user.id,
      title: title.trim(),
      description: description.trim(),
      link: link.trim(),
      specialty,
      institution: institution.trim(),
      estimated_minutes: estimatedMinutes,
      sample_criteria,
    })

    if (insertError) { setError(insertError.message); setLoading(false); return }
    window.location.href = '/'
  }

  const pointsEarned = 10 + estimatedMinutes * 2

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Submit your survey</h1>
        <p className="text-slate-500 text-sm mt-1">
          Fill in the details below. The more you fill others' surveys, the higher yours ranks.
        </p>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-8 text-sm text-indigo-700">
        <p className="font-medium mb-1">How ranking works</p>
        <p>Every survey you fill earns you points based on its estimated time. Your total points push your own survey higher in the list.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
        {error && (
          <div className="mb-5 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Basic info ── */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Study title *</label>
            <input required value={title} onChange={e => setTitle(e.target.value)} maxLength={120}
              placeholder="e.g. Prevalence of burnout among medical interns"
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description *</label>
            <textarea required value={description} onChange={e => setDescription(e.target.value)}
              rows={3} maxLength={400}
              placeholder="Brief description of your study — what it's about, any key details"
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
            <p className="text-xs text-slate-400 mt-1">{description.length}/400</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Link2 size={14} /> Survey link *
            </label>
            <input required type="url" value={link} onChange={e => setLink(e.target.value)}
              placeholder="https://forms.gle/..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <p className="text-xs text-slate-400 mt-1">Google Forms, SurveyMonkey, REDCap — any link works</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Clock size={14} /> Estimated time (min) *
              </label>
              <input type="number" required min={1} max={60}
                value={estimatedMinutes} onChange={e => setEst(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <p className="text-xs text-emerald-600 mt-1">Fillers earn {pointsEarned} pts</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                <BookOpen size={14} /> Field / Specialty
              </label>
              <select value={specialty} onChange={e => setSpecialty(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                <option value="">Select…</option>
                {Object.entries(SPECIALTY_GROUPS).map(([group, items]) => (
                  <optgroup key={group} label={group}>
                    {items.map(s => <option key={s} value={s}>{s}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Institution <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input value={institution} onChange={e => setInstitution(e.target.value)}
              placeholder="e.g. King Abdulaziz University"
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          {/* ── Sample criteria ── */}
          <div className="border-t border-slate-100 pt-6">
            <div className="flex items-center gap-2 mb-1">
              <Users size={16} className="text-indigo-500" />
              <h3 className="font-medium text-slate-800">Target population</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Define who your survey is for. This helps match your survey to the right people.
            </p>

            {/* Roles */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Who should fill this? <span className="text-slate-400 font-normal">(select all that apply — leave empty for anyone)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {ROLES.map(r => (
                  <button key={r.value} type="button" onClick={() => toggleRole(r.value)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      selectedRoles.includes(r.value)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-400'
                    }`}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sex */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Sex</label>
              <div className="flex gap-2">
                {[['any','Any'], ['male','Male only'], ['female','Female only']].map(([val, lbl]) => (
                  <button key={val} type="button" onClick={() => setSex(val)}
                    className={`text-xs px-4 py-1.5 rounded-full border transition-colors ${
                      sex === val
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-400'
                    }`}>
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            {/* Age range */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Age range</label>
              <div className="flex items-center gap-3">
                <input type="number" min={1} max={120} value={minAge}
                  onChange={e => setMinAge(e.target.value)} placeholder="Min"
                  className="w-24 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <span className="text-slate-400 text-sm">to</span>
                <input type="number" min={1} max={120} value={maxAge}
                  onChange={e => setMaxAge(e.target.value)} placeholder="Max"
                  className="w-24 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <span className="text-xs text-slate-400">Leave empty for any age</span>
              </div>
            </div>

            {/* Country */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Country / Region <span className="text-slate-400 font-normal">(leave empty for any)</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {COUNTRIES.filter(c => c !== 'Other').map(c => (
                  <button key={c} type="button" onClick={() => toggleCountry(c)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      selectedCountries.includes(c)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-400'
                    }`}>
                    {c}
                  </button>
                ))}
              </div>
              <input value={customCountry} onChange={e => setCustomCountry(e.target.value)}
                placeholder="Other countries (comma-separated)"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            {/* Other */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Other requirements <span className="text-slate-400 font-normal">(optional free text)</span>
              </label>
              <input value={otherCriteria} onChange={e => setOtherCriteria(e.target.value)}
                placeholder="e.g. Currently enrolled in clinical rotations, diagnosed with diabetes, etc."
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60">
            {loading ? 'Submitting…' : <><span>Submit survey</span><ChevronRight size={16} /></>}
          </button>
        </form>
      </div>
    </div>
  )
}
