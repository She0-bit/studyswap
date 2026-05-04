import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import FillButton from './FillButton'
import ShareButton from '@/components/ShareButton'
import ReportButton from './ReportButton'
import DeactivateButton from '@/app/profile/DeactivateButton'
import { Clock, Users, Trophy, ArrowLeft, ExternalLink, UserCheck, MapPin, Pencil } from 'lucide-react'
import Link from 'next/link'
import { roleLabel, type FormFeedItem } from '@/lib/types'
import { getAvatarGradient } from '@/components/Avatar'

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
  let isActive = true
  if (user) {
    isOwner = user.id === f.user_id
    const { data: fill } = await supabase
      .from('fills').select('id')
      .eq('user_id', user.id).eq('form_id', id).maybeSingle()
    alreadyFilled = !!fill

    if (isOwner) {
      const { data: formRow } = await supabase
        .from('forms').select('is_active').eq('id', id).single()
      isActive = formRow?.is_active !== false
    }
  }

  const pointsReward = 10 + f.estimated_minutes * 2

  const hasRoles     = (criteria?.roles?.length ?? 0) > 0
  const hasSex       = criteria?.sex && criteria.sex !== 'any'
  const hasAge       = criteria?.min_age != null || criteria?.max_age != null
  const hasCountries = (criteria?.countries?.length ?? 0) > 0
  const hasOther     = !!criteria?.other
  const hasCriteria  = hasRoles || hasSex || hasAge || hasCountries || hasOther

  const authorLabel = f.submitter_username || f.submitter_name || 'Anonymous'
  const authorGradient = getAvatarGradient(authorLabel)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-10">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 mb-6 transition-colors">
        <ArrowLeft size={14} /> Back to feed
      </Link>

      {/* Hero header */}
      <div className="relative rounded-3xl overflow-hidden mb-4 bg-gradient-to-br from-charcoal to-charcoal-deep px-6 py-8 sm:px-8 text-white animate-fade-slide-up">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {f.specialty && (
              <span className="text-xs font-medium bg-white/15 border border-white/20 px-3 py-1 rounded-full">
                {f.specialty}
              </span>
            )}
            {!isActive && (
              <span className="text-xs font-medium bg-white/10 text-white/50 border border-white/10 px-3 py-1 rounded-full">
                Inactive
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold leading-snug mb-4">{f.title}</h1>

          {/* Author */}
          {f.submitter_username && (
            <Link href={`/u/${f.submitter_username}`}
              className="inline-flex items-center gap-2.5 group">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${authorGradient} flex items-center justify-center text-sm font-bold text-white shrink-0`}>
                {authorLabel[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-white group-hover:underline underline-offset-2 leading-tight">
                  @{f.submitter_username}
                </p>
                {f.submitter_institution && (
                  <p className="text-white/50 text-xs">{f.submitter_institution}</p>
                )}
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Body card */}
      <div className="section-card overflow-hidden animate-fade-slide-up" style={{ animationDelay: '60ms' }}>
        <div className="px-6 py-6 sm:px-7 space-y-6">

          {/* Description */}
          {f.description && (
            <p className="text-slate-600 text-sm leading-relaxed">{f.description}</p>
          )}

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 text-center">
              <Clock size={16} className="text-slate-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-700 tabular-nums leading-none">{f.estimated_minutes}</p>
              <p className="text-xs text-slate-400 mt-1">min</p>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 text-center">
              <Users size={16} className="text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-700 tabular-nums leading-none">{f.fill_count}</p>
              <p className="text-xs text-slate-400 mt-1">responses</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-center">
              <Trophy size={16} className="text-emerald-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-emerald-600 tabular-nums leading-none">+{pointsReward}</p>
              <p className="text-xs text-emerald-500 mt-1">pts for you</p>
            </div>
          </div>

          {/* Criteria */}
          {hasCriteria && (
            <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4">
              <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-3">Who this survey is for</p>
              <div className="flex flex-wrap gap-2">
                {hasRoles && criteria!.roles.map(r => (
                  <span key={r} className="inline-flex items-center gap-1.5 text-xs bg-white text-charcoal border border-charcoal/10 px-2.5 py-1 rounded-full shadow-sm">
                    <UserCheck size={11} /> {roleLabel(r)}
                  </span>
                ))}
                {hasSex && (
                  <span className="text-xs bg-pink-50 text-pink-700 border border-pink-200 px-2.5 py-1 rounded-full capitalize">
                    {criteria!.sex} only
                  </span>
                )}
                {hasAge && (
                  <span className="text-xs bg-violet-50 text-violet-700 border border-violet-200 px-2.5 py-1 rounded-full">
                    Age {criteria!.min_age ?? '?'}–{criteria!.max_age ?? '?'}
                  </span>
                )}
                {hasCountries && criteria!.countries.map(c => (
                  <span key={c} className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
                    <MapPin size={10} /> {c}
                  </span>
                ))}
              </div>
              {hasOther && (
                <p className="mt-3 text-xs text-amber-700 bg-amber-100/60 rounded-xl px-3 py-2 italic">"{criteria!.other}"</p>
              )}
            </div>
          )}

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

          {/* Owner controls */}
          {isOwner && (
            <div className="flex gap-2">
              <Link href={`/forms/${f.id}/edit`}
                className="flex-1 flex items-center justify-center gap-1.5 text-sm bg-charcoal text-white py-2.5 rounded-xl hover:bg-charcoal-deep transition-colors font-medium">
                <Pencil size={14} /> Edit survey
              </Link>
              <DeactivateButton formId={f.id} isActive={isActive} />
            </div>
          )}

          {/* Share */}
          {!isOwner && <ShareButton formId={f.id} />}

          {/* Report */}
          {!isOwner && user && <ReportButton formId={f.id} />}

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
