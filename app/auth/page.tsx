'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { FlaskConical, CheckCircle, XCircle, Loader2 } from 'lucide-react'

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

  // Username availability
  const [usernameStatus, setUsernameStatus] = useState<'idle'|'checking'|'available'|'taken'|'invalid'>('idle')
  const usernameTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const router       = useRouter()
  const searchParams = useSearchParams()
  const supabase     = createClient()

  // Show friendly message if reset link expired
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
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .ilike('username', username)
        .maybeSingle()
      setUsernameStatus(data ? 'taken' : 'available')
    }, 500)
  }, [username, mode])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    setLoading(true)

    if (mode === 'forgot') {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
      })
      if (resetErr) { setError(resetErr.message) } else {
        setSuccessMsg('Check your email — we sent a password reset link.')
      }
      setLoading(false)
      return
    }

    if (mode === 'signup') {
      if (usernameStatus !== 'available') {
        setError('Please choose a valid, available username.')
        setLoading(false)
        return
      }
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, username: username.toLowerCase() } },
      })
      if (signUpError) { setError(signUpError.message); setLoading(false); return }

      if (data.user) {
        await supabase.from('profiles')
          .update({ institution, name, username: username.toLowerCase() })
          .eq('id', data.user.id)
      }
      setSuccessMsg('Account created! Check your email to confirm, then sign in.')
      setMode('login')
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) { setError(signInError.message); setLoading(false); return }
      // Full navigation so server picks up the new session cookie immediately
      window.location.href = '/'
    }
    setLoading(false)
  }

  function switchMode(m: Mode) {
    setMode(m); setError(''); setSuccessMsg(''); setUsernameStatus('idle')
  }

  const titles: Record<Mode, string> = {
    login:  'Welcome back',
    signup: 'Join StudySwap',
    forgot: 'Reset your password',
  }
  const subtitles: Record<Mode, string> = {
    login:  'Sign in to fill surveys and earn points',
    signup: 'Create an account to start collecting responses',
    forgot: 'Enter your email and we\'ll send a reset link',
  }

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-100 mb-4">
            <FlaskConical className="text-indigo-600" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">{titles[mode]}</h1>
          <p className="text-slate-500 mt-1 text-sm">{subtitles[mode]}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</div>
          )}
          {successMsg && (
            <div className="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3">{successMsg}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Full name</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)}
                    placeholder="Dr. Jane Smith"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Username
                    <span className="text-slate-400 font-normal ml-1 text-xs">— your shareable @handle</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">@</span>
                    <input
                      type="text" required
                      value={username}
                      onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="dr_jane"
                      maxLength={20}
                      className={`w-full border rounded-lg pl-7 pr-9 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        usernameStatus === 'available' ? 'border-emerald-400' :
                        usernameStatus === 'taken' || usernameStatus === 'invalid' ? 'border-red-400' :
                        'border-slate-300'
                      }`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {usernameStatus === 'checking' && <Loader2 size={15} className="animate-spin text-slate-400" />}
                      {usernameStatus === 'available' && <CheckCircle size={15} className="text-emerald-500" />}
                      {(usernameStatus === 'taken' || usernameStatus === 'invalid') && <XCircle size={15} className="text-red-500" />}
                    </div>
                  </div>
                  <p className="text-xs mt-1 text-slate-400">
                    {usernameStatus === 'available' && <span className="text-emerald-600">@{username} is available!</span>}
                    {usernameStatus === 'taken'     && <span className="text-red-500">@{username} is already taken</span>}
                    {usernameStatus === 'invalid'   && <span className="text-red-500">3–20 chars, letters, numbers and _ only</span>}
                    {usernameStatus === 'idle'      && 'Your public profile will be studyswap.app/u/username'}
                    {usernameStatus === 'checking'  && 'Checking availability…'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Institution <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input type="text" value={institution} onChange={e => setInstitution(e.target.value)}
                    placeholder="e.g. King Saud University"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@university.edu"
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-slate-700">Password</label>
                  {mode === 'login' && (
                    <button type="button" onClick={() => switchMode('forgot')}
                      className="text-xs text-indigo-500 hover:underline">
                      Forgot password?
                    </button>
                  )}
                </div>
                <input type="password" required minLength={6} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            )}

            <button type="submit" disabled={loading || (mode === 'signup' && usernameStatus !== 'available')}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? 'Please wait…' :
                mode === 'login'  ? 'Sign in' :
                mode === 'signup' ? 'Create account' :
                'Send reset link'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            {mode === 'forgot' ? (
              <button onClick={() => switchMode('login')} className="text-indigo-600 font-medium hover:underline">
                ← Back to sign in
              </button>
            ) : mode === 'login' ? (
              <>Don't have an account?{' '}
                <button onClick={() => switchMode('signup')} className="text-indigo-600 font-medium hover:underline">Sign up</button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button onClick={() => switchMode('login')} className="text-indigo-600 font-medium hover:underline">Sign in</button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
