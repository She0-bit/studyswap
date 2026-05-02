import { createClient } from '@/lib/supabase-server'
import FormCard from '@/components/FormCard'
import FeedFilters from '@/components/FeedFilters'
import Link from 'next/link'
import { Users, Sparkles, Rss } from 'lucide-react'
import { matchesCriteria, SPECIALTY_GROUPS, type FormFeedItem, type Profile } from '@/lib/types'

export const revalidate = 0

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; specialty?: string; tab?: string }>
}) {
  const { q, specialty, tab } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  let profile: Profile | null = null
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    profile = data
  }

  // ── Following feed ───────────────────────────────────────────
  let followingFeed: FormFeedItem[] = []
  let followingIds: string[] = []
  if (user && tab === 'following') {
    const { data: followRows } = await supabase
      .from('follows').select('following_id').eq('follower_id', user.id)
    followingIds = followRows?.map(r => r.following_id) ?? []
    if (followingIds.length > 0) {
      const { data } = await supabase
        .from('forms_feed').select('*')
        .in('user_id', followingIds)
        .order('submitter_points', { ascending: false })
      followingFeed = (data ?? []) as FormFeedItem[]
    }
  }

  // ── Main feed ────────────────────────────────────────────────
  let query = supabase
    .from('forms_feed').select('*')
    .order('submitter_points', { ascending: false })
    .limit(100)
  if (specialty) query = query.eq('specialty', specialty)
  if (q) query = query.ilike('title', `%${q}%`)
  const { data: forms } = await query
  const feed = (forms ?? []) as FormFeedItem[]

  // Fills by current user — used to hide already-filled surveys
  let myFillIds = new Set<string>()
  if (user) {
    const { data: fills } = await supabase.from('fills').select('form_id').eq('user_id', user.id)
    fills?.forEach(f => myFillIds.add(f.form_id))
  }

  // ── Pin featured surveys to top ──────────────────────────────
  const FEATURED_USERNAME = 'sheikah'
  const featuredForms = feed.filter(f => f.submitter_username?.toLowerCase() === FEATURED_USERNAME)
  const otherForms    = feed.filter(f => f.submitter_username?.toLowerCase() !== FEATURED_USERNAME)
  const sortedFeed    = [...featuredForms, ...otherForms]

  // Hide surveys the user already filled or owns
  const visibleFeed = user
    ? sortedFeed.filter(f => !myFillIds.has(f.id) && f.user_id !== user.id)
    : sortedFeed

  const visibleFollowingFeed = user
    ? followingFeed.filter(f => !myFillIds.has(f.id) && f.user_id !== user.id)
    : followingFeed

  // ── For You matching ─────────────────────────────────────────
  const hasProfileForMatching = profile && (profile.role || profile.age || profile.sex || profile.country)
  const forYou = profile && !q && !specialty && tab !== 'following'
    ? visibleFeed.filter(f => matchesCriteria(f.sample_criteria, profile!)).slice(0, 5)
    : []

  const activeTab = tab === 'following' && user ? 'following' : 'all'

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Hero */}
      {!q && !specialty && (
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">
            Be someone's n=1
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto text-base">
            Fill surveys. Rank higher. Get responses.
          </p>
          {!user && (
            <div className="mt-5 flex items-center justify-center gap-3">
              <Link href="/auth" className="bg-charcoal text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-charcoal-deep transition-colors">
                Get started free
              </Link>
              <Link href="#feed" className="text-sm text-slate-500 hover:text-slate-700">Browse surveys ↓</Link>
            </div>
          )}
        </div>
      )}

      {/* For You */}
      {user && !q && !specialty && activeTab === 'all' && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-charcoal" />
            <h2 className="font-semibold text-slate-800">Suggested for you</h2>
            <span className="text-xs text-slate-400 ml-1">surveys matching your profile</span>
          </div>
          {!hasProfileForMatching ? (
            <div className="bg-ivory border border-charcoal/10 rounded-xl px-5 py-4 text-sm text-charcoal flex items-center justify-between">
              <span>Complete your profile to see surveys tailored to you</span>
              <Link href="/profile" className="font-medium underline underline-offset-2 shrink-0 ml-4">Update profile →</Link>
            </div>
          ) : forYou.length === 0 ? (
            <div className="bg-ivory border border-ivory-border rounded-xl px-5 py-4 text-sm text-slate-500">
              No matching surveys right now — check back later.
            </div>
          ) : (
            <div className="space-y-3">
              {forYou.map(form => (
                <FormCard key={form.id} form={form} rank={sortedFeed.indexOf(form) + 1} highlighted />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search + filter (client component — handles mobile submit + auto specialty) */}
      <FeedFilters q={q} specialty={specialty} />

      {/* Tabs */}
      {user && (
        <div className="flex gap-1 mb-5 bg-ivory-dark p-1 rounded-xl w-fit">
          <Link href="/" className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}>
            <Users size={14} /> All surveys
          </Link>
          <Link href="/?tab=following" className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'following' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}>
            <Rss size={14} /> Following
          </Link>
        </div>
      )}

      {/* Feed */}
      {activeTab === 'following' ? (
        followingIds.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Rss size={32} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium mb-1">You're not following anyone yet</p>
            <p className="text-sm">Browse surveys, click a researcher's name, and follow them to see their work here.</p>
          </div>
        ) : visibleFollowingFeed.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            No new surveys from the people you follow.
          </div>
        ) : (
          <div className="space-y-3">
            {visibleFollowingFeed.map((form, i) => (
              <FormCard key={form.id} form={form} rank={i + 1} />
            ))}
          </div>
        )
      ) : visibleFeed.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-lg mb-2">No surveys found</p>
          <p className="text-sm">
            {user
              ? <Link href="/submit" className="text-charcoal hover:underline">Submit the first one →</Link>
              : <Link href="/auth" className="text-charcoal hover:underline">Sign in to submit yours →</Link>
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleFeed.map((form, i) => (
            <FormCard key={form.id} form={form} rank={i + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
