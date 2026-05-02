'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Shield, ShieldOff, ToggleLeft, ToggleRight, Trophy } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type User = {
  id: string
  name: string | null
  username: string | null
  institution: string | null
  specialty: string | null
  points: number
  is_blocked: boolean | null
}

type Form = {
  id: string
  title: string
  user_id: string
  is_active: boolean
  fill_count: number
  created_at: string
}

export default function AdminControls({ users, forms }: { users: User[]; forms: Form[] }) {
  const [localUsers, setLocalUsers] = useState(users)
  const [localForms, setLocalForms] = useState(forms)
  const [search, setSearch]         = useState('')
  const [tab, setTab]               = useState<'users' | 'forms'>('users')
  const router  = useRouter()
  const supabase = createClient()

  async function toggleBlock(userId: string, currentlyBlocked: boolean) {
    await supabase.from('profiles').update({ is_blocked: !currentlyBlocked }).eq('id', userId)
    setLocalUsers(u => u.map(x => x.id === userId ? { ...x, is_blocked: !currentlyBlocked } : x))
  }

  async function toggleForm(formId: string, currentlyActive: boolean) {
    await supabase.from('forms').update({ is_active: !currentlyActive }).eq('id', formId)
    setLocalForms(f => f.map(x => x.id === formId ? { ...x, is_active: !currentlyActive } : x))
  }

  const filteredUsers = localUsers.filter(u =>
    !search ||
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.name?.toLowerCase().includes(search.toLowerCase())
  )

  const filteredForms = localForms.filter(f =>
    !search || f.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search users or surveys…"
        className="w-full border border-ivory-border rounded-lg px-3 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-charcoal"
      />

      <div className="flex gap-2 mb-4">
        {(['users', 'forms'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? 'bg-charcoal text-white' : 'bg-ivory text-slate-600 hover:bg-ivory-dark'
            }`}>
            {t === 'users' ? `Users (${localUsers.length})` : `Surveys (${localForms.length})`}
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <div className="space-y-2">
          {filteredUsers.map(u => (
            <div key={u.id} className={`bg-white border rounded-xl px-5 py-3.5 flex items-center gap-4 ${
              u.is_blocked ? 'border-red-200 bg-red-50/30' : 'border-ivory-border'
            }`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-slate-800 text-sm">
                    {u.name || `(no name)`}
                    {u.username && (
                      <Link href={`/u/${u.username}`} className="text-charcoal ml-1 hover:underline">
                        @{u.username}
                      </Link>
                    )}
                  </p>
                  {u.is_blocked && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Blocked</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                  <Trophy size={10} className="text-emerald-500" /> {u.points} pts
                  {u.specialty && ` · ${u.specialty}`}
                  {u.institution && ` · ${u.institution}`}
                </p>
              </div>
              <button
                onClick={() => toggleBlock(u.id, !!u.is_blocked)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  u.is_blocked
                    ? 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                    : 'text-red-500 border-red-200 hover:bg-red-50'
                }`}
              >
                {u.is_blocked
                  ? <><ShieldOff size={12} /> Unblock</>
                  : <><Shield size={12} /> Block</>
                }
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'forms' && (
        <div className="space-y-2">
          {filteredForms.map(f => (
            <div key={f.id} className={`bg-white border rounded-xl px-5 py-3.5 flex items-center gap-4 ${
              !f.is_active ? 'border-slate-200 bg-slate-50/50 opacity-60' : 'border-ivory-border'
            }`}>
              <div className="flex-1 min-w-0">
                <Link href={`/forms/${f.id}`} className="font-medium text-slate-800 text-sm hover:text-charcoal transition-colors">
                  {f.title}
                </Link>
                <p className="text-xs text-slate-400 mt-0.5">
                  {f.fill_count} responses · {new Date(f.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => toggleForm(f.id, f.is_active)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  f.is_active
                    ? 'text-red-500 border-red-200 hover:bg-red-50'
                    : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                {f.is_active
                  ? <><ToggleLeft size={12} /> Deactivate</>
                  : <><ToggleRight size={12} /> Reactivate</>
                }
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
