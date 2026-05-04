import { createClient } from '@/lib/supabase-server'
import FormCard from '@/components/FormCard'
import FeedFilters from '@/components/FeedFilters'
import LandingView from './LandingView'
import Link from 'next/link'
import { Users, Sparkles, Rss } from 'lucide-react'
import { matchesCriteria, type FormFeedItem, type Profile } from '@/lib/types'

export const revalidate = 0

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; specialty?: string; tab?: string; max_min?: string }>
}) {
  const { q, specialty, tab, max_min } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // ── Fetch the main feed (needed for both landing preview + logged-in feed) ──
  let query = supabase
    .from('forms_feed').select('*')
    .order('submitter_points', { ascending: false })
    .limit(100)
  if (specialty) query = query.eq('specialty', specialty)
  if (q)        query = query.ilike('title', `%${q}%`)
  if (max_min)  query = query.lte('estimated_minutes', parseInt(max_min))
  const { data: forms } = await query
  const feed = (forms ?? []) as FormFeedItem[]

  const FEATURED_USERNAME = 'sheikah'
  const sortedFeed = [
    ...feed.filter(f => f.submitter_username?.toLowerCase() === FEATURED_USERNAME),
    ...feed.filter(f => f.submitter_username?.toLowerCase() !== FEATURED_USERNAME),
  ]

  // ── Landing page for non-logged-in users ─────────────────────
  if (!user) {
    const { count: userCount } = await supabase
      .from('profiles').select('*', { count: 'exact', head: true }).not('username', 'is', null)
    // Sum fill_count from the feed — avoids RLS blocking a direct fills table count
    const totalFills = sortedFeed.reduce((a, f) => a + (f.fill_count ?? 0), 0)
    return (
      <LandingView
        previewForms={sortedFeed.slice(0, 6)}
        stats={{
          users:   userCount   ?? 0,
          surveys: sortedFeed.length,
          fills:   totalFills,
        }}
      />
    )
  }

  // ── Logged-in: full feed experience ──────────────────────────
  let profile: Profile | null = null
  const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  profile = profileData

  // Following feed
  let followingFeed: FormFeedItem[] = []
  let followingIds: string[] = []
  if (tab === 'following') {
    const { data: followRows } = await supabase.from('follows').select('following_id').eq('follower_id', user.id)
    followingIds = followRows?.map(r => r.following_id) ?? []
    if (followingIds.length > 0) {
      const { data } = await supabase
        .from('forms_feed').select('*')
        .in('user_id', followingIds)
        .order('submitter_points', { ascending: false })
      followingFeed = (data ?? []) as FormFeedItem[]
    }
  }

  // Already-filled set
  const myFillIds = new Set<string>()
  const { data: fills } = await supabase.from('fills').select('form_id').eq('user_id', user.id)
  fills?.forEach(f => myFillIds.add(f.form_id))

  const visibleFeed = sortedFeed.filter(f => !myFillIds.has(f.id) && f.user_id !== user.id)
  const visibleFollowingFeed = followingFeed.filter(f => !myFillIds.has(f.id) && f.user_id !== user.id)

  const hasProfileForMatching = profile && (profile.role || profile.age || profile.sex || profile.country)
  const forYou = profile && !q && !specialty && tab !== 'following'
    ? visibleFeed.filter(f => matchesCriteria(f.sample_criteria, profile!)).slice(0, 5)
    : []

  const activeTab = tab === 'following' ? 'following' : 'all'

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

      {/* For You */}
      {!q && !specialty && activeTab === 'all' && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={15} className="text-charcoal" />
            <h2 className="font-semibold text-slate-700 text-sm">Suggested for you</h2>
          </div>
          {!hasProfileForMatching ? (
            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl px-5 py-4 text-sm text-slate-600 flex items-center justify-between">
              <span>Complete your profile to see tailored surveys</span>
              <Link href="/profile" className="font-semibold text-charcoal hover:underline shrink-0 ml-4">Update →</Link>
            </div>
          ) : forYou.length === 0 ? (
            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl px-5 py-4 text-sm text-slate-400">
              No matching surveys right now — check back later.
            </div>
          ) : (
            <div className="space-y-2.5">
              {forYou.map((form, i) => (
                <FormCard key={form.id} form={form} rank={sortedFeed.indexOf(form) + 1} highlighted index={i} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Feed header */}
      {!q && !specialty && (
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-semibold text-slate-700">Live surveys</span>
          {visibleFeed.length > 0 && (
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{visibleFeed.length}</span>
          )}
        </div>
      )}

      {/* Filters + Tabs */}
      <FeedFilters />

      <div className="flex gap-1 mb-5 bg-ivory-dark p-1 rounded-xl w-full sm:w-fit">
        <Link href="/" className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[40px] ${
          activeTab === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
        }`}>
          <Users size={14} /> All surveys
        </Link>
        <Link href="/?tab=following" className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[40px] ${
          activeTab === 'following' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
        }`}>
          <Rss size={14} /> Following
        </Link>
      </div>

      {/* Feed */}
      {activeTab === 'following' ? (
        followingIds.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Rss size={32} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium mb-1">You're not following anyone yet</p>
            <p className="text-sm">Click a researcher's name and follow them to see their work here.</p>
          </div>
        ) : visibleFollowingFeed.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            No new surveys from the people you follow.
          </div>
        ) : (
          <div className="space-y-3">
            {visibleFollowingFeed.map((form, i) => (
              <FormCard key={form.id} form={form} rank={i + 1} index={i} />
            ))}
          </div>
        )
      ) : visibleFeed.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-lg font-semibold mb-2 text-slate-600">No surveys found</p>
          <p className="text-sm">
            <Link href="/submit" className="text-charcoal font-medium hover:underline">Submit the first one →</Link>
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {visibleFeed.map((form, i) => (
            <FormCard key={form.id} form={form} rank={i + 1} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
