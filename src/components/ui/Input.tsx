import * as React from 'react'
import { cn } from '@/lib/utils'

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'h-11 w-full rounded-[10px] border border-border/10 bg-surface px-3 text-sm text-text placeholder:text-muted shadow-md shadow-black/20 hover:shadow-lg hover:shadow-black/30 transition-all duration-200',
        'focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/50',
        'transition',
        className,
      )}
    />
  )
}

