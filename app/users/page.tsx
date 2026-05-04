import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { Search, Users, Trophy } from 'lucide-react'
import { getAvatarGradient } from '@/components/Avatar'

export const revalidate = 0

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createClient()

  let results: any[] = []
  if (q && q.trim().length >= 1) {
    const clean = q.trim().replace(/^@/, '')
    const { data } = await supabase
      .from('profiles')
      .select('id, username, name, institution, specialty, points')
      .not('username', 'is', null)
      .or(`username.ilike.%${clean}%,name.ilike.%${clean}%`)
      .order('points', { ascending: false })
      .limit(30)
    results = data ?? []
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-10">

      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden mb-6 bg-gradient-to-br from-charcoal to-charcoal-deep px-6 py-8 sm:px-10 sm:py-10 animate-fade-slide-up">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-white/60 bg-white/10 border border-white/10 px-3 py-1.5 rounded-full mb-4">
            <Users size={12} className="text-white/50" />
            Researcher directory
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">Find researchers</h1>
          <p className="text-white/50 text-sm mb-6">Search by name or @username to find and follow other researchers.</p>

          {/* Search bar — inside hero */}
          <form method="GET">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                name="q"
                defaultValue={q}
                autoFocus
                placeholder="Search by name or @username…"
                className="w-full bg-white/10 border border-white/15 text-white placeholder-white/35 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:bg-white/15 focus:border-white/30 transition-all"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Results */}
      {!q ? (
        <div className="section-card p-12 text-center animate-fade-slide-up" style={{ animationDelay: '60ms' }}>
          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
            <Search size={22} className="text-slate-300" />
          </div>
          <p className="font-semibold text-slate-600 mb-1">Search the network</p>
          <p className="text-sm text-slate-400">Type a name or @username above to find researchers</p>
        </div>
      ) : results.length === 0 ? (
        <div className="section-card p-12 text-center animate-fade-slide-up" style={{ animationDelay: '60ms' }}>
          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
            <Users size={22} className="text-slate-300" />
          </div>
          <p className="font-semibold text-slate-600 mb-1">No results for "{q}"</p>
          <p className="text-sm text-slate-400">Try a different name or username</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {results.map((u, i) => {
            const seed     = u.name || u.username || '?'
            const gradient = getAvatarGradient(seed)
            return (
              <Link
                key={u.id}
                href={`/u/${u.username}`}
                className="flex items-center gap-4 section-card px-5 py-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 card-press animate-fade-slide-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {/* Colored avatar */}
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-base shrink-0`}>
                  {seed[0].toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">
                    {u.name || `@${u.username}`}
                  </p>
                  <p className="text-sm text-slate-400">@{u.username}</p>
                  {(u.institution || u.specialty) && (
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      {[u.institution, u.specialty].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <div className="inline-flex items-center gap-1.5 text-emerald-600 text-sm font-bold tabular-nums bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                    <Trophy size={11} />
                    {u.points ?? 0}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">points</p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
