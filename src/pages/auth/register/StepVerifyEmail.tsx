import { ArrowLeft, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import type { FieldErrors } from './utils'

export function StepVerifyEmail({
  verificationCode,
  devCodeHint,
  resendCooldown,
  busy,
  errors,
  onVerificationCode,
  onResend,
  onBack,
  onNext,
}: {
  verificationCode: string
  devCodeHint: string | null
  resendCooldown: number
  busy: boolean
  errors: FieldErrors
  onVerificationCode: (v: string) => void
  onResend: () => void
  onBack: () => void
  onNext: () => void
}) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border/10 bg-surface2 p-3">
        <div className="text-sm font-semibold">Kód ověření</div>
        <div className="mt-1 text-xs text-muted">Zadej 6místný kód z emailu. Platí 10 minut.</div>
        <div className="mt-3 grid grid-cols-[1fr_auto] gap-2 items-end">
          <div>
            <div className="mb-1 text-xs font-semibold text-muted">Ověřovací kód</div>
            <Input
              value={verificationCode}
              onChange={(e) => onVerificationCode(e.target.value)}
              inputMode="numeric"
              placeholder="123456"
              className={cn(errors.verificationCode ? 'border-red-500/30 focus-visible:ring-red-500/40' : null)}
            />
            {errors.verificationCode ? <div className="mt-1 text-xs text-red-200">{errors.verificationCode}</div> : null}
          </div>
          <Button type="button" variant="secondary" onClick={onResend} disabled={busy || resendCooldown > 0}>
            <RefreshCcw size={16} />
            {resendCooldown > 0 ? `Znovu za ${resendCooldown}s` : 'Poslat znovu'}
          </Button>
        </div>
        {devCodeHint ? (
          <div className="mt-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3 text-xs text-yellow-200">
            <span className="font-semibold">Dev režim:</span> kód je <span className="font-mono font-bold select-all">{devCodeHint}</span>
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-2">
        <Button type="button" variant="ghost" onClick={onBack} disabled={busy}>
          <ArrowLeft size={16} />
          Změnit údaje
        </Button>
        <Button type="button" onClick={onNext} loading={busy}>Pokračovat</Button>
      </div>
    </div>
  )
}

