import { ArrowLeft, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { countries } from './countries'
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
  type Country = typeof countries[number]
  const [country, setCountry] = useState<Country>(countries[0])
  const [localNumber, setLocalNumber] = useState('')

  useEffect(() => {
    // Try to parse existing phone
    if (phone) {
      const clean = phone.replace(/\s+/g, '')
      const found = countries.find(c => clean.startsWith(c.dial))
      if (found) {
        setCountry(found)
        setLocalNumber(clean.slice(found.dial.length))
      } else {
        setLocalNumber(phone)
      }
    }
  }, []) // run once on mount

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const c = countries.find(x => x.dial === e.target.value) || countries[0]
    setCountry(c)
    updateParent(c.dial, localNumber)
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '')
    setLocalNumber(val)
    updateParent(country.dial, val)
  }

  const updateParent = (prefix: string, num: string) => {
    onPhone(`${prefix} ${num}`)
  }

  return (
    <div className="space-y-3">
      <div>
        <div className="mb-1 text-xs font-semibold text-muted">Telefon</div>
        <div className="flex gap-2">
          <div className="relative shrink-0">
            <select
              className="h-10 w-[110px] appearance-none rounded-lg border border-border/10 bg-surface px-3 pr-8 text-sm outline-none transition focus:border-brand/50 focus:ring-2 focus:ring-brand/20"
              value={country.dial}
              onChange={handleCountryChange}
            >
              {countries.map(c => (
                <option key={c.code} value={c.dial}>
                  {c.flag} {c.dial}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-3 h-4 w-4 text-muted pointer-events-none" />
          </div>
          <Input
            value={localNumber}
            onChange={handleNumberChange}
            placeholder="777 000 000"
            inputMode="tel"
            autoComplete="tel"
            className={cn(errors.phone ? 'border-red-500/30 focus-visible:ring-red-500/40' : null)}
          />
        </div>
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

