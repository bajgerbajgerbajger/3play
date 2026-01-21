import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import type { FieldErrors } from './utils'

export function StepPhone({
  phone,
  consentContact,
  consentMarketing,
  busy,
  errors,
  onPhone,
  onConsentContact,
  onConsentMarketing,
  onBack,
  onNext,
}: {
  phone: string
  consentContact: boolean
  consentMarketing: boolean
  busy: boolean
  errors: FieldErrors
  onPhone: (v: string) => void
  onConsentContact: (v: boolean) => void
  onConsentMarketing: (v: boolean) => void
  onBack: () => void
  onNext: () => void
}) {
  return (
    <div className="space-y-3">
      <div>
        <div className="mb-1 text-xs font-semibold text-muted">Telefon</div>
        <Input
          value={phone}
          onChange={(e) => onPhone(e.target.value)}
          placeholder="+420 777 000 000"
          inputMode="tel"
          autoComplete="tel"
          className={cn(errors.phone ? 'border-red-500/30 focus-visible:ring-red-500/40' : null)}
        />
        {errors.phone ? <div className="mt-1 text-xs text-red-200">{errors.phone}</div> : <div className="mt-1 text-xs text-muted">Použijeme jen pro bezpečnost a obnovení přístupu.</div>}
      </div>

      <div className="space-y-2">
        <label className="flex items-start gap-2 text-xs text-muted">
          <input
            type="checkbox"
            checked={consentContact}
            onChange={(e) => onConsentContact(e.target.checked)}
            className={cn('mt-0.5 h-3 w-3 rounded border-border/60 bg-surface', errors.consentContact ? 'outline outline-2 outline-red-500/30' : null)}
          />
          <span>Souhlasím s kontaktem přes SMS/telefon kvůli účtu a bezpečnosti.</span>
        </label>
        {errors.consentContact ? <div className="text-xs text-red-200">{errors.consentContact}</div> : null}
        <label className="flex items-start gap-2 text-xs text-muted">
          <input
            type="checkbox"
            checked={consentMarketing}
            onChange={(e) => onConsentMarketing(e.target.checked)}
            className="mt-0.5 h-3 w-3 rounded border-border/60 bg-surface"
          />
          <span>Chci dostávat novinky (volitelné).</span>
        </label>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Button type="button" variant="ghost" onClick={onBack} disabled={busy}>
          <ArrowLeft size={16} />
          Zpět
        </Button>
        <Button type="button" onClick={onNext} disabled={busy}>Pokračovat</Button>
      </div>
    </div>
  )
}

