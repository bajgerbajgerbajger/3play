import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import { DEFAULT_AVATARS } from '@/lib/default-avatars'
import type { FieldErrors } from './utils'

export function StepAccount({
  firstName,
  lastName,
  email,
  password,
  confirmPassword,
  handle,
  gender,
  termsAccepted,
  privacyAccepted,
  pwScore,
  errors,
  busy,
  onFirstName,
  onLastName,
  onEmail,
  onPassword,
  onConfirmPassword,
  onHandle,
  onGender,
  onTerms,
  onPrivacy,
  onNext,
}: {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  handle: string
  gender?: 'male' | 'female' | 'other'
  termsAccepted: boolean
  privacyAccepted: boolean
  pwScore: number
  errors: FieldErrors
  busy: boolean
  onFirstName: (v: string) => void
  onLastName: (v: string) => void
  onEmail: (v: string) => void
  onPassword: (v: string) => void
  onConfirmPassword: (v: string) => void
  onHandle: (v: string) => void
  onGender?: (v: 'male' | 'female' | 'other') => void
  onTerms: (v: boolean) => void
  onPrivacy: (v: boolean) => void
  onNext: () => void
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <div className="mb-1 text-xs font-semibold text-muted">Jméno</div>
          <Input
            value={firstName}
            onChange={(e) => onFirstName(e.target.value)}
            autoComplete="given-name"
            className={cn(errors.firstName ? 'border-red-500/30 focus-visible:ring-red-500/40' : null)}
          />
          {errors.firstName ? <div className="mt-1 text-xs text-red-200">{errors.firstName}</div> : null}
        </div>
        <div>
          <div className="mb-1 text-xs font-semibold text-muted">Příjmení</div>
          <Input
            value={lastName}
            onChange={(e) => onLastName(e.target.value)}
            autoComplete="family-name"
            className={cn(errors.lastName ? 'border-red-500/30 focus-visible:ring-red-500/40' : null)}
          />
          {errors.lastName ? <div className="mt-1 text-xs text-red-200">{errors.lastName}</div> : null}
        </div>
      </div>

      <div>
        <div className="mb-1 text-xs font-semibold text-muted">Pohlaví (volitelné)</div>
        <div className="grid grid-cols-3 gap-3">
          {(['male', 'female', 'other'] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => onGender?.(g)}
              className={cn(
                "group relative flex flex-col items-center gap-2 rounded-xl border p-3 transition-all outline-none",
                gender === g 
                  ? "border-brand bg-brand/5 ring-1 ring-brand" 
                  : "border-border/10 bg-surface hover:border-brand/50 hover:bg-surface/80"
              )}
            >
              <div className="relative h-16 w-16 overflow-hidden rounded-full ring-2 ring-border/10 group-hover:ring-brand/30 transition-all">
                <img 
                  src={DEFAULT_AVATARS[g]} 
                  alt={g} 
                  className="h-full w-full object-cover bg-[#F0F2F5]" 
                />
              </div>
              <span className={cn(
                "text-xs font-medium transition-colors",
                gender === g ? "text-brand" : "text-muted group-hover:text-text"
              )}>
                {g === 'male' ? 'Muž' : g === 'female' ? 'Žena' : 'Jiné'}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-1 text-xs font-semibold text-muted">Email</div>
        <Input
          value={email}
          onChange={(e) => onEmail(e.target.value)}
          type="email"
          autoComplete="email"
          className={cn(errors.email ? 'border-red-500/30 focus-visible:ring-red-500/40' : null)}
        />
        {errors.email ? <div className="mt-1 text-xs text-red-200">{errors.email}</div> : null}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <div className="mb-1 text-xs font-semibold text-muted">Heslo</div>
          <Input
            value={password}
            onChange={(e) => onPassword(e.target.value)}
            type="password"
            autoComplete="new-password"
            className={cn(errors.password ? 'border-red-500/30 focus-visible:ring-red-500/40' : null)}
          />
          {errors.password ? <div className="mt-1 text-xs text-red-200">{errors.password}</div> : null}
        </div>
        <div>
          <div className="mb-1 text-xs font-semibold text-muted">Potvrdit heslo</div>
          <Input
            value={confirmPassword}
            onChange={(e) => onConfirmPassword(e.target.value)}
            type="password"
            autoComplete="new-password"
            className={cn(errors.confirmPassword ? 'border-red-500/30 focus-visible:ring-red-500/40' : null)}
          />
          {errors.confirmPassword ? <div className="mt-1 text-xs text-red-200">{errors.confirmPassword}</div> : null}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <div className="mb-1 text-xs font-semibold text-muted">Síla hesla</div>
          <div className="text-xs text-muted">{pwScore}/4</div>
        </div>
        <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
          <div
            className={cn(
              'h-full transition-all',
              pwScore <= 1 ? 'bg-red-500' : pwScore === 2 ? 'bg-yellow-500' : pwScore === 3 ? 'bg-green-500' : 'bg-emerald-400',
            )}
            style={{ width: `${(pwScore / 4) * 100}%` }}
          />
        </div>
        <div className="mt-1 text-xs text-muted">Doporučení: 8+ znaků, číslo, velké/malé písmeno.</div>
      </div>

      <div>
        <div className="mb-1 text-xs font-semibold text-muted">Handle</div>
        <Input
          value={handle}
          onChange={(e) => onHandle(e.target.value)}
          placeholder="@tvoje_jmeno"
          className={cn(errors.handle ? 'border-red-500/30 focus-visible:ring-red-500/40' : null)}
        />
        {errors.handle ? (
          <div className="mt-1 text-xs text-red-200">{errors.handle}</div>
        ) : (
          <div className="mt-1 text-xs text-muted">Bude viditelný u tvého profilu.</div>
        )}
      </div>

      <div className="space-y-2">
        <label className="flex items-start gap-2 text-xs text-muted">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => onTerms(e.target.checked)}
            className={cn('mt-0.5 h-3 w-3 rounded border-border/60 bg-surface', errors.terms ? 'outline outline-2 outline-red-500/30' : null)}
          />
          <span>Souhlasím s Podmínkami používání.</span>
        </label>
        {errors.terms ? <div className="text-xs text-red-200">{errors.terms}</div> : null}
        <label className="flex items-start gap-2 text-xs text-muted">
          <input
            type="checkbox"
            checked={privacyAccepted}
            onChange={(e) => onPrivacy(e.target.checked)}
            className={cn('mt-0.5 h-3 w-3 rounded border-border/60 bg-surface', errors.privacy ? 'outline outline-2 outline-red-500/30' : null)}
          />
          <span>Souhlasím se Zásadami soukromí.</span>
        </label>
        {errors.privacy ? <div className="text-xs text-red-200">{errors.privacy}</div> : null}
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="text-xs text-muted">Ověření emailu se zobrazí až po tomto kroku.</div>
        <Button type="button" onClick={onNext} loading={busy}>Pokračovat</Button>
      </div>
    </div>
  )
}
