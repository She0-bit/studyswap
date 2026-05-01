'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { ROLES, SPECIALTY_GROUPS, type Profile } from '@/lib/types'
import { Save } from 'lucide-react'

const COUNTRIES = [
  'Saudi Arabia','Egypt','UAE','Kuwait','Bahrain','Oman','Qatar','Jordan','Lebanon',
  'Iraq','Syria','Libya','Tunisia','Algeria','Morocco','Sudan','Yemen','Palestine',
  'United States','United Kingdom','Canada','Australia','Germany','France',
  'Turkey','Pakistan','India','Malaysia','Other',
]

export default function UpdateProfileForm({ profile }: { profile: Profile }) {
  const [name, setName]           = useState(profile.name ?? '')
  const [institution, setInst]    = useState(profile.institution ?? '')
  const [specialty, setSpecialty] = useState(profile.specialty ?? '')
  const [role, setRole]           = useState(profile.role ?? '')
  const [age, setAge]             = useState(profile.age?.toString() ?? '')
  const [sex, setSex]             = useState(profile.sex ?? '')
  const [country, setCountry]     = useState(profile.country ?? '')
  const [customCountry, setCustom] = useState('')
  const [saved, setSaved]         = useState(false)
  const [loading, setLoading]     = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const resolvedCountry = country === 'Other' ? customCountry.trim() : country
    await supabase.from('profiles').update({
      name: name.trim(),
      institution: institution.trim(),
      specialty,
      role,
      age: age ? parseInt(age) : null,
      sex,
      country: resolvedCountry,
    }).eq('id', profile.id)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    router.refresh()
    setLoading(false)
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Full name</label>
          <input value={name} onChange={e => setName(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Institution</label>
          <input value={institution} onChange={e => setInst(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Your role / occupation</label>
          <select value={role} onChange={e => setRole(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">Select…</option>
            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Field / Specialty</label>
          <select value={specialty} onChange={e => setSpecialty(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">Select…</option>
            {Object.entries(SPECIALTY_GROUPS).map(([group, items]) => (
              <optgroup key={group} label={group}>
                {items.map(s => <option key={s} value={s}>{s}</option>)}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Age</label>
          <input type="number" min={1} max={120} value={age} onChange={e => setAge(e.target.value)}
            placeholder="e.g. 24"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Sex</label>
          <select value={sex} onChange={e => setSex(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Country</label>
          <select value={country} onChange={e => setCountry(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">Select…</option>
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {country === 'Other' && (
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Specify country</label>
          <input value={customCountry} onChange={e => setCustom(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      )}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60">
          <Save size={14} /> {loading ? 'Saving…' : 'Save profile'}
        </button>
        {saved && <span className="text-sm text-emerald-600">✓ Saved!</span>}
      </div>

      <p className="text-xs text-slate-400">
        This information is used to match you with relevant surveys in the "Suggested for you" section. It's never shown publicly.
      </p>
    </form>
  )
}
