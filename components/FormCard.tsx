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

  return (
    <Link href={`/forms/${form.id}`} className="block group">
      <div className={`bg-white border rounded-xl px-5 py-4 hover:border-charcoal/30 hover:shadow-md transition-all ${
        highlighted ? 'border-charcoal/20 ring-1 ring-charcoal/10' : 'border-ivory-border'
      }`}>
        {/* Top row: rank + tags */}
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
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
          {highlighted && (
            <span className="text-xs text-charcoal bg-ivory px-2 py-0.5 rounded-full">
              ✦ For you
            </span>
          )}
          {hasCriteria && (
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Users size={10} /> Has criteria
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-slate-800 group-hover:text-charcoal transition-colors leading-snug">
          {form.title}
        </h3>

        {/* Footer row */}
        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Clock size={12} /> {form.estimated_minutes} min
          </span>
          <span className="flex items-center gap-1 text-emerald-600 font-medium">
            <Trophy size={12} className="text-emerald-500" />
            +{10 + form.estimated_minutes * 2} pts
          </span>
          {form.submitter_username ? (
            <Link
              href={`/u/${form.submitter_username}`}
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1 hover:text-charcoal transition-colors ml-auto"
            >
              <BookOpen size={12} />
              @{form.submitter_username}
            </Link>
          ) : (
            <span className="flex items-center gap-1 ml-auto">
              <BookOpen size={12} />
              {form.submitter_name || 'Anonymous'}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
