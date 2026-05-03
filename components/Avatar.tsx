// Deterministic colour per user so every person gets a consistent avatar
const GRADIENTS = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-500',
  'from-amber-500 to-orange-500',
  'from-indigo-500 to-blue-600',
  'from-fuchsia-500 to-rose-500',
]

export function getAvatarGradient(seed: string) {
  const hash = seed.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return GRADIENTS[hash % GRADIENTS.length]
}

type AvatarProps = {
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = {
  xs: 'w-5 h-5 text-[10px]',
  sm: 'w-7 h-7 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-xl',
  xl: 'w-20 h-20 text-3xl',
}

export default function Avatar({ name, size = 'md', className = '' }: AvatarProps) {
  const initial  = (name || '?')[0].toUpperCase()
  const gradient = getAvatarGradient(name)
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-white shrink-0 ${className}`}>
      {initial}
    </div>
  )
}
