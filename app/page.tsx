import { createClient } from '@/lib/supabase-server'
import FormCard from '@/components/FormCard'
import Link from 'next/link'
import { Search, Trophy, Users, Zap, Sparkles } from 'lucide-react'
import { matchesCriteria, SPECIALTY_GROUPS, type FormFeedItem, type Profile } from '@/lib/types'

export const revalidate = 0

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; specialty?: string }>
}) {
  const { q, specialty } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Fetch profile for "For You" matching
  let profile: Profile | null = null
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    profile = data
  }

  // Build feed query
  let query = supabase
    .from('forms_feed')
    .select('*')
    .order('submitter_points', { ascending: false })
    .limit(100)

  if (specialty) query = query.eq('specialty', specialty)
  if (q) query = query.ilike('title', `%${q}%`)

  const { data: forms } = await query
  const feed = (forms ?? []) as FormFeedItem[]

  // Fills by current user
  let myFillIds = new Set<string>()
  if (user) {
    const { data: fills } = await supabase
      .from('fills').select('form_id').eq('user_id', user.id)
    fills?.forEach(f => myFillIds.add(f.form_id))
  }

  // "For You" — forms matching user's profile that they haven't filled and don't own
  const forYou = profile && !q && !specialty
    ? feed.filter(f =>
        !myFillIds.has(f.id) &&
        f.user_id !== user?.id &&
        matchesCriteria(f.sample_criteria, profile!)
      ).slice(0, 5)
    : []

  const hasProfileForMatching = profile && (profile.role || profile.age || profile.sex || profile.country)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Hero */}
      {!q && !specialty && (
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Fill surveys. Rank higher. Get responses.
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto text-sm">
            A platform where researchers exchange survey participation — fill others' surveys to move yours up the list.
          </p>
          {!user && (
            <div className="mt-5 flex items-center justify-center gap-3">
              <Link href="/auth" className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                Get started free
              </Link>
              <Link href="#feed" className="text-sm text-slate-500 hover:text-slate-700">Browse surveys ↓</Link>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      {!q && !specialty && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: <Users size={18} className="text-indigo-500" />, label: 'Active surveys', value: feed.length },
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

      {/* For You section */}
      {user && !q && !specialty && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-indigo-500" />
            <h2 className="font-semibold text-slate-800">Suggested for you</h2>
            <span className="text-xs text-slate-400 ml-1">surveys matching your profile</span>
          </div>

          {!hasProfileForMatching ? (
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-5 py-4 text-sm text-indigo-700 flex items-center justify-between">
              <span>Complete your profile to see surveys tailored to you</span>
              <Link href="/profile" className="font-medium underline underline-offset-2 shrink-0 ml-4">
                Update profile →
              </Link>
            </div>
          ) : forYou.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm text-slate-500">
              No matching surveys right now — check back later or browse all surveys below.
            </div>
          ) : (
            <div className="space-y-3">
              {forYou.map((form, i) => (
                <FormCard key={form.id} form={form} rank={feed.indexOf(form) + 1} filledByMe={false} highlighted />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search + specialty filter */}
      <div id="feed" className="mb-6 flex flex-col sm:flex-row gap-3">
        <form method="GET" className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input name="q" defaultValue={q} placeholder="Search by title…"
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          {specialty && <input type="hidden" name="specialty" value={specialty} />}
        </form>
        <form method="GET">
          <select name="specialty" defaultValue={specialty ?? ''}
            className="w-full sm:w-56 border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All specialties</option>
            {Object.entries(SPECIALTY_GROUPS).map(([group, items]) => (
              <optgroup key={group} label={group}>
                {items.map(s => <option key={s} value={s}>{s}</option>)}
              </optgroup>
            ))}
          </select>
          {q && <input type="hidden" name="q" value={q} />}
        </form>
        {(q || specialty) && (
          <Link href="/" className="self-center text-sm text-slate-400 hover:text-slate-600 whitespace-nowrap">
            Clear filters
          </Link>
        )}
      </div>

      {/* Main feed */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-slate-700 text-sm">
          {q || specialty ? 'Search results' : 'All surveys'} · sorted by points
        </h2>
        {!user && (
          <Link href="/auth" className="text-xs text-indigo-600 hover:underline">Sign in to fill & earn points</Link>
        )}
      </div>

      {feed.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-lg mb-2">No surveys found</p>
          <p className="text-sm">
            {user
              ? <Link href="/submit" className="text-indigo-600 hover:underline">Submit the first one →</Link>
              : <Link href="/auth" className="text-indigo-600 hover:underline">Sign in to submit yours →</Link>
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
