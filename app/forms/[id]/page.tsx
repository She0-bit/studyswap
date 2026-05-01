import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import FillButton from './FillButton'
import ShareButton from '@/components/ShareButton'
import { Clock, Users, Trophy, BookOpen, ArrowLeft, ExternalLink, UserCheck, MapPin } from 'lucide-react'
import Link from 'next/link'
import { roleLabel, type FormFeedItem } from '@/lib/types'

export const revalidate = 0

export default async function FormDetailPage({
  params,
  searchParams,
}: {
  params:       Promise<{ id: string }>
  searchParams: Promise<{ ref?: string }>
}) {
  const { id }  = await params
  const { ref } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: form } = await supabase
    .from('forms_feed').select('*').eq('id', id).single()

  if (!form) notFound()

  const f = form as FormFeedItem
  const criteria = f.sample_criteria

  let alreadyFilled = false
  let isOwner = false
  if (user) {
    isOwner = user.id === f.user_id
    const { data: fill } = await supabase
      .from('fills').select('id')
      .eq('user_id', user.id).eq('form_id', id).maybeSingle()
    alreadyFilled = !!fill
  }

  const pointsReward = 10 + f.estimated_minutes * 2

  const hasRoles     = (criteria?.roles?.length ?? 0) > 0
  const hasSex       = criteria?.sex && criteria.sex !== 'any'
  const hasAge       = criteria?.min_age != null || criteria?.max_age != null
  const hasCountries = (criteria?.countries?.length ?? 0) > 0
  const hasOther     = !!criteria?.other

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors">
        <ArrowLeft size={15} /> Back to feed
      </Link>

      <div className="bg-white border border-ivory-border rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-charcoal to-charcoal-deep px-7 py-8 text-white">
          {f.specialty && (
            <span className="text-xs font-medium bg-white/20 px-2.5 py-1 rounded-full mb-3 inline-block">
              {f.specialty}
            </span>
          )}
          <h1 className="text-xl font-bold leading-snug">{f.title}</h1>
          <div className="mt-3 flex items-center gap-1.5 text-ivory/80 text-sm">
            <BookOpen size={14} />
            <span>{f.submitter_name || 'Anonymous'}</span>
            {f.submitter_institution && <span>· {f.submitter_institution}</span>}
          </div>
        </div>

        <div className="px-7 py-6 space-y-5">
          {/* Description */}
          <p className="text-slate-600 text-sm leading-relaxed">{f.description}</p>

          {/* Sample criteria */}
          {(hasRoles || hasSex || hasAge || hasCountries || hasOther) && (
            <div className="bg-ivory border border-ivory-border rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2.5">Who this survey is for</p>
              <div className="flex flex-wrap gap-2">
                {hasRoles && criteria!.roles.map(r => (
                  <span key={r} className="inline-flex items-center gap-1.5 text-xs bg-ivory text-charcoal border border-charcoal/10 px-2.5 py-1 rounded-full">
                    <UserCheck size={11} /> {roleLabel(r)}
                  </span>
                ))}
                {hasSex && (
                  <span className="text-xs bg-pink-50 text-pink-700 border border-pink-100 px-2.5 py-1 rounded-full capitalize">
                    {criteria!.sex} only
                  </span>
                )}
                {hasAge && (
                  <span className="text-xs bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-1 rounded-full">
                    Age {criteria!.min_age ?? '?'}–{criteria!.max_age ?? '?'}
                  </span>
                )}
                {hasCountries && criteria!.countries.map(c => (
                  <span key={c} className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full">
                    <MapPin size={10} /> {c}
                  </span>
                ))}
              </div>
              {hasOther && (
                <p className="mt-2.5 text-xs text-slate-500 italic">"{criteria!.other}"</p>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-ivory rounded-xl p-3.5 text-center">
              <Clock size={16} className="text-charcoal/70 mx-auto mb-1" />
              <p className="text-lg font-bold text-slate-700">{f.estimated_minutes}</p>
              <p className="text-xs text-slate-400">min</p>
            </div>
            <div className="bg-ivory rounded-xl p-3.5 text-center">
              <Users size={16} className="text-emerald-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-slate-700">{f.fill_count}</p>
              <p className="text-xs text-slate-400">responses</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3.5 text-center">
              <Trophy size={16} className="text-emerald-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-emerald-600">+{pointsReward}</p>
              <p className="text-xs text-emerald-500">pts for you</p>
            </div>
          </div>

          {/* Fill CTA */}
          <FillButton
            formId={f.id}
            formLink={f.link}
            estimatedMinutes={f.estimated_minutes}
            pointsReward={pointsReward}
            isLoggedIn={!!user}
            isOwner={isOwner}
            alreadyFilled={alreadyFilled}
            referrerId={ref ?? null}
          />

          {/* Share */}
          {!isOwner && <ShareButton formId={f.id} />}

          {/* Direct link */}
          <a href={f.link} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors">
            <ExternalLink size={12} /> Open survey directly in new tab
          </a>
        </div>
      </div>
    </div>
  )
}
