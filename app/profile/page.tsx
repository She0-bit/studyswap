import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Trophy, Clock, Plus, ToggleLeft, CheckCircle2, UserCircle, ExternalLink } from 'lucide-react'
import DeactivateButton from './DeactivateButton'
import UpdateProfileForm from './UpdateProfileForm'
import type { Profile } from '@/lib/types'

export const revalidate = 0

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const [{ data: profile }, { data: myForms }, { data: myFills }, { data: referralData }, { data: followerRows }, { data: followingRows }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('forms').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('fills').select('form_id, filled_at, forms(title, id)').eq('user_id', user.id).order('filled_at', { ascending: false }),
    supabase.from('referral_fills').select('id, points_awarded, filled_by, created_at').eq('referrer_id', user.id),
    supabase.from('follows').select('id').eq('following_id', user.id),
    supabase.from('follows').select('id').eq('follower_id', user.id),
  ])

  const rankQuery = await supabase.from('profiles').select('id').gt('points', profile?.points ?? 0)
  const rank = (rankQuery.data?.length ?? 0) + 1
  const totalReferralPts = referralData?.reduce((a, r) => a + r.points_awarded, 0) ?? 0
  const followerCount  = followerRows?.length ?? 0
  const followingCount = followingRows?.length ?? 0

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">

      {/* Header card */}
      <div className="bg-gradient-to-br from-charcoal to-charcoal-deep text-white rounded-2xl p-7">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold">{profile?.name || user.email}</h1>
            {profile?.username ? (
              <Link href={`/u/${profile.username}`}
                className="inline-flex items-center gap-1 text-ivory/80 text-sm mt-0.5 hover:text-white transition-colors">
                @{profile.username} <ExternalLink size={11} />
              </Link>
            ) : (
              <p className="text-ivory/60 text-xs mt-0.5 italic">No username yet — set one below</p>
            )}
            {profile?.institution && <p className="text-ivory/60 text-xs mt-0.5">{profile.institution}</p>}
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{profile?.points ?? 0}</div>
            <div className="text-ivory/80 text-xs">total points</div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-5 gap-2">
          {[
            { label: 'Feed rank',  value: `#${rank}` },
            { label: 'Followers',  value: followerCount },
            { label: 'Following',  value: followingCount },
            { label: 'Filled',     value: myFills?.length ?? 0 },
            { label: 'Referral pts', value: totalReferralPts },
          ].map(s => (
            <div key={s.label} className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-lg font-bold">{s.value}</div>
              <div className="text-ivory/80 text-xs">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Username missing warning */}
        {!profile?.username && (
          <div className="mt-4 bg-amber-400/20 border border-amber-300/30 rounded-xl px-4 py-2.5 text-amber-100 text-xs">
            ⚠️ Set a username below so people can find and follow you, and to get your shareable profile link.
          </div>
        )}
      </div>

      {/* Edit profile */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <UserCircle size={18} className="text-charcoal" />
          <h2 className="font-semibold text-slate-800">My profile</h2>
        </div>
        <div className="bg-white border border-ivory-border rounded-xl p-6">
          <p className="text-xs text-slate-500 mb-4 bg-ivory border border-charcoal/10 rounded-lg px-4 py-2.5">
            Fill in your details so we can show you surveys that match your profile in the <strong>Suggested for you</strong> section. This info is private and never shown publicly.
          </p>
          <UpdateProfileForm profile={profile as Profile} />
        </div>
      </section>

      {/* My surveys */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <ToggleLeft size={18} className="text-charcoal" /> My surveys
          </h2>
          <Link href="/submit"
            className="flex items-center gap-1.5 text-xs bg-charcoal text-white px-3 py-1.5 rounded-lg hover:bg-charcoal-deep transition-colors">
            <Plus size={13} /> New survey
          </Link>
        </div>

        {!myForms?.length ? (
          <div className="bg-white border border-ivory-border rounded-xl p-8 text-center text-slate-400 text-sm">
            No surveys yet.{' '}
            <Link href="/submit" className="text-charcoal hover:underline">Submit one →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {myForms.map((f: any) => (
              <div key={f.id} className="bg-white border border-ivory-border rounded-xl p-5 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${f.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-ivory-dark text-slate-400'}`}>
                      {f.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {f.specialty && <span className="text-xs text-charcoal">{f.specialty}</span>}
                  </div>
                  <p className="font-medium text-slate-800 truncate text-sm">{f.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Clock size={11} /> {f.estimated_minutes} min</span>
                    <span className="flex items-center gap-1"><CheckCircle2 size={11} /> {f.fill_count} filled</span>
                    <span className="flex items-center gap-1"><Trophy size={11} className="text-emerald-400" /> {f.fill_count * (10 + f.estimated_minutes * 2)} pts generated</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/forms/${f.id}`}
                    className="text-xs text-slate-500 border border-ivory-border px-3 py-1.5 rounded-lg hover:bg-ivory transition-colors">
                    View
                  </Link>
                  <DeactivateButton formId={f.id} isActive={f.is_active} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Surveys I filled */}
      <section>
        <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
          <CheckCircle2 size={18} className="text-emerald-500" /> Surveys I filled
        </h2>
        {!myFills?.length ? (
          <div className="bg-white border border-ivory-border rounded-xl p-8 text-center text-slate-400 text-sm">
            You haven't filled any surveys yet.{' '}
            <Link href="/" className="text-charcoal hover:underline">Browse the feed →</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {myFills.map((fill: any) => (
              <div key={fill.form_id} className="bg-white border border-ivory-border rounded-xl px-5 py-3.5 flex items-center justify-between">
                <div>
                  <Link href={`/forms/${fill.form_id}`} className="text-sm font-medium text-slate-700 hover:text-charcoal transition-colors">
                    {(fill.forms as any)?.title ?? 'Untitled survey'}
                  </Link>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(fill.filled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  pts earned
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Referral fills */}
      {(referralData?.length ?? 0) > 0 && (
        <section>
          <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
            <Trophy size={18} className="text-amber-500" /> Referral points earned
          </h2>
          <div className="bg-white border border-ivory-border rounded-xl p-5">
            <p className="text-sm text-slate-600 mb-3">
              You've earned <strong className="text-emerald-600">{totalReferralPts} pts</strong> from {referralData?.length} people who filled surveys via your share links.
            </p>
            <div className="space-y-2">
              {referralData?.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between text-xs text-slate-500">
                  <span>{new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <span className="text-emerald-600 font-medium">+{r.points_awarded} pts</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
