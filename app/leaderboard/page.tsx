import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { Trophy, Medal, Star, Users } from 'lucide-react'

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

  // ── Monthly leaderboard ───────────────────────────────────────
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const monthName = now.toLocaleString('en-US', { month: 'long', year: 'numeric' })

  const { data: monthlyFills } = await supabase
    .from('fills')
    .select('user_id, form_id')
    .gte('created_at', startOfMonth)

  let monthlyRanking: RankedUser[] = []

  if (monthlyFills && monthlyFills.length > 0) {
    const formIds = [...new Set(monthlyFills.map(f => f.form_id))]
    const { data: formDetails } = await supabase
      .from('forms')
      .select('id, estimated_minutes')
      .in('id', formIds)

    const formPtsMap: Record<string, number> = {}
    formDetails?.forEach(f => { formPtsMap[f.id] = 10 + f.estimated_minutes * 2 })

    const agg: Record<string, { points: number; fills: number }> = {}
    monthlyFills.forEach(fill => {
      if (!agg[fill.user_id]) agg[fill.user_id] = { points: 0, fills: 0 }
      agg[fill.user_id].points += formPtsMap[fill.form_id] ?? 0
      agg[fill.user_id].fills  += 1
    })

    const userIds = Object.keys(agg)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, username')
      .in('id', userIds)

    monthlyRanking = (profiles ?? [])
      .map(p => ({
        ...p,
        points: agg[p.id]?.points ?? 0,
        fills:  agg[p.id]?.fills  ?? 0,
      }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 50)
  }

  // ── All-time leaderboard ──────────────────────────────────────
  const { data: allTimeProfiles } = await supabase
    .from('profiles')
    .select('id, name, username, points')
    .not('username', 'is', null)
    .gt('points', 0)
    .order('points', { ascending: false })
    .limit(50)

  const allTimeRanking: RankedUser[] = (allTimeProfiles ?? []).map(p => ({
    ...p,
    fills: 0,
  }))

  const ranking = activeTab === 'monthly' ? monthlyRanking : allTimeRanking
  const [gold, silver, bronze] = ranking

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
          <Trophy size={22} className="text-amber-500" /> Leaderboard
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {activeTab === 'monthly'
            ? `Points earned in ${monthName} — resets each month`
            : 'Total points earned all time'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-ivory-dark p-1 rounded-xl w-fit mx-auto">
        <Link href="/leaderboard" className={`px-5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          activeTab === 'monthly' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
        }`}>
          This month
        </Link>
        <Link href="/leaderboard?tab=alltime" className={`px-5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          activeTab === 'alltime' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
        }`}>
          All time
        </Link>
      </div>

      {ranking.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Users size={36} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No activity yet this month</p>
          <p className="text-sm mt-1">Fill some surveys to get on the board!</p>
          <Link href="/" className="mt-4 inline-block text-sm text-charcoal hover:underline">Browse surveys →</Link>
        </div>
      ) : (
        <>
          {/* Podium — top 3 */}
          {ranking.length >= 1 && (
            <div className="flex items-end justify-center gap-3 mb-8">
              {/* Silver — 2nd */}
              {silver && (
                <PodiumCard user={silver} place={2} isMe={silver.id === user?.id} height="h-24" />
              )}
              {/* Gold — 1st */}
              <PodiumCard user={gold} place={1} isMe={gold.id === user?.id} height="h-32" />
              {/* Bronze — 3rd */}
              {bronze && (
                <PodiumCard user={bronze} place={3} isMe={bronze.id === user?.id} height="h-20" />
              )}
            </div>
          )}

          {/* Full ranked list */}
          <div className="space-y-2">
            {ranking.map((u, i) => {
              const isMe = u.id === user?.id
              const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null
              return (
                <Link
                  key={u.id}
                  href={u.username ? `/u/${u.username}` : '#'}
                  className={`flex items-center gap-4 rounded-xl px-5 py-3.5 border transition-all hover:shadow-sm ${
                    isMe
                      ? 'bg-charcoal text-white border-charcoal'
                      : 'bg-white border-ivory-border hover:border-charcoal/20'
                  }`}
                >
                  {/* Rank */}
                  <div className="w-8 text-center shrink-0">
                    {medal
                      ? <span className="text-lg">{medal}</span>
                      : <span className={`text-sm font-bold ${isMe ? 'text-ivory/70' : 'text-slate-400'}`}>#{i + 1}</span>
                    }
                  </div>

                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    isMe ? 'bg-white/20 text-white' : 'bg-gradient-to-br from-charcoal to-charcoal-deep text-white'
                  }`}>
                    {(u.name || u.username || '?')[0].toUpperCase()}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm truncate ${isMe ? 'text-white' : 'text-slate-800'}`}>
                      {u.name || `@${u.username}`}
                      {isMe && <span className="ml-2 text-xs font-normal opacity-70">(you)</span>}
                    </p>
                    {u.username && (
                      <p className={`text-xs truncate ${isMe ? 'text-ivory/60' : 'text-slate-400'}`}>
                        @{u.username}
                      </p>
                    )}
                  </div>

                  {/* Points */}
                  <div className="text-right shrink-0">
                    <div className={`font-bold text-sm ${isMe ? 'text-white' : 'text-emerald-600'}`}>
                      {u.points} pts
                    </div>
                    {activeTab === 'monthly' && u.fills > 0 && (
                      <div className={`text-xs ${isMe ? 'text-ivory/60' : 'text-slate-400'}`}>
                        {u.fills} survey{u.fills !== 1 ? 's' : ''}
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
  user, place, isMe, height,
}: {
  user: RankedUser
  place: 1 | 2 | 3
  isMe: boolean
  height: string
}) {
  const icon = place === 1
    ? <Trophy size={20} className="text-amber-400" />
    : place === 2
    ? <Medal size={18} className="text-slate-400" />
    : <Star size={16} className="text-amber-600" />

  return (
    <Link
      href={user.username ? `/u/${user.username}` : '#'}
      className="flex flex-col items-center gap-1.5 w-28 group"
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-bold ${
        isMe
          ? 'bg-charcoal text-white ring-2 ring-charcoal/40'
          : 'bg-gradient-to-br from-charcoal to-charcoal-deep text-white'
      } group-hover:scale-105 transition-transform`}>
        {(user.name || user.username || '?')[0].toUpperCase()}
      </div>
      <p className="text-xs font-semibold text-slate-700 text-center truncate w-full px-1">
        {user.name || `@${user.username}`}
        {isMe && <span className="text-charcoal"> (you)</span>}
      </p>
      <p className="text-xs text-emerald-600 font-bold">{user.points} pts</p>
      <div className={`w-full ${height} rounded-t-xl flex items-center justify-center ${
        place === 1 ? 'bg-amber-50 border border-amber-200' :
        place === 2 ? 'bg-slate-50 border border-slate-200' :
                     'bg-orange-50 border border-orange-200'
      }`}>
        {icon}
      </div>
    </Link>
  )
}
