'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'

export default function ShareProfileButton({ username }: { username: string }) {
  const [copied, setCopied] = useState(false)

  async function handleClick() {
    const url = `${window.location.origin}/u/${username}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // fallback for browsers that block clipboard without https
      const el = document.createElement('textarea')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleClick}
      className="text-xs text-ivory/80 hover:text-white flex items-center gap-1 transition-colors"
    >
      {copied ? (
        <><Check size={12} /> Link copied!</>
      ) : (
        <><Share2 size={12} /> Share profile</>
      )}
    </button>
  )
}
