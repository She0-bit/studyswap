'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { SPECIALTY_GROUPS } from '@/lib/types'
import { useState, useEffect } from 'react'

export default function FeedFilters() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const currentQ         = searchParams.get('q') ?? ''
  const currentSpecialty = searchParams.get('specialty') ?? ''

  // Local state for the search input only (so typing doesn't navigate on every keystroke)
  const [searchVal, setSearchVal] = useState(currentQ)

  // Keep search input in sync when URL changes (e.g. user clicks Clear)
  useEffect(() => {
    setSearchVal(currentQ)
  }, [currentQ])

  function navigate(newQ: string, newSpec: string) {
    const params = new URLSearchParams()
    if (newQ.trim()) params.set('q', newQ.trim())
    if (newSpec)     params.set('specialty', newSpec)
    router.push(`/?${params.toString()}`)
  }

  function clearAll() {
    setSearchVal('')
    router.push('/')
  }

  const hasFilters = !!(currentQ || currentSpecialty)

  return (
    <div id="feed" className="mb-5 flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="flex-1 flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && navigate(searchVal, currentSpecialty)}
            placeholder="Search by title…"
            className="w-full pl-9 pr-4 py-2.5 border border-ivory-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-charcoal"
          />
        </div>
        {/* Search button — essential on mobile where Enter doesn't always submit */}
        <button
          type="button"
          onClick={() => navigate(searchVal, currentSpecialty)}
          className="sm:hidden bg-charcoal text-white px-4 py-2.5 rounded-lg text-sm font-medium shrink-0"
        >
          Search
        </button>
      </div>

      {/* Specialty filter — value tied directly to URL so it always reflects current filter */}
      <div className="flex items-center gap-2">
        <SlidersHorizontal size={16} className="text-slate-400 shrink-0 hidden sm:block" />
        <select
          value={currentSpecialty}
          onChange={e => navigate(searchVal, e.target.value)}
          className="w-full sm:w-52 border border-ivory-border rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-charcoal"
        >
          <option value="">All specialties</option>
          {Object.entries(SPECIALTY_GROUPS).map(([group, items]) => (
            <optgroup key={group} label={group}>
              {items.map(s => <option key={s} value={s}>{s}</option>)}
            </optgroup>
          ))}
        </select>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="self-center flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 whitespace-nowrap transition-colors"
        >
          <X size={14} /> Clear
        </button>
      )}
    </div>
  )
}
