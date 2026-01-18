import * as React from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  className,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  loading?: boolean
}) {
  const isDisabled = disabled || loading
  return (
    <button
      {...props}
      disabled={isDisabled}
      onClick={(e) => {
        if (navigator.vibrate) navigator.vibrate(15);
        props.onClick?.(e);
      }}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-[10px] font-semibold transition will-change-transform',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/80 focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        'disabled:opacity-60 disabled:pointer-events-none',
        'active:animate-vibrate',
        size === 'sm' ? 'h-9 px-3 text-sm' : 'h-11 px-4 text-sm',
        variant === 'primary' &&
          'bg-brand text-white hover:bg-brand-hover active:scale-[0.97] active:brightness-95',
        variant === 'secondary' &&
          'bg-surface text-text border border-border/10 hover:bg-surface2 active:scale-[0.97]',
        variant === 'ghost' && 'bg-transparent text-text hover:bg-white/5 active:scale-[0.97]',
        variant === 'danger' && 'bg-red-500 text-white hover:bg-red-400 active:scale-[0.97]',
        className,
      )}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      ) : null}
      {props.children}
    </button>
  )
}

