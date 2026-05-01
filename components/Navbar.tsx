'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { FlaskConical, Plus, User, LogOut, Menu, X } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser]       = useState<SupabaseUser | null>(null)
  const [points, setPoints]   = useState(0)
  const [username, setUsername] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const router   = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) { setPoints(0); setUsername(null); return }
    supabase.from('profiles').select('points, username').eq('id', user.id).single()
      .then(({ data }) => {
        if (data) { setPoints(data.points); setUsername(data.username) }
      })
  }, [user, pathname])

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const profileHref = username ? `/u/${username}` : '/profile'

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-indigo-600 text-lg">
          <FlaskConical size={20} />
          StudySwap
        </Link>

        {/* Desktop */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                {points} pts
              </span>
              <Link href="/submit"
                className="flex items-center gap-1.5 text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors">
                <Plus size={15} /> Submit
              </Link>
              <Link href={profileHref}
                className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-indigo-600 px-2 py-1.5 transition-colors">
                <User size={15} />
                {username ? <span>@{username}</span> : <span>Profile</span>}
              </Link>
              <Link href="/profile"
                className="text-xs text-slate-400 hover:text-slate-600 px-1 py-1.5 transition-colors">
                Settings
              </Link>
              <button onClick={signOut}
                className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-red-500 px-2 py-1.5 transition-colors">
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <Link href="/auth"
              className="text-sm bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors">
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile burger */}
        <button className="sm:hidden" onClick={() => setMenuOpen(o => !o)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-slate-100 bg-white px-4 py-3 flex flex-col gap-3">
          {user ? (
            <>
              <span className="text-sm font-medium text-emerald-600">{points} points</span>
              {username && (
                <Link href={`/u/${username}`} onClick={() => setMenuOpen(false)} className="text-sm text-slate-600">
                  @{username}
                </Link>
              )}
              <Link href="/submit"    onClick={() => setMenuOpen(false)} className="text-sm text-indigo-600 font-medium">+ Submit survey</Link>
              <Link href="/profile"   onClick={() => setMenuOpen(false)} className="text-sm text-slate-600">Settings</Link>
              <button onClick={signOut} className="text-sm text-left text-red-500">Sign out</button>
            </>
          ) : (
            <Link href="/auth" onClick={() => setMenuOpen(false)} className="text-sm text-indigo-600 font-medium">Sign in</Link>
          )}
        </div>
      )}
    </nav>
  )
}
