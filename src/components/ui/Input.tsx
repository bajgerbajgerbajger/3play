import * as React from 'react'
import { cn } from '@/lib/utils'

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'h-11 w-full rounded-[10px] border border-border/10 bg-surface px-3 text-sm text-text placeholder:text-muted shadow-sm hover:shadow-md transition-shadow duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        'transition',
        className,
      )}
    />
  )
}

