import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import FillButton from './FillButton'
import { Clock, Users, Trophy, BookOpen, ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import type { FormFeedItem } from '@/lib/types'

export const revalidate = 0

export default async function FormDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: form } = await supabase
    .from('forms_feed')
    .select('*')
    .eq('id', id)
    .single()

  if (!form) notFound()

  const f = form as FormFeedItem

  // Check if current user has already filled this
  let alreadyFilled = false
  let isOwner = false
  if (user) {
    isOwner = user.id === f.user_id
    const { data: fill } = await supabase
      .from('fills')
      .select('id')
      .eq('user_id', user.id)
      .eq('form_id', id)
      .maybeSingle()
    alreadyFilled = !!fill
  }

  const pointsReward = 10 + f.estimated_minutes * 2

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors">
        <ArrowLeft size={15} /> Back to feed
      </Link>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 px-7 py-8 text-white">
          {f.specialty && (
            <span className="text-xs font-medium bg-white/20 px-2.5 py-1 rounded-full mb-3 inline-block">
              {f.specialty}
            </span>
          )}
          <h1 className="text-xl font-bold leading-snug">{f.title}</h1>
          <div className="mt-3 flex items-center gap-1.5 text-indigo-200 text-sm">
            <BookOpen size={14} />
            <span>{f.submitter_name || 'Anonymous'}</span>
            {f.submitter_institution && <span>· {f.submitter_institution}</span>}
          </div>
        </div>

        <div className="px-7 py-6 space-y-6">
          {/* Description */}
          <p className="text-slate-600 text-sm leading-relaxed">{f.description}</p>

          {/* Meta */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-xl p-3.5 text-center">
              <Clock size={16} className="text-indigo-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-slate-700">{f.estimated_minutes}</p>
              <p className="text-xs text-slate-400">min</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3.5 text-center">
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

          {/* CTA */}
          <FillButton
            formId={f.id}
            formLink={f.link}
            estimatedMinutes={f.estimated_minutes}
            pointsReward={pointsReward}
            isLoggedIn={!!user}
            isOwner={isOwner}
            alreadyFilled={alreadyFilled}
          />

          {/* Direct link */}
          <a
            href={f.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ExternalLink size={12} /> Open form in new tab
          </a>
        </div>
      </div>
    </div>
  )
}
