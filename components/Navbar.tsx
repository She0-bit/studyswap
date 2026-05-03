'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Plus, User, LogOut, Menu, X, Trophy } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser]         = useState<SupabaseUser | null>(null)
  const [points, setPoints]     = useState(0)
  const [username, setUsername] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
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

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const profileHref = username ? `/u/${username}` : '/profile'

  return (
    <nav className="bg-charcoal sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 sm:h-[88px]">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="n=1" className="h-10 sm:h-14 w-auto" />
          <span className="text-ivory text-2xl sm:text-3xl" style={{ fontFamily: 'var(--font-fredoka)' }}>n=1</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-4">
          <Link href="/leaderboard"
            className="flex items-center gap-1.5 text-sm text-ivory/70 hover:text-white px-2 py-1.5 transition-colors">
            <Trophy size={15} /> Leaderboard
          </Link>
          <Link href="/users"
            className="flex items-center gap-1.5 text-sm text-ivory/70 hover:text-white px-2 py-1.5 transition-colors">
            <User size={15} /> Find researchers
          </Link>
          {user ? (
            <>
              <span className="text-sm font-medium text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20">
                {points} pts
              </span>
              <Link href="/submit"
                className="flex items-center gap-1.5 text-sm bg-ivory text-charcoal px-3 py-1.5 rounded-lg hover:bg-ivory-dark transition-colors font-medium">
                <Plus size={15} /> Submit
              </Link>
              <Link href={profileHref}
                className="flex items-center gap-1.5 text-sm text-ivory/80 hover:text-white px-2 py-1.5 transition-colors">
                <User size={15} />
                {username ? <span>@{username}</span> : <span>Profile</span>}
              </Link>
              <Link href="/profile"
                className="text-xs text-ivory/50 hover:text-ivory/80 px-1 py-1.5 transition-colors">
                Settings
              </Link>
              <button onClick={signOut}
                className="flex items-center gap-1.5 text-sm text-ivory/50 hover:text-red-400 px-2 py-1.5 transition-colors">
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <Link href="/auth"
              className="text-sm bg-ivory text-charcoal px-4 py-1.5 rounded-lg hover:bg-ivory-dark transition-colors font-medium">
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile right side */}
        <div className="flex sm:hidden items-center gap-2">
          {user && (
            <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
              {points} pts
            </span>
          )}
          {/* Burger — 44×44 touch target */}
          <button
            className="flex items-center justify-center text-ivory/80 hover:text-white min-h-[44px] min-w-[44px]"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-white/10 bg-charcoal-deep px-5 py-3 flex flex-col">
          {user ? (
            <>
              {username && (
                <Link href={`/u/${username}`} className="flex items-center gap-2 text-sm text-ivory/90 font-medium min-h-[44px]">
                  <User size={15} /> @{username}
                </Link>
              )}
              <Link href="/submit" className="flex items-center gap-2 text-sm text-ivory font-medium min-h-[44px]">
                <Plus size={15} /> Submit survey
              </Link>
              <Link href="/leaderboard" className="flex items-center gap-2 text-sm text-ivory/70 min-h-[44px]">
                <Trophy size={15} /> Leaderboard
              </Link>
              <Link href="/users" className="flex items-center gap-2 text-sm text-ivory/70 min-h-[44px]">
                <User size={15} /> Find researchers
              </Link>
              <Link href="/profile" className="flex items-center gap-2 text-sm text-ivory/70 min-h-[44px]">
                Settings
              </Link>
              <div className="border-t border-white/10 mt-1 pt-1">
                <button onClick={signOut} className="flex items-center gap-2 text-sm text-red-400 min-h-[44px] w-full text-left">
                  <LogOut size={15} /> Sign out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/auth" className="flex items-center text-sm text-ivory font-medium min-h-[44px]">Sign in</Link>
              <Link href="/leaderboard" className="flex items-center gap-2 text-sm text-ivory/70 min-h-[44px]">
                <Trophy size={15} /> Leaderboard
              </Link>
              <Link href="/users" className="flex items-center gap-2 text-sm text-ivory/70 min-h-[44px]">
                <User size={15} /> Find researchers
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
