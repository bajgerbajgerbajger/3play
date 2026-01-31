import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { DEFAULT_AVATARS } from '@/lib/default-avatars'

type AvatarProps = {
  src?: string | null
  alt?: string
  gender?: 'male' | 'female' | 'other' | string
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom'
}

export function Avatar({ 
  src, 
  alt = 'User', 
  gender = 'other', 
  className,
  size = 'custom'
}: AvatarProps) {
  const [error, setError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState<string>('')

  // Determine fallback based on gender
  const fallbackSrc = 
    gender === 'male' ? DEFAULT_AVATARS.male :
    gender === 'female' ? DEFAULT_AVATARS.female :
    DEFAULT_AVATARS.other

  useEffect(() => {
    // If src is provided and not empty, try to use it
    if (src && src.trim() !== '') {
      setCurrentSrc(src)
      setError(false)
    } else {
      // Otherwise use fallback immediately
      setCurrentSrc(fallbackSrc)
    }
  }, [src, gender, fallbackSrc])

  const handleError = () => {
    setError(true)
    setCurrentSrc(fallbackSrc)
  }

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-20 w-20',
    xl: 'h-32 w-32',
    custom: ''
  }

  return (
    <div className={cn(
      "relative overflow-hidden rounded-full bg-surface2 border border-white/5",
      sizeClasses[size],
      className
    )}>
      <img
        src={currentSrc || fallbackSrc}
        alt={alt}
        className="h-full w-full object-cover"
        onError={handleError}
      />
    </div>
  )
}
