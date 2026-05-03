import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, Users, UserCheck } from 'lucide-react'
import FollowButton from './FollowButton'
import ShareProfileButton from './ShareProfileButton'
import FormCard from '@/components/FormCard'
import Avatar, { getAvatarGradient } from '@/components/Avatar'
import type { FormFeedItem } from '@/lib/types'

export const revalidate = 0

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', username)
    .single()

  if (!profile) notFound()

  const isOwnProfile = user?.id === profile.id

  const [{ data: forms }, { data: followerRows }, { data: followingRows }, { data: isFollowingRow }] =
    await Promise.all([
      supabase.from('forms_feed').select('*')
        .eq('user_id', profile.id)
        .order('submitter_points', { ascending: false }),
      supabase.from('follows').select('id').eq('following_id', profile.id),
      supabase.from('follows').select('id').eq('follower_id', profile.id),
      user && !isOwnProfile
        ? supabase.from('follows').select('id')
            .eq('follower_id', user.id)
            .eq('following_id', profile.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ])

  const followerCount  = followerRows?.length ?? 0
  const followingCount = followingRows?.length ?? 0
  const isFollowing    = !!(isFollowingRow as any)?.data
  const feed           = (forms ?? []) as FormFeedItem[]
  const totalResponses = feed.reduce((a, f) => a + f.fill_count, 0)
  const displayName    = profile.name || `@${profile.username}`
  const gradient       = getAvatarGradient(displayName)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-10">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 mb-6 transition-colors">
        <ArrowLeft size={14} /> Back to feed
      </Link>

      {/* Profile hero */}
      <div className={`relative rounded-3xl overflow-hidden mb-6 bg-gradient-to-br ${gradient} p-6 sm:p-8`}>
        {/* dot grid */}
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

        <div className="relative z-10">
          {/* Top: avatar + actions */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl sm:text-3xl font-bold text-white border border-white/20 shrink-0">
                {displayName[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">{displayName}</h1>
                <p className="text-white/60 text-sm mt-0.5">@{profile.username}</p>
                {profile.institution && (
                  <p className="text-white/50 text-xs mt-1">{profile.institution}</p>
                )}
                {profile.specialty && (
                  <span className="inline-block text-xs font-medium text-white/70 bg-white/15 border border-white/20 px-2.5 py-0.5 rounded-full mt-1.5">
                    {profile.specialty}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              {isOwnProfile ? (
                <Link href="/profile"
                  className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg border border-white/20 transition-colors min-h-[36px] flex items-center">
                  Edit profile
                </Link>
              ) : (
                <FollowButton
                  targetUserId={profile.id}
                  currentUserId={user?.id ?? null}
                  initialFollowing={isFollowing}
                  followerCount={followerCount}
                />
              )}
              <ShareProfileButton username={profile.username!} />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {[
              { label: 'Points',     value: profile.points,   icon: '⭐' },
              { label: 'Followers',  value: followerCount,    icon: '👥' },
              { label: 'Following',  value: followingCount,   icon: '➡️' },
              { label: 'Responses',  value: totalResponses,   icon: '📊' },
            ].map(s => (
              <div key={s.label} className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 text-center border border-white/15">
                <div className="text-lg sm:text-xl font-bold text-white tabular-nums">{s.value}</div>
                <div className="text-white/60 text-[11px] mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Surveys */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FileText size={15} className="text-slate-400" />
          <h2 className="font-semibold text-slate-700">
            {isOwnProfile ? 'My surveys' : `${displayName}'s surveys`}
          </h2>
          {feed.length > 0 && (
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{feed.length}</span>
          )}
          {isOwnProfile && (
            <Link href="/submit" className="ml-auto text-xs font-semibold text-charcoal hover:underline">
              + Submit new
            </Link>
          )}
        </div>

        {feed.length === 0 ? (
          <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
              <FileText size={20} className="text-slate-300" />
            </div>
            <p className="font-semibold text-slate-600 mb-1">No surveys yet</p>
            <p className="text-sm text-slate-400 mb-4">
              {isOwnProfile ? "Post your first survey and start collecting responses." : "This researcher hasn't posted any surveys yet."}
            </p>
            {isOwnProfile && (
              <Link href="/submit"
                className="inline-flex items-center gap-1.5 bg-charcoal text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-charcoal-deep transition-colors">
                Submit a survey →
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {feed.map((form, i) => (
              <FormCard key={form.id} form={form} rank={i + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
