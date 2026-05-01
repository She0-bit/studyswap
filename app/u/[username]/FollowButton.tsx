'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { UserPlus, UserMinus, Loader2 } from 'lucide-react'

type Props = {
  targetUserId:    string
  currentUserId:   string | null
  initialFollowing: boolean
  followerCount:   number
}

export default function FollowButton({ targetUserId, currentUserId, initialFollowing, followerCount }: Props) {
  const [following, setFollowing]   = useState(initialFollowing)
  const [count, setCount]           = useState(followerCount)
  const [loading, setLoading]       = useState(false)
  const router  = useRouter()
  const supabase = createClient()

  async function toggle() {
    if (!currentUserId) { router.push('/auth'); return }
    setLoading(true)
    if (following) {
      await supabase.from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId)
      setFollowing(false)
      setCount(c => c - 1)
    } else {
      await supabase.from('follows')
        .insert({ follower_id: currentUserId, following_id: targetUserId })
      setFollowing(true)
      setCount(c => c + 1)
    }
    setLoading(false)
    router.refresh()
  }

  return (
    <button onClick={toggle} disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-60 ${
        following
          ? 'bg-ivory-dark text-slate-600 hover:bg-red-50 hover:text-red-600 border border-ivory-border'
          : 'bg-charcoal text-white hover:bg-charcoal-deep'
      }`}>
      {loading ? <Loader2 size={15} className="animate-spin" /> :
        following ? <><UserMinus size={15} /> Following ({count})</> :
                   <><UserPlus  size={15} /> Follow ({count})</>
      }
    </button>
  )
}
