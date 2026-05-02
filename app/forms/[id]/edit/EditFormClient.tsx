'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { SPECIALTY_GROUPS, ROLE_GROUPS } from '@/lib/types'
import { Link2, Clock, BookOpen, Save, Users, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const COUNTRIES = [
  'Saudi Arabia','Egypt','UAE','Kuwait','Bahrain','Oman','Qatar','Jordan','Lebanon',
  'Iraq','Syria','Libya','Tunisia','Algeria','Morocco','Sudan','Yemen','Palestine',
  'United States','United Kingdom','Canada','Australia','Germany','France',
  'Turkey','Pakistan','India','Malaysia','Other',
]

export default function EditFormClient({ form }: { form: any }) {
  const c = form.sample_criteria ?? {}

  const [title, setTitle]             = useState(form.title ?? '')
  const [description, setDescription] = useState(form.description ?? '')
  const [link, setLink]               = useState(form.link ?? '')
  const [specialty, setSpecialty]     = useState(form.specialty ?? '')
  const [institution, setInstitution] = useState(form.institution ?? '')
  const [estimatedMinutes, setEst]    = useState(form.estimated_minutes ?? 5)
  const [isActive, setIsActive]       = useState(form.is_active !== false)

  // Sample criteria
  const [selectedRoles, setSelectedRoles]       = useState<string[]>(c.roles ?? [])
  const [sex, setSex]                           = useState(c.sex ?? 'any')
  const [minAge, setMinAge]                     = useState(c.min_age?.toString() ?? '')
  const [maxAge, setMaxAge]                     = useState(c.max_age?.toString() ?? '')
  const [selectedCountries, setSelectedCountries] = useState<string[]>(c.countries ?? [])
  const [otherCriteria, setOtherCriteria]       = useState(c.other ?? '')
  const [customCountry, setCustomCountry]       = useState('')

  const [error, setError]     = useState('')
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const router   = useRouter()
  const supabase = createClient()

  // Snapshot of initial values to detect changes
  const initial = useRef({
    title, description, link, specialty, institution,
    estimatedMinutes, isActive,
    roles:     JSON.stringify([...c.roles ?? []].sort()),
    sex:       c.sex ?? 'any',
    minAge:    c.min_age?.toString() ?? '',
    maxAge:    c.max_age?.toString() ?? '',
    countries: JSON.stringify([...c.countries ?? []].sort()),
    other:     c.other ?? '',
  })

  const isDirty =
    title             !== initial.current.title             ||
    description       !== initial.current.description       ||
    link              !== initial.current.link              ||
    specialty         !== initial.current.specialty         ||
    institution       !== initial.current.institution       ||
    estimatedMinutes  !== initial.current.estimatedMinutes  ||
    isActive          !== initial.current.isActive          ||
    JSON.stringify([...selectedRoles].sort())     !== initial.current.roles    ||
    sex               !== initial.current.sex               ||
    minAge            !== initial.current.minAge            ||
    maxAge            !== initial.current.maxAge            ||
    JSON.stringify([...selectedCountries].sort()) !== initial.current.countries ||
    otherCriteria     !== initial.current.other

  function toggleRole(val: string) {
    setSelectedRoles(r => r.includes(val) ? r.filter(x => x !== val) : [...r, val])
  }

  function toggleCountry(val: string) {
    setSelectedCountries(c => c.includes(val) ? c.filter(x => x !== val) : [...c, val])
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try { new URL(link) } catch { setError('Please enter a valid URL (include https://)'); return }
    setSaving(true)

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

    const { error: updateError } = await supabase.from('forms').update({
      title: title.trim(),
      description: description.trim(),
      link: link.trim(),
      specialty,
      institution: institution.trim(),
      estimated_minutes: estimatedMinutes,
      is_active: isActive,
      sample_criteria,
    }).eq('id', form.id)

    if (updateError) { setError(updateError.message); setSaving(false); return }

    // Reset snapshot so button disables again
    initial.current = {
      title, description, link, specialty, institution,
      estimatedMinutes, isActive,
      roles:     JSON.stringify([...selectedRoles].sort()),
      sex,
      minAge, maxAge,
      countries: JSON.stringify([...selectedCountries].sort()),
      other:     otherCriteria.trim(),
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    setSaving(false)
    router.refresh()
  }

  const pointsEarned = 10 + estimatedMinutes * 2

  return (
    <div className="bg-white border border-ivory-border rounded-2xl p-7 shadow-sm">
      <Link href="/profile" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors">
        <ArrowLeft size={14} /> Back to my surveys
      </Link>

      {error && (
        <div className="mb-5 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</div>
      )}

      <form onSubmit={handleSave} className="space-y-6">

        {/* Active / Inactive toggle */}
        <div className={`flex items-center justify-between rounded-xl px-4 py-3 border ${
          isActive ? 'bg-emerald-50 border-emerald-200' : 'bg-ivory-dark border-ivory-border'
        }`}>
          <div>
            <p className="text-sm font-medium text-slate-800">
              {isActive ? '✅ Survey is active' : '⏸️ Survey is inactive'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {isActive ? 'Visible in the feed and accepting responses' : 'Hidden from the feed — no one can fill it'}
            </p>
          </div>
          <button type="button" onClick={() => setIsActive(a => !a)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isActive ? 'bg-emerald-500' : 'bg-slate-300'
            }`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isActive ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Study title *</label>
          <input required value={title} onChange={e => setTitle(e.target.value)} maxLength={120}
            placeholder="e.g. Prevalence of burnout among medical interns"
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal" />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Description *</label>
          <textarea required value={description} onChange={e => setDescription(e.target.value)}
            rows={3} maxLength={400}
            placeholder="Brief description of your study"
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal resize-none" />
          <p className="text-xs text-slate-400 mt-1">{description.length}/400</p>
        </div>

        {/* Link */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Link2 size={14} /> Survey link *
          </label>
          <input required type="url" value={link} onChange={e => setLink(e.target.value)}
            placeholder="https://forms.gle/..."
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal" />
        </div>

        {/* Duration + Specialty */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Clock size={14} /> Estimated time (min) *
            </label>
            <input type="number" required min={1} max={60}
              value={estimatedMinutes} onChange={e => setEst(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal" />
            <p className="text-xs text-emerald-600 mt-1">Fillers earn {pointsEarned} pts</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
              <BookOpen size={14} /> Field / Specialty
            </label>
            <select value={specialty} onChange={e => setSpecialty(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal bg-white">
              <option value="">Select…</option>
              {Object.entries(SPECIALTY_GROUPS).map(([group, items]) => (
                <optgroup key={group} label={group}>
                  {items.map(s => <option key={s} value={s}>{s}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        {/* Institution */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Institution <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input value={institution} onChange={e => setInstitution(e.target.value)}
            placeholder="e.g. King Abdulaziz University"
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal" />
        </div>

        {/* ── Sample criteria ── */}
        <div className="border-t border-ivory-border pt-6">
          <div className="flex items-center gap-2 mb-1">
            <Users size={16} className="text-charcoal" />
            <h3 className="font-medium text-slate-800">Target population</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Define who your survey is for. Leave everything empty to accept anyone.
          </p>

          {/* Roles */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-3">Who should fill this?</label>
            <div className="space-y-3">
              {Object.entries(ROLE_GROUPS).map(([group, roles]) => (
                <div key={group}>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">{group}</p>
                  <div className="flex flex-wrap gap-2">
                    {roles.map(r => (
                      <button key={r.value} type="button" onClick={() => toggleRole(r.value)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                          selectedRoles.includes(r.value)
                            ? 'bg-charcoal text-white border-charcoal'
                            : 'bg-white text-slate-600 border-slate-300 hover:border-charcoal/40'
                        }`}>
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
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
                      ? 'bg-charcoal text-white border-charcoal'
                      : 'bg-white text-slate-600 border-slate-300 hover:border-charcoal/40'
                  }`}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          {/* Age */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Age range</label>
            <div className="flex items-center gap-3">
              <input type="number" min={1} max={120} value={minAge}
                onChange={e => setMinAge(e.target.value)} placeholder="Min"
                className="w-24 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal" />
              <span className="text-slate-400 text-sm">to</span>
              <input type="number" min={1} max={120} value={maxAge}
                onChange={e => setMaxAge(e.target.value)} placeholder="Max"
                className="w-24 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal" />
              <span className="text-xs text-slate-400">Leave empty for any age</span>
            </div>
          </div>

          {/* Countries */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Country / Region</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {COUNTRIES.filter(c => c !== 'Other').map(c => (
                <button key={c} type="button" onClick={() => toggleCountry(c)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    selectedCountries.includes(c)
                      ? 'bg-charcoal text-white border-charcoal'
                      : 'bg-white text-slate-600 border-slate-300 hover:border-charcoal/40'
                  }`}>
                  {c}
                </button>
              ))}
            </div>
            <input value={customCountry} onChange={e => setCustomCountry(e.target.value)}
              placeholder="Other countries (comma-separated)"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal" />
          </div>

          {/* Other */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Other requirements <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input value={otherCriteria} onChange={e => setOtherCriteria(e.target.value)}
              placeholder="e.g. Currently enrolled in clinical rotations, diagnosed with diabetes…"
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={saving || !isDirty}
            className="flex items-center gap-2 bg-charcoal text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-charcoal-deep transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            <Save size={15} />
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          {saved && <span className="text-sm text-emerald-600 font-medium">✓ Saved!</span>}
          <Link href="/profile" className="ml-auto text-sm text-slate-400 hover:text-slate-600 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
