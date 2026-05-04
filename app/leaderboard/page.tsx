import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { Trophy, Users, FileText } from 'lucide-react'
import { getAvatarGradient } from '@/components/Avatar'

export const revalidate = 0

type RankedUser = {
  id: string
  name: string | null
  username: string | null
  points: number
  fills: number
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const activeTab = tab === 'alltime' ? 'alltime' : 'monthly'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const now = new Date()
  const monthName = now.toLocaleString('en-US', { month: 'long', year: 'numeric' })

  const [{ data: monthlyData }, { data: allTimeData }] = await Promise.all([
    supabase.rpc('get_monthly_leaderboard'),
    supabase.rpc('get_alltime_leaderboard'),
  ])

  const monthlyRanking: RankedUser[] = (monthlyData ?? []).map((r: any) => ({
    id:       r.user_id,
    name:     r.name,
    username: r.username,
    points:   Number(r.monthly_points),
    fills:    Number(r.fill_count),
  }))

  const allTimeRanking: RankedUser[] = (allTimeData ?? []).map((r: any) => ({
    id:       r.user_id,
    name:     r.name,
    username: r.username,
    points:   Number(r.total_points),
    fills:    Number(r.fill_count),
  }))

  const ranking = activeTab === 'monthly' ? monthlyRanking : allTimeRanking

  // Dense rank: tied points → same rank
  const denseRanks: number[] = []
  let currentRank = 0
  let lastPts = -1
  for (const u of ranking) {
    if (u.points !== lastPts) { currentRank++; lastPts = u.points }
    denseRanks.push(currentRank)
  }

  const [gold, silver, bronze] = ranking

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-10">

      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden mb-8 bg-gradient-to-br from-charcoal to-charcoal-deep px-6 py-8 sm:px-10 sm:py-10">
        {/* dot grid */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="relative z-10 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-white/60 bg-white/10 border border-white/10 px-3 py-1.5 rounded-full mb-4">
            <Trophy size={12} className="text-amber-400" />
            {activeTab === 'monthly' ? monthName : 'All time'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 tracking-tight">
            Leaderboard
          </h1>
          <p className="text-white/50 text-sm mb-6">
            {activeTab === 'monthly'
              ? 'Points earned this month — resets on the 1st'
              : 'Total points earned since the beginning'}
          </p>

          {/* Tabs */}
          <div className="flex gap-1 bg-white/10 p-1 rounded-xl w-fit mx-auto">
            <Link href="/leaderboard" className={`px-5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'monthly'
                ? 'bg-white text-charcoal shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}>
              This month
            </Link>
            <Link href="/leaderboard?tab=alltime" className={`px-5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'alltime'
                ? 'bg-white text-charcoal shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}>
              All time
            </Link>
          </div>
        </div>
      </div>

      {ranking.length === 0 ? (
        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl text-center py-20">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
            <Users size={24} className="text-slate-300" />
          </div>
          <p className="font-semibold text-slate-600 mb-1">No activity yet this month</p>
          <p className="text-sm text-slate-400 mb-5">Fill some surveys to get on the board!</p>
          <Link href="/"
            className="inline-flex items-center gap-1.5 bg-charcoal text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-charcoal-deep transition-colors">
            Browse surveys →
          </Link>
        </div>
      ) : (
        <>
          {/* Podium — top 3 */}
          {ranking.length >= 1 && (
            <div className="flex items-end justify-center gap-4 sm:gap-6 mb-8">
              {/* Silver — 2nd */}
              {silver ? (
                <PodiumCard user={silver} place={2} isMe={silver.id === user?.id} />
              ) : <div className="w-28" />}

              {/* Gold — 1st */}
              <PodiumCard user={gold} place={1} isMe={gold.id === user?.id} />

              {/* Bronze — 3rd */}
              {bronze ? (
                <PodiumCard user={bronze} place={3} isMe={bronze.id === user?.id} />
              ) : <div className="w-28" />}
            </div>
          )}

          {/* Full ranked list */}
          <div className="space-y-2">
            {ranking.map((u, i) => {
              const isMe  = u.id === user?.id
              const rank  = denseRanks[i]
              const seed  = u.name || u.username || '?'
              const gradient = getAvatarGradient(seed)

              return (
                <Link
                  key={u.id}
                  href={u.username ? `/u/${u.username}` : '#'}
                  className={`flex items-center gap-3 sm:gap-4 rounded-2xl px-4 py-3.5 border transition-all card-press ${
                    isMe
                      ? 'bg-charcoal text-white border-charcoal shadow-sm'
                      : 'bg-white border-slate-100 hover:shadow-md hover:-translate-y-0.5 shadow-sm'
                  }`}
                >
                  {/* Rank badge */}
                  <div className="w-8 text-center shrink-0">
                    {rank === 1 ? (
                      <span className="inline-block text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">#1</span>
                    ) : rank === 2 ? (
                      <span className="inline-block text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">#2</span>
                    ) : rank === 3 ? (
                      <span className="inline-block text-xs font-bold text-amber-800 bg-amber-50/80 px-2 py-0.5 rounded-full">#3</span>
                    ) : (
                      <span className={`text-sm font-bold tabular-nums ${isMe ? 'text-white/60' : 'text-slate-400'}`}>
                        #{rank}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  {isMe ? (
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold text-white shrink-0">
                      {seed[0].toUpperCase()}
                    </div>
                  ) : (
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-sm font-bold text-white shrink-0`}>
                      {seed[0].toUpperCase()}
                    </div>
                  )}

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm truncate ${isMe ? 'text-white' : 'text-slate-800'}`}>
                      {u.name || `@${u.username}`}
                      {isMe && <span className="ml-2 text-xs font-normal opacity-60">(you)</span>}
                    </p>
                    {u.username && (
                      <p className={`text-xs truncate ${isMe ? 'text-white/50' : 'text-slate-400'}`}>
                        @{u.username}
                      </p>
                    )}
                  </div>

                  {/* Points + fills */}
                  <div className="text-right shrink-0">
                    <div className={`font-bold text-sm tabular-nums ${isMe ? 'text-white' : 'text-emerald-600'}`}>
                      {u.points} pts
                    </div>
                    {u.fills > 0 && (
                      <div className={`flex items-center justify-end gap-1 text-xs ${isMe ? 'text-white/50' : 'text-slate-400'}`}>
                        <FileText size={10} />
                        {u.fills}
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function PodiumCard({
  user, place, isMe,
}: {
  user: RankedUser
  place: 1 | 2 | 3
  isMe: boolean
}) {
  const seed     = user.name || user.username || '?'
  const gradient = getAvatarGradient(seed)
  const avatarSize = place === 1 ? 'w-16 h-16 text-xl' : 'w-12 h-12 text-base'
  const barHeight  = place === 1 ? 'h-20' : place === 2 ? 'h-14' : 'h-10'
  const barColor   =
    place === 1 ? 'bg-amber-400/20 border-amber-400/30' :
    place === 2 ? 'bg-slate-200/60 border-slate-300/50' :
                  'bg-amber-700/15 border-amber-700/25'
  const rankLabel =
    place === 1 ? { text: '#1', cls: 'text-amber-700 bg-amber-50 border border-amber-200' } :
    place === 2 ? { text: '#2', cls: 'text-slate-600 bg-slate-100 border border-slate-200' } :
                  { text: '#3', cls: 'text-amber-800 bg-amber-50/80 border border-amber-200/60' }

  return (
    <Link
      href={user.username ? `/u/${user.username}` : '#'}
      className="flex flex-col items-center gap-1.5 w-24 sm:w-28 group"
    >
      {/* Rank label */}
      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${rankLabel.cls}`}>
        {rankLabel.text}
      </span>

      {/* Avatar */}
      <div className={`${avatarSize} rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-white shrink-0 ${
        isMe ? 'ring-2 ring-offset-2 ring-charcoal/40' : ''
      } group-hover:scale-105 transition-transform shadow-sm`}>
        {seed[0].toUpperCase()}
      </div>

      {/* Name */}
      <p className="text-xs font-semibold text-slate-700 text-center truncate w-full px-1 leading-tight">
        {user.name || `@${user.username}`}
        {isMe && <span className="text-charcoal"> ✦</span>}
      </p>

      {/* Points */}
      <p className="text-xs font-bold text-emerald-600 tabular-nums">{user.points} pts</p>

      {/* Podium bar */}
      <div className={`w-full ${barHeight} rounded-t-xl border ${barColor}`} />
    </Link>
  )
}
