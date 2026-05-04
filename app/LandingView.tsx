import Link from 'next/link'
import { ArrowRight, Clock, Trophy, FileText, Users, Sparkles, Star, CheckCircle } from 'lucide-react'
import { getAvatarGradient } from '@/components/Avatar'
import type { FormFeedItem } from '@/lib/types'

type Props = {
  previewForms: FormFeedItem[]
  stats: { users: number; surveys: number; fills: number }
}

export default function LandingView({ previewForms, stats }: Props) {
  const [card1, card2, card3] = previewForms

  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[calc(100vh-64px)] flex items-center bg-gradient-to-br from-charcoal via-[#1e1a1d] to-charcoal-deep overflow-hidden">

        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        {/* Glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 py-16 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left — copy */}
            <div className="animate-fade-slide-up">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 text-xs font-medium text-white/60 bg-white/8 border border-white/10 px-3.5 py-1.5 rounded-full mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                Research participation exchange
              </div>

              {/* Headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6">
                Be someone's{' '}
                <span
                  className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-400"
                  style={{ fontFamily: 'var(--font-chunky)' }}
                >
                  n=1
                </span>
              </h1>

              <p className="text-white/55 text-lg sm:text-xl leading-relaxed mb-10 max-w-md">
                Fill surveys for other researchers. Earn points. Watch your own research climb the feed.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 mb-12">
                <Link href="/auth"
                  className="inline-flex items-center justify-center gap-2 bg-white text-charcoal px-7 py-3.5 rounded-xl text-sm font-bold hover:bg-white/90 active:scale-[0.98] transition-all shadow-lg shadow-black/20 min-h-[48px]">
                  Get started free <ArrowRight size={16} />
                </Link>
                <a href="#surveys"
                  className="inline-flex items-center justify-center gap-2 text-white/60 hover:text-white border border-white/15 hover:border-white/30 px-7 py-3.5 rounded-xl text-sm font-medium transition-all min-h-[48px]">
                  Browse live surveys ↓
                </a>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 sm:gap-8">
                {[
                  { value: stats.users,   label: 'Researchers' },
                  { value: stats.surveys, label: 'Surveys' },
                  { value: stats.fills,   label: 'Responses' },
                ].map(s => (
                  <div key={s.label}>
                    <p className="text-2xl font-bold text-white tabular-nums">{s.value}+</p>
                    <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — floating survey card stack */}
            <div className="hidden lg:flex items-center justify-center relative h-[480px]"
              style={{ animationDelay: '200ms' }}>

              {card1 && (
                <div className="absolute top-8 right-8 w-72 animate-float3" style={{ animationDelay: '0ms' }}>
                  <MiniSurveyCard form={card1} />
                </div>
              )}
              {card2 && (
                <div className="absolute top-28 left-4 w-68 animate-float" style={{ animationDelay: '800ms' }}>
                  <MiniSurveyCard form={card2} />
                </div>
              )}
              {card3 && (
                <div className="absolute bottom-12 right-16 w-64 animate-float2" style={{ animationDelay: '400ms' }}>
                  <MiniSurveyCard form={card3} />
                </div>
              )}

              {/* Decorative rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 rounded-full border border-white/[0.04]" />
                <div className="absolute w-96 h-96 rounded-full border border-white/[0.03]" />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/30 animate-bounce">
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-white/30" />
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section className="bg-white py-20 sm:py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-emerald-600 tracking-widest uppercase mb-3">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Science is a two-way street
            </h2>
            <p className="text-slate-500 mt-3 max-w-md mx-auto">
              The more you give, the more you receive. Points you earn push your surveys to the top.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8 relative">
            {/* Connector line (desktop only) */}
            <div className="hidden sm:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

            {[
              {
                step: '01', icon: FileText, color: 'text-violet-600', bg: 'bg-violet-50 border-violet-100',
                title: 'Fill surveys',
                desc: 'Browse open research surveys and participate in studies from researchers in your field.',
              },
              {
                step: '02', icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100',
                title: 'Earn points',
                desc: 'Every survey you complete earns points. Longer surveys = more points.',
              },
              {
                step: '03', icon: Sparkles, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100',
                title: 'Get responses',
                desc: 'Your points rank determines where your surveys appear in the feed. More points = more visibility.',
              },
            ].map(({ step, icon: Icon, color, bg, title, desc }) => (
              <div key={step} className="relative flex flex-col items-center text-center group">
                <div className={`w-20 h-20 rounded-2xl ${bg} border flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105`}>
                  <Icon size={28} className={color} />
                </div>
                <p className="text-[11px] font-bold text-slate-300 tracking-widest uppercase mb-2">{step}</p>
                <h3 className="font-bold text-slate-800 text-lg mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY N=1 ──────────────────────────────────────────────── */}
      <section className="bg-slate-50 py-20 sm:py-28 px-6 border-y border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-6">
            <FeatureCard
              icon={<Users size={22} className="text-blue-500" />}
              bg="bg-blue-50 border-blue-100"
              title="Built for researchers"
              desc="Whether you're a student, clinician, or academic — if you run surveys, this is for you. Submit your study, set your target population, and let the community help."
              bullets={['Target specific roles, countries, or demographics', 'Share with referral links for bonus points', 'Track your fill count in real time']}
            />
            <FeatureCard
              icon={<Star size={22} className="text-amber-500" />}
              bg="bg-amber-50 border-amber-100"
              title="Fair by design"
              desc="Your feed rank is determined entirely by points earned — no ads, no boosting. The more you contribute, the more visible your research becomes."
              bullets={['Dense ranking: tied scores = same rank', 'Monthly leaderboard resets for fresh starts', 'Referral system rewards sharing']}
            />
          </div>
        </div>
      </section>

      {/* ── LIVE SURVEYS PREVIEW ─────────────────────────────────── */}
      <section id="surveys" className="bg-white py-20 sm:py-28 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider text-[11px]">Live now</p>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Open surveys</h2>
            </div>
            <Link href="/auth"
              className="text-sm font-semibold text-charcoal hover:underline hidden sm:block">
              See all →
            </Link>
          </div>

          <div className="space-y-3 mb-8">
            {previewForms.slice(0, 4).map((form, i) => (
              <PreviewCard key={form.id} form={form} index={i} />
            ))}
          </div>

          <div className="text-center">
            <Link href="/auth"
              className="inline-flex items-center gap-2 bg-charcoal text-white px-8 py-3.5 rounded-xl text-sm font-bold hover:bg-charcoal-deep active:scale-[0.98] transition-all shadow-sm">
              Join to fill surveys <ArrowRight size={15} />
            </Link>
            <p className="text-slate-400 text-xs mt-3">Free forever · No credit card required</p>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-charcoal to-charcoal-deep py-24 sm:py-32 px-6 text-center">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-transparent to-white/20" />

        <div className="relative z-10 max-w-lg mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-white/50 bg-white/8 border border-white/10 px-3.5 py-1.5 rounded-full mb-8">
            <CheckCircle size={12} className="text-emerald-400" />
            Free to join · No credit card
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4 leading-tight tracking-tight">
            Ready to contribute to science?
          </h2>
          <p className="text-white/50 mb-10 text-lg">
            Join researchers already exchanging participation on n=1.
          </p>
          <Link href="/auth"
            className="inline-flex items-center gap-2.5 bg-white text-charcoal px-8 py-4 rounded-xl text-base font-bold hover:bg-white/90 active:scale-[0.98] transition-all shadow-xl shadow-black/20">
            Create your free account <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  )
}

/* ── Sub-components ─────────────────────────────────────────────── */

function MiniSurveyCard({ form }: { form: FormFeedItem }) {
  const pts = 10 + form.estimated_minutes * 2
  const authorLabel = form.submitter_username || form.submitter_name || 'Researcher'
  const gradient = getAvatarGradient(authorLabel)

  return (
    <div className="bg-white/[0.07] backdrop-blur-sm border border-white/10 rounded-2xl p-4 shadow-2xl">
      {form.specialty && (
        <span className="text-[10px] font-semibold text-white/50 bg-white/10 px-2 py-0.5 rounded-full mb-2.5 inline-block">
          {form.specialty}
        </span>
      )}
      <p className="text-white text-sm font-semibold leading-snug line-clamp-2 mb-3">
        {form.title}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white/40 text-xs">
          <Clock size={10} /> {form.estimated_minutes} min
          <span className="text-emerald-400 font-semibold">+{pts} pts</span>
        </div>
        <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-[10px] font-bold text-white shrink-0`}>
          {authorLabel[0].toUpperCase()}
        </div>
      </div>
    </div>
  )
}

function PreviewCard({ form, index }: { form: FormFeedItem; index: number }) {
  const pts = 10 + form.estimated_minutes * 2
  const authorLabel = form.submitter_username || form.submitter_name || 'Researcher'
  const gradient = getAvatarGradient(authorLabel)

  return (
    <div
      className="section-card px-5 py-4 flex items-center gap-4 animate-fade-slide-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex-1 min-w-0">
        {form.specialty && (
          <span className="text-[11px] font-medium text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full mr-2">
            {form.specialty}
          </span>
        )}
        <p className="font-semibold text-slate-800 text-sm leading-snug mt-1.5 line-clamp-1">{form.title}</p>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
          <span className="flex items-center gap-1"><Clock size={10} />{form.estimated_minutes} min</span>
          <span className="flex items-center gap-1 text-emerald-600 font-semibold"><Trophy size={10} />+{pts} pts</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-[10px] font-bold text-white`}>
          {authorLabel[0].toUpperCase()}
        </div>
        <span className="text-xs text-slate-400 hidden sm:block">@{form.submitter_username}</span>
      </div>
    </div>
  )
}

function FeatureCard({
  icon, bg, title, desc, bullets,
}: {
  icon: React.ReactNode
  bg: string
  title: string
  desc: string
  bullets: string[]
}) {
  return (
    <div className="section-card p-7">
      <div className={`w-12 h-12 rounded-2xl ${bg} border flex items-center justify-center mb-5`}>
        {icon}
      </div>
      <h3 className="font-bold text-slate-800 text-lg mb-2">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed mb-5">{desc}</p>
      <ul className="space-y-2">
        {bullets.map(b => (
          <li key={b} className="flex items-start gap-2 text-sm text-slate-600">
            <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />
            {b}
          </li>
        ))}
      </ul>
    </div>
  )
}
