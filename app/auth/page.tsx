'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { CheckCircle, XCircle, Loader2, ArrowRight, Trophy, Users, Sparkles } from 'lucide-react'

type Mode = 'login' | 'signup' | 'forgot'

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  )
}

function AuthForm() {
  const [mode, setMode]               = useState<Mode>('login')
  const [name, setName]               = useState('')
  const [username, setUsername]       = useState('')
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [institution, setInstitution] = useState('')
  const [error, setError]             = useState('')
  const [loading, setLoading]         = useState(false)
  const [successMsg, setSuccessMsg]   = useState('')

  const [usernameStatus, setUsernameStatus] = useState<'idle'|'checking'|'available'|'taken'|'invalid'>('idle')
  const usernameTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const router       = useRouter()
  const searchParams = useSearchParams()
  const supabase     = createClient()

  useEffect(() => {
    if (searchParams.get('error') === 'link_expired') {
      setError('That link has expired. Request a new one below.')
      setMode('forgot')
    }
  }, [])

  useEffect(() => {
    if (!username || mode !== 'signup') { setUsernameStatus('idle'); return }
    const valid = /^[a-z0-9_]{3,20}$/.test(username)
    if (!valid) { setUsernameStatus('invalid'); return }
    setUsernameStatus('checking')
    if (usernameTimer.current) clearTimeout(usernameTimer.current)
    usernameTimer.current = setTimeout(async () => {
      const { data } = await supabase.from('profiles').select('id').ilike('username', username).maybeSingle()
      setUsernameStatus(data ? 'taken' : 'available')
    }, 500)
  }, [username, mode])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSuccessMsg(''); setLoading(true)

    if (mode === 'forgot') {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
      })
      if (resetErr) setError(resetErr.message)
      else setSuccessMsg('Check your email — we sent a password reset link.')
      setLoading(false); return
    }

    if (mode === 'signup') {
      if (usernameStatus !== 'available') {
        setError('Please choose a valid, available username.')
        setLoading(false); return
      }
      const { data, error: signUpError } = await supabase.auth.signUp({
        email, password,
        options: { data: { name, username: username.toLowerCase() } },
      })
      if (signUpError) { setError(signUpError.message); setLoading(false); return }
      if (data.user) {
        await supabase.from('profiles').update({ institution, name, username: username.toLowerCase() }).eq('id', data.user.id)
      }
      setSuccessMsg('Account created! Check your email to confirm, then sign in.')
      setMode('login')
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) { setError(signInError.message); setLoading(false); return }
      window.location.href = '/'
    }
    setLoading(false)
  }

  function switchMode(m: Mode) {
    setMode(m); setError(''); setSuccessMsg(''); setUsernameStatus('idle')
  }

  const inputCls = (status?: 'ok' | 'err') =>
    `field ${status === 'err' ? 'error' : status === 'ok' ? 'success' : ''}`

  return (
    <div className="min-h-[calc(100vh-64px)] flex">

      {/* ── Left panel — brand (desktop only) ────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-gradient-to-br from-charcoal to-charcoal-deep p-10 relative overflow-hidden">
        {/* dot grid */}
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '22px 22px' }} />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-light.png" alt="n=1" className="h-8 w-auto" />
            <span className="text-white text-2xl leading-none" style={{ fontFamily: 'var(--font-fredoka)' }}>n=1</span>
          </div>

          <h2 className="text-3xl font-bold text-white leading-tight mb-3">
            Science runs on participation.
          </h2>
          <p className="text-white/50 text-sm leading-relaxed mb-10">
            Fill surveys from other researchers. Earn points. Your rank determines how many responses your own research collects.
          </p>

          {/* Feature list */}
          {[
            { icon: Trophy,   text: 'Earn points for every survey you complete' },
            { icon: Sparkles, text: 'Higher rank = more eyes on your research' },
            { icon: Users,    text: 'Follow researchers in your field' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-start gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                <Icon size={15} className="text-white/70" />
              </div>
              <p className="text-white/60 text-sm leading-snug">{text}</p>
            </div>
          ))}
        </div>

        {/* Bottom tag */}
        <div className="relative z-10">
          <p className="text-white/20 text-xs">n-eq1.com · Research participation exchange</p>
        </div>
      </div>

      {/* ── Right panel — form ────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-surface">
        <div className="w-full max-w-sm animate-fade-slide-up">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-dark.png" alt="n=1" className="h-7 w-auto" />
            <span className="text-charcoal text-xl" style={{ fontFamily: 'var(--font-fredoka)' }}>n=1</span>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              {mode === 'login'  ? 'Welcome back' :
               mode === 'signup' ? 'Create your account' :
               'Reset password'}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {mode === 'login'  ? 'Sign in to fill surveys and earn points' :
               mode === 'signup' ? 'Join the research participation network' :
               'Enter your email and we\'ll send a reset link'}
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-5 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-start gap-2">
              <XCircle size={15} className="shrink-0 mt-0.5 text-red-400" />
              {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-5 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex items-start gap-2">
              <CheckCircle size={15} className="shrink-0 mt-0.5 text-emerald-400" />
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="field-label">Full name</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)}
                    placeholder="Dr. Jane Smith" className="field" />
                </div>

                <div>
                  <label className="field-label">
                    Username
                    <span className="text-slate-400 font-normal ml-1">— your @handle</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium select-none">@</span>
                    <input
                      type="text" required
                      value={username}
                      onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="dr_jane"
                      maxLength={20}
                      className={`field pl-8 ${
                        usernameStatus === 'available' ? 'success' :
                        usernameStatus === 'taken' || usernameStatus === 'invalid' ? 'error' : ''
                      }`}
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                      {usernameStatus === 'checking'  && <Loader2 size={15} className="animate-spin text-slate-400" />}
                      {usernameStatus === 'available' && <CheckCircle size={15} className="text-emerald-500" />}
                      {(usernameStatus === 'taken' || usernameStatus === 'invalid') && <XCircle size={15} className="text-red-400" />}
                    </div>
                  </div>
                  <p className="text-xs mt-1.5 text-slate-400 tabular-nums">
                    {usernameStatus === 'available' && <span className="text-emerald-600 font-medium">@{username} is available!</span>}
                    {usernameStatus === 'taken'     && <span className="text-red-500">@{username} is already taken</span>}
                    {usernameStatus === 'invalid'   && <span className="text-red-500">3–20 chars, letters, numbers and _ only</span>}
                    {usernameStatus === 'idle'      && 'Your public profile: n-eq1.com/u/username'}
                    {usernameStatus === 'checking'  && 'Checking…'}
                  </p>
                </div>

                <div>
                  <label className="field-label">
                    Institution <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input type="text" value={institution} onChange={e => setInstitution(e.target.value)}
                    placeholder="e.g. King Saud University" className="field" />
                </div>
              </>
            )}

            <div>
              <label className="field-label">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@university.edu" className="field" />
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="field-label">Password</label>
                <input type="password" required minLength={6} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters"
                  className="field" />
                {mode === 'login' && (
                  <button type="button" onClick={() => switchMode('forgot')}
                    className="mt-1.5 text-xs text-slate-500 hover:text-charcoal transition-colors">
                    Forgot password?
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (mode === 'signup' && usernameStatus !== 'available')}
              className="w-full flex items-center justify-center gap-2 bg-charcoal text-white py-3 rounded-xl text-sm font-semibold hover:bg-charcoal-deep active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-sm"
            >
              {loading ? (
                <><Loader2 size={15} className="animate-spin" /> Please wait…</>
              ) : mode === 'login'  ? <><ArrowRight size={15} /> Sign in</> :
                mode === 'signup' ? <><ArrowRight size={15} /> Create account</> :
                'Send reset link'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            {mode === 'forgot' ? (
              <button onClick={() => switchMode('login')} className="text-charcoal font-medium hover:underline">
                ← Back to sign in
              </button>
            ) : mode === 'login' ? (
              <>Don't have an account?{' '}
                <button onClick={() => switchMode('signup')} className="text-charcoal font-semibold hover:underline">Sign up free</button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button onClick={() => switchMode('login')} className="text-charcoal font-semibold hover:underline">Sign in</button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
