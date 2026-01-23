import { ArrowLeft, Check, ScrollText } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { FieldErrors } from './utils'

export function StepConsents({
  termsAccepted,
  privacyAccepted,
  busy,
  errors,
  onTerms,
  onPrivacy,
  onBack,
  onNext,
}: {
  termsAccepted: boolean
  privacyAccepted: boolean
  busy: boolean
  errors: FieldErrors
  onTerms: (v: boolean) => void
  onPrivacy: (v: boolean) => void
  onBack: () => void
  onNext: () => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-semibold mb-2">Přečtěte si prosím pozorně</div>
        <div className="text-xs text-muted mb-4">
          Abychom mohli vytvořit váš účet, potřebujeme váš souhlas s následujícími dokumenty.
          Dbáme na vaše soukromí a dodržujeme přísné standardy ochrany údajů (GDPR).
        </div>
      </div>

      <div className="h-60 overflow-y-auto rounded-xl border border-border/10 bg-surface2 p-4 text-xs text-muted space-y-4 shadow-inner">
        <div>
          <h4 className="font-bold text-text mb-1">1. Podmínky používání (Terms of Service)</h4>
          <p>
            Vítejte v 3Play. Používáním naší platformy souhlasíte s tím, že nebudete nahrávat obsah, 
            který je nezákonný, nenávistný nebo porušuje autorská práva. Respektujeme komunitu a 
            očekáváme to samé od vás. Vyhrazujeme si právo zablokovat účty porušující tato pravidla.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-text mb-1">2. Zásady ochrany soukromí (Privacy Policy)</h4>
          <p>
            Vaše data jsou u nás v bezpečí. Sbíráme pouze údaje nezbytné pro fungování služby 
            (email, jméno, preference). Nikdy neprodáváme vaše osobní data třetím stranám.
            Máte právo kdykoliv požádat o smazání účtu a všech souvisejících dat.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-text mb-1">3. Zpracování údajů</h4>
          <p>
            Zpracováváme vaši IP adresu a cookies pro technické zajištění služby a bezpečnosti.
            Hesla jsou šifrována (argon2/bcrypt). Telefonní čísla slouží výhradně pro 2FA 
            a obnovu přístupu.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-text mb-1">4. Chování na platformě</h4>
          <p>
            Buďte k ostatním uctiví. Šikana, spam a obtěžování nejsou tolerovány.
            Společně tvoříme bezpečné místo pro sdílení videí.
          </p>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <label className={cn(
          "flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer",
          termsAccepted ? "bg-brand/5 border-brand/20" : "bg-surface border-border/10 hover:border-border/30",
          errors.terms && !termsAccepted ? "border-red-500/30 bg-red-500/5" : ""
        )}>
          <div className={cn(
            "mt-0.5 grid place-items-center h-5 w-5 rounded border transition-colors",
            termsAccepted ? "bg-brand border-brand text-white" : "bg-surface border-border/40"
          )}>
            {termsAccepted && <Check size={14} />}
          </div>
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => onTerms(e.target.checked)}
            className="hidden"
          />
          <div className="flex-1">
            <div className="text-sm font-medium">Souhlasím s Podmínkami používání</div>
            <div className="text-xs text-muted">Rozumím pravidlům komunity a zavazuji se je dodržovat.</div>
          </div>
        </label>

        <label className={cn(
          "flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer",
          privacyAccepted ? "bg-brand/5 border-brand/20" : "bg-surface border-border/10 hover:border-border/30",
          errors.privacy && !privacyAccepted ? "border-red-500/30 bg-red-500/5" : ""
        )}>
          <div className={cn(
            "mt-0.5 grid place-items-center h-5 w-5 rounded border transition-colors",
            privacyAccepted ? "bg-brand border-brand text-white" : "bg-surface border-border/40"
          )}>
            {privacyAccepted && <Check size={14} />}
          </div>
          <input
            type="checkbox"
            checked={privacyAccepted}
            onChange={(e) => onPrivacy(e.target.checked)}
            className="hidden"
          />
          <div className="flex-1">
            <div className="text-sm font-medium">Souhlasím se Zásadami soukromí</div>
            <div className="text-xs text-muted">Beru na vědomí zpracování mých osobních údajů.</div>
          </div>
        </label>

        {(errors.terms || errors.privacy) && (
          <div className="text-xs text-red-200 text-center font-medium">
            Pro pokračování je nutné udělit oba souhlasy.
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 mt-6">
        <Button type="button" variant="ghost" onClick={onBack} disabled={busy}>
          <ArrowLeft size={16} />
          Zpět
        </Button>
        <Button type="button" onClick={onNext} disabled={busy || !termsAccepted || !privacyAccepted}>
          Pokračovat
        </Button>
      </div>
    </div>
  )
}
