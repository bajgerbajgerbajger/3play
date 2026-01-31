import * as React from 'react'
import { cn } from '@/lib/utils'

export function IconButton({
  className,
  size,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 'aria-label': string; size?: string }) {
  return (
    <button
      {...props}
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-border/10 bg-surface text-text transition shadow-sm',
        'hover:bg-surface2 hover:shadow-md active:translate-y-[1px]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        className,
      )}
    />
  )
}

