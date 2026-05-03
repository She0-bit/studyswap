'use client'

import Link from 'next/link'
import { Clock, Trophy, Users } from 'lucide-react'
import type { FormFeedItem } from '@/lib/types'
import Avatar, { getAvatarGradient } from '@/components/Avatar'

type Props = {
  form: FormFeedItem
  rank: number
  highlighted?: boolean
}

export default function FormCard({ form, rank, highlighted }: Props) {
  const criteria    = form.sample_criteria
  const hasCriteria = !!(
    (criteria?.roles?.length ?? 0) > 0 ||
    (criteria?.sex && criteria.sex !== 'any') ||
    criteria?.min_age != null ||
    criteria?.max_age != null ||
    (criteria?.countries?.length ?? 0) > 0 ||
    criteria?.other
  )
  const pts          = 10 + form.estimated_minutes * 2
  const authorLabel  = form.submitter_username || form.submitter_name || 'Anonymous'
  const authorHref   = form.submitter_username ? `/u/${form.submitter_username}` : null

  const rankAccent =
    rank === 1 ? 'border-l-4 border-l-amber-400' :
    rank === 2 ? 'border-l-4 border-l-slate-400' :
    rank === 3 ? 'border-l-4 border-l-amber-600' : ''

  return (
    <Link href={`/forms/${form.id}`} className="block group card-press">
      <div className={`
        bg-white rounded-2xl px-4 py-4 sm:px-5 border border-slate-100
        shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200
        ${rankAccent}
        ${highlighted ? 'ring-2 ring-charcoal/10 border-charcoal/15' : ''}
      `}>

        {/* Tags */}
        <div className="flex items-center gap-2 mb-2.5 min-w-0">
          {rank <= 3 ? (
            <span className={`shrink-0 text-xs font-bold tabular-nums px-2 py-0.5 rounded-full ${
              rank === 1 ? 'text-amber-700 bg-amber-50' :
              rank === 2 ? 'text-slate-600 bg-slate-100' :
                           'text-amber-800 bg-amber-50/80'
            }`}>#{rank}</span>
          ) : (
            <span className="shrink-0 text-xs text-slate-400 font-medium tabular-nums">#{rank}</span>
          )}

          {form.specialty && (
            <span className="truncate max-w-[150px] text-xs font-medium text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-0.5 rounded-full">
              {form.specialty}
            </span>
          )}
          {highlighted && (
            <span className="shrink-0 text-xs font-semibold text-charcoal bg-charcoal/6 px-2.5 py-0.5 rounded-full">
              ✦ For you
            </span>
          )}
          {hasCriteria && (
            <span className="ml-auto shrink-0 flex items-center gap-1 text-xs text-slate-400">
              <Users size={10} /><span className="hidden sm:inline">Criteria</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-slate-900 group-hover:text-charcoal transition-colors text-[15px] sm:text-base leading-snug line-clamp-2 mb-3">
          {form.title}
        </h3>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2">
          {/* Left: time + pts */}
          <div className="flex items-center gap-2.5 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock size={11} />{form.estimated_minutes} min
            </span>
            <span className="w-px h-3 bg-slate-200 shrink-0" />
            <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
              <Trophy size={11} />+{pts} pts
            </span>
          </div>

          {/* Right: avatar + author */}
          {authorHref ? (
            <Link
              href={authorHref}
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 transition-colors shrink-0 min-h-[32px]"
            >
              <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${getAvatarGradient(authorLabel)} flex items-center justify-center text-[9px] font-bold text-white shrink-0`}>
                {authorLabel[0].toUpperCase()}
              </div>
              <span className="max-w-[100px] truncate">@{form.submitter_username}</span>
            </Link>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
              <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${getAvatarGradient(authorLabel)} flex items-center justify-center text-[9px] font-bold text-white shrink-0`}>
                {authorLabel[0].toUpperCase()}
              </div>
              {authorLabel}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
