import { createClient } from '@/lib/supabase-server'
import FormCard from '@/components/FormCard'
import FeedFilters from '@/components/FeedFilters'
import Link from 'next/link'
import { Users, Sparkles, Rss, FileText, Trophy, ArrowRight } from 'lucide-react'
import { matchesCriteria, SPECIALTY_GROUPS, type FormFeedItem, type Profile } from '@/lib/types'

export const revalidate = 0

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; specialty?: string; tab?: string; max_min?: string }>
}) {
  const { q, specialty, tab, max_min } = await searchParams
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
  if (q)        query = query.ilike('title', `%${q}%`)
  if (max_min)  query = query.lte('estimated_minutes', parseInt(max_min))
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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

      {/* Hero */}
      {!q && !specialty && (
        <div className="relative rounded-3xl overflow-hidden mb-8 sm:mb-10 bg-gradient-to-br from-charcoal to-charcoal-deep px-6 py-10 sm:px-10 sm:py-14 text-center">
          {/* Subtle grid overlay */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-white/60 bg-white/10 border border-white/10 px-3 py-1.5 rounded-full mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Research participation exchange
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 leading-tight tracking-tight">
              Be someone's n=1
            </h1>
            <p className="text-white/60 max-w-sm mx-auto text-sm sm:text-base mb-6">
              Fill surveys. Rank higher. Get responses for your research.
            </p>
            {!user ? (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/auth"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-charcoal px-6 py-3 rounded-xl text-sm font-semibold hover:bg-white/90 transition-colors min-h-[44px] shadow-sm">
                  Get started free <ArrowRight size={14} />
                </Link>
                <Link href="#feed"
                  className="text-sm text-white/50 hover:text-white/80 transition-colors min-h-[44px] flex items-center">
                  Browse surveys ↓
                </Link>
              </div>
            ) : (
              <Link href="/submit"
                className="inline-flex items-center justify-center gap-2 bg-white text-charcoal px-6 py-3 rounded-xl text-sm font-semibold hover:bg-white/90 transition-colors min-h-[44px] shadow-sm">
                + Submit your survey
              </Link>
            )}

          {/* How it works — shown to everyone, concise */}
          <div className="mt-8 grid grid-cols-3 gap-3 text-left">
            {[
              { icon: FileText, step: '01', title: 'Fill surveys',   desc: 'Complete studies from other researchers' },
              { icon: Trophy,   step: '02', title: 'Earn points',    desc: 'Points scale with survey length' },
              { icon: Sparkles, step: '03', title: 'Climb the rank', desc: 'Higher rank = more responses for you' },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="bg-white/8 border border-white/10 rounded-2xl p-3 sm:p-4">
                <p className="text-white/30 text-[10px] font-bold mb-2">{step}</p>
                <Icon size={16} className="text-white/70 mb-1.5" />
                <p className="text-white text-xs font-semibold leading-snug">{title}</p>
                <p className="text-white/40 text-[11px] mt-0.5 leading-snug hidden sm:block">{desc}</p>
              </div>
            ))}
          </div>
          </div>
        </div>
      )}

      {/* For You */}
      {user && !q && !specialty && activeTab === 'all' && (
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
              {forYou.map(form => (
                <FormCard key={form.id} form={form} rank={sortedFeed.indexOf(form) + 1} highlighted />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Feed header */}
      {!q && !specialty && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-semibold text-slate-700">Live surveys</span>
            {visibleFeed.length > 0 && (
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {visibleFeed.length}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Search + filter — reads URL directly via useSearchParams, always in sync */}
      <FeedFilters />

      {/* Tabs */}
      {user && (
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
          <p className="text-lg font-semibold mb-2 text-slate-600">No surveys found</p>
          <p className="text-sm">
            {user
              ? <Link href="/submit" className="text-charcoal font-medium hover:underline">Submit the first one →</Link>
              : <Link href="/auth" className="text-charcoal font-medium hover:underline">Sign in to submit yours →</Link>
            }
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {visibleFeed.map((form, i) => (
            <FormCard key={form.id} form={form} rank={i + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
