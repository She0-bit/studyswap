'use client'

import Link from 'next/link'
import { Clock, Users, Trophy, BookOpen, MapPin, UserCheck } from 'lucide-react'
import { roleLabel, type FormFeedItem } from '@/lib/types'

type Props = {
  form: FormFeedItem
  rank: number
  filledByMe?: boolean
  highlighted?: boolean
}

const RANK_COLORS = [
  'from-yellow-400 to-amber-500',
  'from-slate-300 to-slate-400',
  'from-amber-600 to-amber-700',
]

export default function FormCard({ form, rank, filledByMe, highlighted }: Props) {
  const rankGradient = rank <= 3 ? RANK_COLORS[rank - 1] : null
  const criteria = form.sample_criteria

  const hasRoles     = (criteria?.roles?.length ?? 0) > 0
  const hasSex       = criteria?.sex && criteria.sex !== 'any'
  const hasAge       = criteria?.min_age != null || criteria?.max_age != null
  const hasCountries = (criteria?.countries?.length ?? 0) > 0
  const hasOther     = !!criteria?.other

  return (
    <Link href={`/forms/${form.id}`} className="block group">
      <div className={`bg-white border rounded-xl p-5 hover:border-charcoal/30 hover:shadow-md transition-all ${
        highlighted ? 'border-charcoal/20 ring-1 ring-charcoal/10' : 'border-ivory-border'
      }`}>
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">

            {/* Rank + tags row */}
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {rankGradient ? (
                <span className={`bg-gradient-to-r ${rankGradient} text-white text-xs font-bold px-2 py-0.5 rounded-full`}>
                  #{rank}
                </span>
              ) : (
                <span className="text-slate-400 text-xs font-medium">#{rank}</span>
              )}
              {form.specialty && (
                <span className="text-xs text-charcoal bg-ivory px-2 py-0.5 rounded-full">
                  {form.specialty}
                </span>
              )}
              {filledByMe && (
                <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  ✓ Filled
                </span>
              )}
              {highlighted && (
                <span className="text-xs text-charcoal bg-ivory px-2 py-0.5 rounded-full">
                  ✦ For you
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="font-semibold text-slate-800 group-hover:text-charcoal transition-colors">
              {form.title}
            </h3>
            <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{form.description}</p>

            {/* Sample criteria pills */}
            {(hasRoles || hasSex || hasAge || hasCountries || hasOther) && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {hasRoles && criteria!.roles.map(r => (
                  <span key={r} className="inline-flex items-center gap-1 text-xs bg-ivory-dark text-slate-600 px-2 py-0.5 rounded-full">
                    <UserCheck size={10} /> {roleLabel(r)}
                  </span>
                ))}
                {hasSex && (
                  <span className="text-xs bg-ivory-dark text-slate-600 px-2 py-0.5 rounded-full capitalize">
                    {criteria!.sex} only
                  </span>
                )}
                {hasAge && (
                  <span className="text-xs bg-ivory-dark text-slate-600 px-2 py-0.5 rounded-full">
                    Age {criteria!.min_age ?? '?'}–{criteria!.max_age ?? '?'}
                  </span>
                )}
                {hasCountries && (
                  <span className="inline-flex items-center gap-1 text-xs bg-ivory-dark text-slate-600 px-2 py-0.5 rounded-full">
                    <MapPin size={10} /> {criteria!.countries.slice(0, 2).join(', ')}{criteria!.countries.length > 2 ? ` +${criteria!.countries.length - 2}` : ''}
                  </span>
                )}
                {hasOther && (
                  <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                    + specific criteria
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer row */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1"><Clock size={12} /> {form.estimated_minutes} min</span>
          <span className="flex items-center gap-1"><Users size={12} /> {form.fill_count} filled</span>
          <span className="flex items-center gap-1 ml-auto">
            <Trophy size={12} className="text-emerald-500" />
            <span className="text-emerald-600 font-medium">{form.submitter_points} pts</span>
          </span>
          {form.submitter_username ? (
            <Link href={`/u/${form.submitter_username}`} onClick={e => e.stopPropagation()}
              className="flex items-center gap-1 hover:text-charcoal transition-colors">
              <BookOpen size={12} />
              @{form.submitter_username}
              {form.submitter_institution ? ` · ${form.submitter_institution}` : ''}
            </Link>
          ) : (
            <span className="flex items-center gap-1">
              <BookOpen size={12} />
              {form.submitter_name || 'Anonymous'}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
