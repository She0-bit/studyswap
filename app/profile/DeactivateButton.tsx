'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { useState } from 'react'

export default function DeactivateButton({ formId, isActive }: { formId: string; isActive: boolean }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function toggle() {
    setLoading(true)
    await supabase.from('forms').update({ is_active: !isActive }).eq('id', formId)
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`text-xs px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
        isActive
          ? 'text-red-500 border-red-200 hover:bg-red-50'
          : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
      }`}
    >
      {loading ? '…' : isActive ? 'Deactivate' : 'Reactivate'}
    </button>
  )
}
