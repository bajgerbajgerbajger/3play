import * as React from 'react'
import { BRAND } from '@/brand/brand'
import { cn } from '@/lib/utils'

type LogoVariant = 'horizontal' | 'icon'
type LogoTone = 'dark' | 'light' | 'mono'

export function Logo({
  variant = 'horizontal',
  tone = 'dark',
  className,
}: {
  variant?: LogoVariant
  tone?: LogoTone
  className?: string
}) {
  const isIcon = variant === 'icon'
  const src = isIcon ? BRAND.assets.logoIcon : BRAND.assets.logoHorizontal

  return (
    <div className="relative flex items-center justify-center select-none" aria-label="3Play" role="img">
      <img
        src={src}
        alt="3Play Logo"
        className={cn('h-10 w-auto object-contain', className)}
      />
    </div>
  )
}
