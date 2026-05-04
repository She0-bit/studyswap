import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Trophy, Clock, Plus, ToggleLeft, CheckCircle2, ExternalLink, FileText, Star } from 'lucide-react'
import DeactivateButton from './DeactivateButton'
import UpdateProfileForm from './UpdateProfileForm'
import { getAvatarGradient } from '@/components/Avatar'
import type { Profile } from '@/lib/types'

export const revalidate = 0

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  const profile: Profile = profileData ?? {
    id: user.id, name: null, username: null, institution: null,
    specialty: null, role: null, age: null, sex: null, country: null, points: 0,
  }

  const [formsResult, fillsResult, referralResult, followerResult, followingResult] = await Promise.all([
    supabase.from('forms').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('fills').select('form_id, filled_at').eq('user_id', user.id).order('filled_at', { ascending: false }),
    supabase.from('referral_fills').select('id, points_awarded, created_at').eq('referrer_id', user.id),
    supabase.from('follows').select('id').eq('following_id', user.id),
    supabase.from('follows').select('id').eq('follower_id', user.id),
  ])

  const myForms      = formsResult.data ?? []
  const myFills      = fillsResult.data ?? []
  const referralData = referralResult.error ? [] : (referralResult.data ?? [])
  const followerCount  = followerResult.error ? 0 : (followerResult.data?.length ?? 0)
  const followingCount = followingResult.error ? 0 : (followingResult.data?.length ?? 0)

  const fillFormIds = myFills.map(f => f.form_id)
  const fillFormMap: Record<string, string> = {}
  if (fillFormIds.length > 0) {
    const { data: fillForms } = await supabase.from('forms').select('id, title').in('id', fillFormIds)
    fillForms?.forEach(f => { fillFormMap[f.id] = f.title })
  }

  const { data: rankRows } = await supabase.from('profiles').select('id').gt('points', profile.points ?? 0)
  const rank = (rankRows?.length ?? 0) + 1
  const totalReferralPts = referralData.reduce((a: number, r: any) => a + (r.points_awarded ?? 0), 0)

  const displayName = profile.name || (profile.username ? `@${profile.username}` : user.email ?? 'You')
  const gradient    = getAvatarGradient(displayName)
  const initial     = displayName[0]?.toUpperCase() ?? '?'

  const stats = [
    { label: 'Rank',       value: `#${rank}`,        accent: false },
    { label: 'Followers',  value: followerCount,      accent: false },
    { label: 'Following',  value: followingCount,     accent: false },
    { label: 'Filled',     value: myFills.length,     accent: false },
    { label: 'Referrals',  value: totalReferralPts + ' pts', accent: true },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-10 space-y-6">

      {/* Profile hero */}
      <div className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${gradient} p-6 sm:p-8 animate-fade-slide-up`}>
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold text-white border border-white/20">
                {initial}
              </div>
              <div>
                <h1 className="text-xl font-bold text-white leading-tight">{displayName}</h1>
                {profile.username && (
                  <Link href={`/u/${profile.username}`}
                    className="inline-flex items-center gap-1 text-white/60 text-sm hover:text-white transition-colors mt-0.5">
                    @{profile.username} <ExternalLink size={11} />
                  </Link>
                )}
                {profile.institution && (
                  <p className="text-white/50 text-xs mt-0.5">{profile.institution}</p>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-3xl font-bold text-white tabular-nums">{profile.points ?? 0}</p>
              <p className="text-white/60 text-xs">total points</p>
            </div>
          </div>

          {/* Warning for no username */}
          {!profile.username && (
            <div className="bg-white/15 border border-white/20 rounded-2xl px-4 py-3 text-white/80 text-xs mb-5">
              Set a username below so people can find and follow you.
            </div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-5 gap-2">
            {stats.map(s => (
              <div key={s.label} className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 text-center border border-white/10">
                <p className={`text-base font-bold tabular-nums ${s.accent ? 'text-amber-300' : 'text-white'}`}>{s.value}</p>
                <p className="text-white/55 text-[10px] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit profile */}
      <section className="animate-fade-slide-up" style={{ animationDelay: '60ms' }}>
        <SectionHeader icon={<Star size={15} />} title="My profile" />
        <div className="section-card p-6">
          <p className="text-xs text-slate-500 mb-5 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 leading-relaxed">
            Fill in your details so we can show you surveys that match your profile in the <strong className="text-slate-700">Suggested for you</strong> section.
          </p>
          <UpdateProfileForm profile={profile} />
        </div>
      </section>

      {/* My surveys */}
      <section className="animate-fade-slide-up" style={{ animationDelay: '100ms' }}>
        <SectionHeader
          icon={<ToggleLeft size={15} />}
          title="My surveys"
          action={
            <Link href="/submit"
              className="flex items-center gap-1.5 text-xs bg-charcoal text-white px-3 py-1.5 rounded-lg hover:bg-charcoal-deep transition-colors font-medium">
              <Plus size={12} /> New survey
            </Link>
          }
        />
        {myForms.length === 0 ? (
          <div className="section-card p-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
              <FileText size={20} className="text-slate-300" />
            </div>
            <p className="text-sm text-slate-500">No surveys yet.{' '}
              <Link href="/submit" className="text-charcoal font-medium hover:underline">Submit one →</Link>
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {myForms.map((f: any) => (
              <div key={f.id} className="section-card px-5 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      f.is_active !== false
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}>
                      {f.is_active !== false ? '● Active' : '○ Inactive'}
                    </span>
                    {f.specialty && (
                      <span className="text-xs text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                        {f.specialty}
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-slate-800 truncate text-sm">{f.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Clock size={10} /> {f.estimated_minutes} min</span>
                    <span className="flex items-center gap-1"><CheckCircle2 size={10} /> {f.fill_count ?? 0} filled</span>
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                      <Trophy size={10} />
                      {(f.fill_count ?? 0) * (10 + (f.estimated_minutes ?? 0) * 2)} pts
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/forms/${f.id}`}
                    className="text-xs text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                    View
                  </Link>
                  <Link href={`/forms/${f.id}/edit`}
                    className="text-xs bg-charcoal text-white px-3 py-1.5 rounded-lg hover:bg-charcoal-deep transition-colors">
                    Edit
                  </Link>
                  <DeactivateButton formId={f.id} isActive={f.is_active !== false} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Surveys I filled */}
      <section className="animate-fade-slide-up" style={{ animationDelay: '140ms' }}>
        <SectionHeader icon={<CheckCircle2 size={15} className="text-emerald-500" />} title="Surveys I filled" />
        {myFills.length === 0 ? (
          <div className="section-card p-10 text-center">
            <p className="text-sm text-slate-500">
              You haven't filled any surveys yet.{' '}
              <Link href="/" className="text-charcoal font-medium hover:underline">Browse the feed →</Link>
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {myFills.map((fill: any) => (
              <div key={fill.form_id} className="section-card px-5 py-3.5 flex items-center justify-between">
                <div>
                  <Link href={`/forms/${fill.form_id}`}
                    className="text-sm font-medium text-slate-700 hover:text-charcoal transition-colors">
                    {fillFormMap[fill.form_id] ?? 'Untitled survey'}
                  </Link>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(fill.filled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                  pts earned
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Referral fills */}
      {referralData.length > 0 && (
        <section className="animate-fade-slide-up" style={{ animationDelay: '180ms' }}>
          <SectionHeader icon={<Trophy size={15} className="text-amber-500" />} title="Referral points" />
          <div className="section-card p-5">
            <p className="text-sm text-slate-600 mb-4">
              You've earned <strong className="text-emerald-600">{totalReferralPts} pts</strong> from{' '}
              {referralData.length} referral{referralData.length !== 1 ? 's' : ''}.
            </p>
            <div className="space-y-2">
              {referralData.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between text-xs text-slate-500 py-1.5 border-b border-slate-50 last:border-0">
                  <span>{new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <span className="text-emerald-600 font-semibold">+{r.points_awarded} pts</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

function SectionHeader({ icon, title, action }: { icon: React.ReactNode; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
        <span className="text-slate-400">{icon}</span>
        {title}
      </h2>
      {action}
    </div>
  )
}
