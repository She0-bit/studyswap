'use client'

import Link from 'next/link'
import { Clock, Trophy, BookOpen, Users } from 'lucide-react'
import type { FormFeedItem } from '@/lib/types'

type Props = {
  form: FormFeedItem
  rank: number
  highlighted?: boolean
}

const RANK_COLORS = [
  'from-yellow-400 to-amber-500',
  'from-slate-300 to-slate-400',
  'from-amber-600 to-amber-700',
]

export default function FormCard({ form, rank, highlighted }: Props) {
  const rankGradient = rank <= 3 ? RANK_COLORS[rank - 1] : null
  const criteria     = form.sample_criteria
  const hasCriteria  = !!(
    (criteria?.roles?.length ?? 0) > 0 ||
    (criteria?.sex && criteria.sex !== 'any') ||
    criteria?.min_age != null ||
    criteria?.max_age != null ||
    (criteria?.countries?.length ?? 0) > 0 ||
    criteria?.other
  )
  const pts = 10 + form.estimated_minutes * 2

  return (
    <Link href={`/forms/${form.id}`} className="block group card-press">
      <div className={`bg-white rounded-2xl px-4 py-4 sm:px-5 sm:py-4 border transition-all duration-200
        hover:shadow-md hover:border-charcoal/25
        ${highlighted
          ? 'border-charcoal/20 ring-1 ring-charcoal/10 bg-white'
          : 'border-ivory-border'
        }`
      }>
        {/* Tags row */}
        <div className="flex items-center gap-2 mb-2 min-w-0">
          {/* Rank */}
          {rankGradient ? (
            <span className={`shrink-0 bg-gradient-to-r ${rankGradient} text-white text-xs font-bold px-2.5 py-0.5 rounded-full`}>
              #{rank}
            </span>
          ) : (
            <span className="shrink-0 text-xs font-medium text-slate-400 tabular-nums w-7">#{rank}</span>
          )}

          {/* Specialty */}
          {form.specialty && (
            <span className="text-xs text-charcoal/80 bg-ivory border border-ivory-border px-2.5 py-0.5 rounded-full truncate max-w-[160px]">
              {form.specialty}
            </span>
          )}

          {highlighted && (
            <span className="shrink-0 text-xs font-medium text-charcoal bg-charcoal/8 px-2.5 py-0.5 rounded-full">
              ✦ For you
            </span>
          )}

          {/* Criteria badge — pushed to far right */}
          {hasCriteria && (
            <span className="ml-auto shrink-0 text-xs text-slate-400 flex items-center gap-1">
              <Users size={10} />
              <span className="hidden sm:inline">Criteria</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-slate-800 group-hover:text-charcoal transition-colors leading-snug text-[15px] sm:text-base line-clamp-2">
          {form.title}
        </h3>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between gap-2">
          {/* Left: time + points */}
          <div className="flex items-center gap-3 text-xs text-slate-400 min-w-0">
            <span className="flex items-center gap-1 shrink-0">
              <Clock size={11} />
              {form.estimated_minutes} min
            </span>
            <span className="flex items-center gap-1 shrink-0 font-semibold text-emerald-600">
              <Trophy size={11} className="text-emerald-500" />
              +{pts} pts
            </span>
          </div>

          {/* Right: author */}
          {form.submitter_username ? (
            <Link
              href={`/u/${form.submitter_username}`}
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-charcoal transition-colors shrink-0 min-h-[32px]"
            >
              <BookOpen size={11} />
              <span className="max-w-[100px] truncate">@{form.submitter_username}</span>
            </Link>
          ) : (
            <span className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
              <BookOpen size={11} />
              <span className="max-w-[100px] truncate">{form.submitter_name || 'Anonymous'}</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
