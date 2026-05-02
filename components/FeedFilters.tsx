'use client'

import { useRouter } from 'next/navigation'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { SPECIALTY_GROUPS } from '@/lib/types'
import { useState } from 'react'

export default function FeedFilters({
  q,
  specialty,
}: {
  q?: string
  specialty?: string
}) {
  const router = useRouter()
  const [searchVal, setSearchVal]     = useState(q ?? '')
  const [specialtyVal, setSpecialtyVal] = useState(specialty ?? '')

  function navigate(newQ: string, newSpec: string) {
    const params = new URLSearchParams()
    if (newQ.trim())  params.set('q', newQ.trim())
    if (newSpec)      params.set('specialty', newSpec)
    router.push(`/?${params.toString()}`)
  }

  function clearAll() {
    setSearchVal('')
    setSpecialtyVal('')
    router.push('/')
  }

  const hasFilters = !!(q || specialty)

  return (
    <div id="feed" className="mb-5 flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="flex-1 flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && navigate(searchVal, specialtyVal)}
            placeholder="Search by title…"
            className="w-full pl-9 pr-4 py-2.5 border border-ivory-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-charcoal"
          />
        </div>
        {/* Visible search button on mobile so the keyboard submit works */}
        <button
          type="button"
          onClick={() => navigate(searchVal, specialtyVal)}
          className="sm:hidden bg-charcoal text-white px-4 py-2.5 rounded-lg text-sm font-medium shrink-0"
        >
          Search
        </button>
      </div>

      {/* Specialty filter */}
      <div className="flex items-center gap-2">
        <SlidersHorizontal size={16} className="text-slate-400 shrink-0 hidden sm:block" />
        <select
          value={specialtyVal}
          onChange={e => {
            const val = e.target.value
            setSpecialtyVal(val)
            navigate(searchVal, val)
          }}
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
