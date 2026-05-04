'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Plus, LogOut, Menu, X, Trophy, Users, Settings } from 'lucide-react'
import { getAvatarGradient } from '@/components/Avatar'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser]         = useState<SupabaseUser | null>(null)
  const [points, setPoints]     = useState(0)
  const [username, setUsername] = useState<string | null>(null)
  const [name, setName]         = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const supabase = createClient()

  // Scroll-aware frosted glass
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) { setPoints(0); setUsername(null); setName(null); return }
    supabase.from('profiles').select('points, username, name').eq('id', user.id).single()
      .then(({ data }) => {
        if (data) { setPoints(data.points); setUsername(data.username); setName(data.name) }
      })
  }, [user, pathname])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const profileHref   = username ? `/u/${username}` : '/profile'
  const avatarSeed    = name || username || 'U'
  const avatarInitial = avatarSeed[0]?.toUpperCase() ?? 'U'
  const gradient      = getAvatarGradient(avatarSeed)

  const isActive = (href: string) => pathname === href

  return (
    <>
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-charcoal/95 backdrop-blur-md border-b border-white/[0.08] shadow-lg shadow-black/10'
          : 'bg-charcoal border-b border-white/[0.06]'
      }`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-light.png" alt="n=1" className="h-8 w-auto transition-transform duration-200 group-hover:scale-105" />
            <span className="text-white text-[22px] leading-none tracking-tight" style={{ fontFamily: 'var(--font-fredoka)' }}>n=1</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-0.5">

            <Link href="/leaderboard" className={`relative flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg transition-all duration-200 ${
              isActive('/leaderboard')
                ? 'text-white bg-white/10'
                : 'text-white/55 hover:text-white hover:bg-white/8'
            }`}>
              <Trophy size={14} />
              Leaderboard
              {isActive('/leaderboard') && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400" />
              )}
            </Link>

            <Link href="/users" className={`relative flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg transition-all duration-200 ${
              isActive('/users')
                ? 'text-white bg-white/10'
                : 'text-white/55 hover:text-white hover:bg-white/8'
            }`}>
              <Users size={14} />
              Researchers
              {isActive('/users') && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400" />
              )}
            </Link>

            {/* Divider */}
            <span className="mx-2 h-4 w-px bg-white/10" />

            {user ? (
              <>
                {/* Points pill */}
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full tabular-nums">
                  {points} pts
                </span>

                {/* Submit */}
                <Link href="/submit"
                  className="flex items-center gap-1.5 text-sm bg-white text-charcoal px-3.5 py-2 rounded-lg hover:bg-white/90 active:scale-95 transition-all duration-150 font-semibold ml-1.5 shadow-sm">
                  <Plus size={14} /> Submit
                </Link>

                {/* Avatar + username */}
                <Link href={profileHref}
                  className="flex items-center gap-2 text-sm text-white/60 hover:text-white hover:bg-white/8 px-2.5 py-1.5 rounded-lg transition-all duration-200 ml-1 group">
                  <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-[11px] font-bold text-white shrink-0 ring-2 ring-white/0 group-hover:ring-white/20 transition-all duration-200`}>
                    {avatarInitial}
                  </div>
                  <span className="max-w-[80px] truncate text-sm">
                    {username ? `@${username}` : 'Profile'}
                  </span>
                </Link>

                {/* Settings */}
                <Link href="/profile"
                  className="text-white/35 hover:text-white/80 hover:bg-white/8 p-2 rounded-lg transition-all duration-200"
                  title="Settings">
                  <Settings size={14} />
                </Link>

                {/* Sign out */}
                <button onClick={signOut}
                  className="text-white/25 hover:text-red-400 hover:bg-red-400/8 p-2 rounded-lg transition-all duration-200 ml-0.5"
                  title="Sign out">
                  <LogOut size={14} />
                </button>
              </>
            ) : (
              <Link href="/auth"
                className="text-sm bg-white text-charcoal px-4 py-2 rounded-lg hover:bg-white/90 active:scale-95 transition-all duration-150 font-semibold ml-1 shadow-sm">
                Sign in
              </Link>
            )}
          </div>

          {/* Mobile right */}
          <div className="flex sm:hidden items-center gap-2.5">
            {user && (
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full tabular-nums">
                {points} pts
              </span>
            )}
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="flex items-center justify-center text-white/70 hover:text-white hover:bg-white/8 w-10 h-10 rounded-lg transition-all duration-200"
            >
              <span className={`transition-all duration-200 ${menuOpen ? 'rotate-90 opacity-0 absolute' : 'rotate-0 opacity-100'}`}>
                <Menu size={20} />
              </span>
              <span className={`transition-all duration-200 ${menuOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0 absolute'}`}>
                <X size={20} />
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 sm:hidden"
          onClick={() => setMenuOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />

          {/* Drawer panel */}
          <div
            className="absolute top-16 left-0 right-0 bg-charcoal border-b border-white/[0.08] animate-slide-down shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col gap-0.5">
              {user ? (
                <>
                  {/* User identity */}
                  <Link href={profileHref} className="flex items-center gap-3 py-3 mb-1 border-b border-white/[0.06]" onClick={() => setMenuOpen(false)}>
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-base font-bold text-white shrink-0`}>
                      {avatarInitial}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{name || (username ? `@${username}` : 'My profile')}</p>
                      {username && <p className="text-xs text-white/40 mt-0.5">@{username}</p>}
                    </div>
                    <span className="ml-auto text-white/20 text-xs">View profile →</span>
                  </Link>

                  <MobileLink href="/submit" icon={<Plus size={15} className="text-white/50" />} label="Submit survey" onClick={() => setMenuOpen(false)} />
                  <MobileLink href="/leaderboard" icon={<Trophy size={15} className="text-white/40" />} label="Leaderboard" active={isActive('/leaderboard')} onClick={() => setMenuOpen(false)} />
                  <MobileLink href="/users" icon={<Users size={15} className="text-white/40" />} label="Find researchers" active={isActive('/users')} onClick={() => setMenuOpen(false)} />
                  <MobileLink href="/profile" icon={<Settings size={15} className="text-white/40" />} label="Settings" onClick={() => setMenuOpen(false)} />

                  <div className="border-t border-white/[0.06] mt-2 pt-2">
                    <button onClick={signOut}
                      className="flex items-center gap-3 text-sm text-red-400 min-h-[44px] w-full px-2 rounded-lg hover:bg-red-400/8 transition-colors">
                      <LogOut size={15} /> Sign out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <MobileLink href="/auth" label="Sign in" bold onClick={() => setMenuOpen(false)} />
                  <MobileLink href="/leaderboard" icon={<Trophy size={15} className="text-white/40" />} label="Leaderboard" active={isActive('/leaderboard')} onClick={() => setMenuOpen(false)} />
                  <MobileLink href="/users" icon={<Users size={15} className="text-white/40" />} label="Find researchers" active={isActive('/users')} onClick={() => setMenuOpen(false)} />
                </>
              )}
            </div>
            {/* Safe area spacer */}
            <div className="h-[env(safe-area-inset-bottom,0px)]" />
          </div>
        </div>
      )}
    </>
  )
}

function MobileLink({
  href, icon, label, active, bold, onClick,
}: {
  href: string
  icon?: React.ReactNode
  label: string
  active?: boolean
  bold?: boolean
  onClick?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 text-sm min-h-[44px] px-2 rounded-lg transition-colors ${
        active
          ? 'text-white bg-white/8'
          : bold
          ? 'text-white font-semibold hover:bg-white/8'
          : 'text-white/65 hover:text-white hover:bg-white/8'
      }`}
    >
      {icon}
      {label}
      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />}
    </Link>
  )
}
