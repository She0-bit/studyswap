import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import FollowButton from './FollowButton'
import ShareProfileButton from './ShareProfileButton'
import FormCard from '@/components/FormCard'
import type { FormFeedItem } from '@/lib/types'

export const revalidate = 0

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Fetch the profile by username (case-insensitive)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', username)
    .single()

  if (!profile) notFound()

  const isOwnProfile = user?.id === profile.id

  // Parallel fetches
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

  const feed = (forms ?? []) as FormFeedItem[]
  const totalResponses = feed.reduce((a, f) => a + f.fill_count, 0)

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors">
        <ArrowLeft size={15} /> Back to feed
      </Link>

      {/* Profile card */}
      <div className="bg-gradient-to-br from-charcoal to-charcoal-deep text-white rounded-2xl p-7 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">{profile.name || `@${profile.username}`}</h1>
            <p className="text-ivory/80 text-sm mt-0.5">@{profile.username}</p>
            {profile.institution && <p className="text-ivory/60 text-xs mt-0.5">{profile.institution}</p>}
            {profile.specialty   && <p className="text-ivory/60 text-xs">{profile.specialty}</p>}
          </div>

          <div className="flex flex-col items-end gap-2">
            {isOwnProfile ? (
              <Link href="/profile"
                className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors">
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

        <div className="mt-5 grid grid-cols-4 gap-3">
          {[
            { label: 'Points', value: profile.points },
            { label: 'Followers', value: followerCount },
            { label: 'Following', value: followingCount },
            { label: 'Responses', value: totalResponses },
          ].map(s => (
            <div key={s.label} className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-lg font-bold">{s.value}</div>
              <div className="text-ivory/80 text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      </div>


      {/* Their surveys */}
      <div>
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-charcoal" />
          {isOwnProfile ? 'My surveys' : `${profile.name || '@' + profile.username}'s surveys`}
        </h2>

        {feed.length === 0 ? (
          <div className="bg-white border border-ivory-border rounded-xl p-8 text-center text-slate-400 text-sm">
            No surveys posted yet.
            {isOwnProfile && (
              <> <Link href="/submit" className="text-charcoal hover:underline">Submit one →</Link></>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {feed.map((form, i) => (
              <FormCard key={form.id} form={form} rank={i + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

