import Link from 'next/link'
import { Clock, Users, Trophy, BookOpen } from 'lucide-react'
import type { FormFeedItem } from '@/lib/types'

type Props = {
  form: FormFeedItem
  rank: number
  filledByMe?: boolean
}

const RANK_COLORS = [
  'from-yellow-400 to-amber-500',
  'from-slate-300 to-slate-400',
  'from-amber-600 to-amber-700',
]

export default function FormCard({ form, rank, filledByMe }: Props) {
  const rankGradient = rank <= 3 ? RANK_COLORS[rank - 1] : null

  return (
    <Link href={`/forms/${form.id}`} className="block group">
      <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {rankGradient ? (
                <span className={`bg-gradient-to-r ${rankGradient} text-white text-xs font-bold px-2 py-0.5 rounded-full`}>
                  #{rank}
                </span>
              ) : (
                <span className="text-slate-400 text-xs font-medium">#{rank}</span>
              )}
              {form.specialty && (
                <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  {form.specialty}
                </span>
              )}
              {filledByMe && (
                <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  ✓ Filled
                </span>
              )}
            </div>

            <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
              {form.title}
            </h3>
            <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{form.description}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Clock size={12} /> {form.estimated_minutes} min
          </span>
          <span className="flex items-center gap-1">
            <Users size={12} /> {form.fill_count} filled
          </span>
          <span className="flex items-center gap-1 ml-auto">
            <Trophy size={12} className="text-emerald-500" />
            <span className="text-emerald-600 font-medium">{form.submitter_points} pts</span>
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <BookOpen size={12} />
            {form.submitter_name || 'Anonymous'}
            {form.submitter_institution ? ` · ${form.submitter_institution}` : ''}
          </span>
        </div>
      </div>
    </Link>
  )
}
