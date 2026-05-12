import Link from 'next/link'
import { ArrowRight, Clock, Trophy, FileText, Sparkles, Database } from 'lucide-react'
import { getAvatarGradient } from '@/components/Avatar'
import type { FormFeedItem } from '@/lib/types'

type Props = {
  previewForms: FormFeedItem[]
  stats: { users: number; surveys: number; fills: number }
}

export default function LandingView({ previewForms, stats }: Props) {
  const [card1, card2, card3] = previewForms

  return (
    <div className="overflow-x-hidden bg-white">

      {/* ── HERO ── */}
      <section className="relative min-h-[calc(100vh-64px)] flex items-center bg-[#1e1a1d] overflow-hidden">
        
        
        <div className="absolute top-[-10%] left-[-5%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-emerald-500/[0.07] rounded-full blur-[100px] sm:blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-emerald-500/[0.04] rounded-full blur-[100px] sm:blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 py-16 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-emerald-400/70 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-8">
                <span className="w-1 h-1 rounded-full bg-emerald-400/40" />
                Research participation exchange
              </div>

              <h1 className="text-4xl sm:text-7xl font-bold text-white tracking-tight mb-6 leading-[1.1]">
                Be someone's{' '}
                <span className="text-emerald-400" style={{ fontFamily: 'var(--font-chunky)' }}>
                  n=1
                </span>
              </h1>

              <p className="text-white/40 text-base sm:text-lg leading-relaxed mb-10 max-w-md border-l border-white/10 pl-6 font-light">
                Fill surveys for other researchers. Earn points. Watch your own research climb the feed.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth"
                  className="inline-flex items-center justify-center gap-2 bg-white text-[#1e1a1d] px-8 py-4 rounded-xl text-sm font-bold active:scale-[0.98] transition-all shadow-lg shadow-black/20">
                  Get started <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="hidden lg:block relative h-[450px]">
              {card1 && <div className="absolute top-8 right-8 w-72"><MiniSurveyCard form={card1} /></div>}
              {card2 && <div className="absolute top-28 left-4 w-68"><MiniSurveyCard form={card2} /></div>}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──*/}
      <section className="py-24 sm:py-32 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 sm:mb-24">
            <h2 className="text-2xl sm:text-5xl font-bold text-slate-900 tracking-tighter mb-4 italic">Science is a two-way street</h2>
            <p className="text-slate-400 font-light text-sm sm:text-base">The more you give, the more you receive.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-12 sm:gap-16">
            {[
              { icon: FileText, title: 'Contribute', desc: 'Participate in studies from your peers.' },
              { icon: Trophy, title: 'Earn', desc: 'Accumulate points for every completion.' },
              { icon: Sparkles, title: 'Ascend', desc: 'Your points dictate your research visibility.' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <item.icon size={24} className="text-emerald-500" />
                </div>
                <h3 className="font-bold text-slate-800 mb-2 uppercase tracking-widest text-[9px] sm:text-[10px]">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed px-4 sm:px-0">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative py-28 sm:py-40 px-6 text-center bg-[#1e1a1d] overflow-hidden border-t border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] sm:w-[350px] h-[250px] sm:h-[350px] bg-emerald-500/[0.03] rounded-full blur-[80px] sm:blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-6 tracking-tight leading-snug px-4">
            Ready to <br/>
          <span className="text-emerald-400 font-bold text-3xl sm:text-5xl">contribute?</span>
          </h2>
          <p className="text-white/20 mb-10 text-sm sm:text-base font-light px-6">
            Join researchers already exchanging participation on n=1.
          </p>
          <Link href="/auth"
            className="inline-flex items-center gap-2.5 bg-white text-[#1e1a1d] px-10 py-4 rounded-xl text-sm font-bold active:scale-[0.98] transition-all">
            Create account <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  )
}

function MiniSurveyCard({ form }: { form: FormFeedItem }) {
  const pts = 10 + form.estimated_minutes * 2
  return (
    <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl p-6">
      <p className="text-white/80 text-sm font-medium leading-relaxed mb-4 line-clamp-2">{form.title}</p>
      <div className="flex justify-between items-center text-[9px] uppercase tracking-widest">
        <span className="text-emerald-400 font-bold">+{pts} PTS</span>
        <span className="text-white/20">{form.estimated_minutes}M</span>
      </div>
    </div>
  )
}
