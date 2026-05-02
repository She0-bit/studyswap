'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { SPECIALTY_GROUPS } from '@/lib/types'
import { useState, useEffect } from 'react'

const DURATION_OPTIONS = [
  { label: 'Any length', value: '' },
  { label: '≤ 5 min',   value: '5' },
  { label: '≤ 10 min',  value: '10' },
  { label: '≤ 15 min',  value: '15' },
]

export default function FeedFilters() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const currentQ         = searchParams.get('q') ?? ''
  const currentSpecialty = searchParams.get('specialty') ?? ''
  const currentMaxMin    = searchParams.get('max_min') ?? ''

  const [searchVal, setSearchVal] = useState(currentQ)
  const [showAdvanced, setShowAdvanced] = useState(!!(currentSpecialty || currentMaxMin))

  useEffect(() => { setSearchVal(currentQ) }, [currentQ])

  function navigate(q: string, spec: string, maxMin: string) {
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    if (spec)     params.set('specialty', spec)
    if (maxMin)   params.set('max_min', maxMin)
    router.push(`/?${params.toString()}`)
  }

  function clearAll() {
    setSearchVal('')
    router.push('/')
  }

  const advancedCount = (currentSpecialty ? 1 : 0) + (currentMaxMin ? 1 : 0)
  const hasFilters    = !!(currentQ || currentSpecialty || currentMaxMin)

  return (
    <div id="feed" className="mb-5 space-y-2">
      {/* Main row: search + filter toggle */}
      <div className="flex gap-3">
        {/* Search input */}
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && navigate(searchVal, currentSpecialty, currentMaxMin)}
              placeholder="Search by title…"
              className="w-full pl-9 pr-4 py-2.5 border border-ivory-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-charcoal"
            />
          </div>
          {/* Search button visible on mobile */}
          <button
            type="button"
            onClick={() => navigate(searchVal, currentSpecialty, currentMaxMin)}
            className="sm:hidden bg-charcoal text-white px-4 py-2.5 rounded-lg text-sm font-medium shrink-0"
          >
            Search
          </button>
        </div>

        {/* Advanced filter toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(v => !v)}
          title="Advanced filters"
          className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg border text-sm transition-colors shrink-0 ${
            showAdvanced || advancedCount > 0
              ? 'bg-charcoal text-white border-charcoal'
              : 'bg-white text-slate-500 border-ivory-border hover:border-charcoal/40 hover:text-slate-700'
          }`}
        >
          <SlidersHorizontal size={15} />
          <span className="hidden sm:inline">Filters</span>
          {advancedCount > 0 && (
            <span className="text-xs bg-white/25 px-1.5 py-0.5 rounded-full font-medium">
              {advancedCount}
            </span>
          )}
        </button>

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

      {/* Advanced panel */}
      {showAdvanced && (
        <div className="bg-white border border-ivory-border rounded-xl px-5 py-4 flex flex-col sm:flex-row gap-6">

          {/* Specialty */}
          <div className="flex-1">
            <p className="text-xs font-medium text-slate-600 mb-2">Field / Specialty</p>
            <select
              value={currentSpecialty}
              onChange={e => navigate(searchVal, e.target.value, currentMaxMin)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-charcoal"
            >
              <option value="">All specialties</option>
              {Object.entries(SPECIALTY_GROUPS).map(([group, items]) => (
                <optgroup key={group} label={group}>
                  {items.map(s => <option key={s} value={s}>{s}</option>)}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div>
            <p className="text-xs font-medium text-slate-600 mb-2">Max duration</p>
            <div className="flex flex-wrap gap-2">
              {DURATION_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => navigate(searchVal, currentSpecialty, opt.value)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    currentMaxMin === opt.value
                      ? 'bg-charcoal text-white border-charcoal'
                      : 'bg-white text-slate-600 border-slate-300 hover:border-charcoal/40'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
