import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { Search, Users, Trophy, FileText } from 'lucide-react'

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
    const clean = q.trim().replace(/^@/, '') // strip leading @
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
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Users size={22} className="text-charcoal" /> Find researchers
        </h1>
        <p className="text-slate-500 text-sm mt-1">Search by name or @username to find and follow other researchers.</p>
      </div>

      {/* Search bar */}
      <form method="GET" className="relative mb-8">
        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          name="q"
          defaultValue={q}
          autoFocus
          placeholder="Search by name or @username…"
          className="w-full pl-10 pr-4 py-3 border border-ivory-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-charcoal shadow-sm"
        />
      </form>

      {/* Results */}
      {!q ? (
        <div className="text-center py-16 text-slate-400">
          <Users size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Start typing to find researchers</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="font-medium mb-1">No users found for "{q}"</p>
          <p className="text-sm">Try a different name or username</p>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map(u => (
            <Link key={u.id} href={`/u/${u.username}`}
              className="flex items-center gap-4 bg-white border border-ivory-border rounded-xl px-5 py-4 hover:border-charcoal/30 hover:shadow-sm transition-all group">
              {/* Avatar placeholder */}
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-charcoal to-charcoal-deep flex items-center justify-center text-white font-bold text-sm shrink-0">
                {(u.name || u.username || '?')[0].toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 group-hover:text-charcoal transition-colors">
                  {u.name || `@${u.username}`}
                </p>
                <p className="text-sm text-slate-500">@{u.username}</p>
                {(u.institution || u.specialty) && (
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    {[u.institution, u.specialty].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>

              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 text-emerald-600 text-sm font-semibold">
                  <Trophy size={13} />
                  {u.points ?? 0}
                </div>
                <p className="text-xs text-slate-400">points</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
