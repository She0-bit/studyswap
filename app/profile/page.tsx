import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Trophy, Clock, Plus, ToggleLeft, CheckCircle2 } from 'lucide-react'
import DeactivateButton from './DeactivateButton'

export const revalidate = 0

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const [{ data: profile }, { data: myForms }, { data: myFills }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('forms').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase
      .from('fills')
      .select('form_id, filled_at, forms(title, id)')
      .eq('user_id', user.id)
      .order('filled_at', { ascending: false }),
  ])

  const rankQuery = await supabase
    .from('profiles')
    .select('id')
    .gt('points', profile?.points ?? 0)
  const rank = (rankQuery.data?.length ?? 0) + 1

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      {/* Profile header */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-2xl p-7">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold">{profile?.name || user.email}</h1>
            {profile?.institution && <p className="text-indigo-200 text-sm mt-0.5">{profile.institution}</p>}
            {profile?.specialty && <p className="text-indigo-300 text-xs mt-0.5">{profile.specialty}</p>}
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{profile?.points ?? 0}</div>
            <div className="text-indigo-200 text-xs">points</div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { label: 'Feed rank', value: `#${rank}` },
            { label: 'Forms submitted', value: myForms?.length ?? 0 },
            { label: 'Forms filled', value: myFills?.length ?? 0 },
          ].map(s => (
            <div key={s.label} className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-lg font-bold">{s.value}</div>
              <div className="text-indigo-200 text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* My forms */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <ToggleLeft size={18} className="text-indigo-500" /> My forms
          </h2>
          <Link
            href="/submit"
            className="flex items-center gap-1.5 text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={13} /> New form
          </Link>
        </div>

        {!myForms?.length ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-sm">
            You haven't submitted any forms yet.{' '}
            <Link href="/submit" className="text-indigo-600 hover:underline">Submit one now →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {myForms.map(f => (
              <div key={f.id} className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${f.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      {f.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {f.specialty && <span className="text-xs text-indigo-500">{f.specialty}</span>}
                  </div>
                  <p className="font-medium text-slate-800 truncate text-sm">{f.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Clock size={11} /> {f.estimated_minutes} min</span>
                    <span className="flex items-center gap-1"><CheckCircle2 size={11} /> {f.fill_count} filled</span>
                    <span className="flex items-center gap-1"><Trophy size={11} className="text-emerald-400" /> {f.fill_count * (10 + f.estimated_minutes * 2)} pts earned</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/forms/${f.id}`}
                    className="text-xs text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    View
                  </Link>
                  <DeactivateButton formId={f.id} isActive={f.is_active} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Forms I filled */}
      <section>
        <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
          <CheckCircle2 size={18} className="text-emerald-500" /> Forms I filled
        </h2>

        {!myFills?.length ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-sm">
            You haven't filled any forms yet.{' '}
            <Link href="/" className="text-indigo-600 hover:underline">Browse the feed →</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {myFills.map((fill: any) => (
              <div key={fill.form_id} className="bg-white border border-slate-200 rounded-xl px-5 py-3.5 flex items-center justify-between">
                <div>
                  <Link href={`/forms/${fill.form_id}`} className="text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors">
                    {fill.forms?.title ?? 'Untitled form'}
                  </Link>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(fill.filled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  +pts earned
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
