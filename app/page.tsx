import { createClient } from '@/lib/supabase-server'
import FormCard from '@/components/FormCard'
import Link from 'next/link'
import { Search, Trophy, Users, Zap } from 'lucide-react'
import type { FormFeedItem } from '@/lib/types'

export const revalidate = 0

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; specialty?: string }>
}) {
  const { q, specialty } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase.from('forms_feed').select('*').limit(50)
  if (specialty) query = query.eq('specialty', specialty)
  if (q) query = query.ilike('title', `%${q}%`)

  const { data: forms } = await query

  let myFillIds = new Set<string>()
  if (user) {
    const { data: fills } = await supabase
      .from('fills')
      .select('form_id')
      .eq('user_id', user.id)
    fills?.forEach(f => myFillIds.add(f.form_id))
  }

  const feed = (forms ?? []) as FormFeedItem[]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {!q && !specialty && (
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Fill forms. Rank higher. Get responses.
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto text-sm">
            A karma-based exchange for med students — the more surveys you fill, the higher your own form appears in the feed.
          </p>
          {!user && (
            <div className="mt-5 flex items-center justify-center gap-3">
              <Link href="/auth" className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                Get started free
              </Link>
              <Link href="#feed" className="text-sm text-slate-500 hover:text-slate-700">
                Browse forms ↓
              </Link>
            </div>
          )}
        </div>
      )}

      {!q && !specialty && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: <Users size={18} className="text-indigo-500" />, label: 'Active forms', value: feed.length },
            { icon: <Trophy size={18} className="text-amber-500" />, label: 'Points in circulation', value: feed.reduce((a, f) => a + f.submitter_points, 0) },
            { icon: <Zap size={18} className="text-emerald-500" />, label: 'Total responses', value: feed.reduce((a, f) => a + f.fill_count, 0) },
          ].map(stat => (
            <div key={stat.label} className="bg-white border border-slate-200 rounded-xl p-4 text-center">
              <div className="flex justify-center mb-1">{stat.icon}</div>
              <div className="text-xl font-bold text-slate-800">{stat.value}</div>
              <div className="text-xs text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      <div id="feed" className="mb-6 flex flex-col sm:flex-row gap-3">
        <form method="GET" className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by title…"
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {specialty && <input type="hidden" name="specialty" value={specialty} />}
        </form>
        <form method="GET">
          <select
            name="specialty"
            defaultValue={specialty ?? ''}
            className="w-full sm:w-auto border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All specialties</option>
            {['General Medicine','Surgery','Pediatrics','Obstetrics & Gynecology','Psychiatry','Internal Medicine','Emergency Medicine','Family Medicine','Radiology','Pathology','Pharmacology','Anatomy','Physiology','Biochemistry','Microbiology','Public Health','Other'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {q && <input type="hidden" name="q" value={q} />}
        </form>
      </div>

      {feed.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-lg mb-2">No forms yet</p>
          <p className="text-sm">
            {user
              ? <Link href="/submit" className="text-indigo-600 hover:underline">Be the first to submit a form →</Link>
              : <Link href="/auth" className="text-indigo-600 hover:underline">Sign in to submit your form →</Link>
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {feed.map((form, i) => (
            <FormCard key={form.id} form={form} rank={i + 1} filledByMe={myFillIds.has(form.id)} />
          ))}
        </div>
      )}
    </div>
  )
}
