import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function StepReview({
  displayName,
  email,
  phone,
  handle,
  busy,
  onBack,
  onFinish,
}: {
  displayName: string
  email: string
  phone: string
  handle: string
  busy: boolean
  onBack: () => void
  onFinish: () => void
}) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border/10 bg-surface2 p-4">
        <div className="text-sm font-semibold">Shrnutí</div>
        <div className="mt-3 grid gap-2 text-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="text-muted">Jméno</div>
            <div className="font-semibold">{displayName || '—'}</div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="text-muted">Email</div>
            <div className="font-semibold">{email || '—'}</div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="text-muted">Telefon</div>
            <div className="font-semibold">{phone || '—'}</div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="text-muted">Handle</div>
            <div className="font-semibold">{handle || '—'}</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Button type="button" variant="ghost" onClick={onBack} disabled={busy}>
          <ArrowLeft size={16} />
          Zpět
        </Button>
        <Button type="button" onClick={onFinish} loading={busy}>Vytvořit účet</Button>
      </div>

      <div className="text-xs text-muted">Dokončením registrace potvrzuješ, že souhlasy evidujeme s časem a verzí.</div>
    </div>
  )
}

