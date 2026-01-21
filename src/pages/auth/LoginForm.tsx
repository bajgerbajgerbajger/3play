import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth'

export function LoginForm({ onDone }: { onDone: () => void }) {
  const { login } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login({ email, password })
      onDone()
    } catch (e2: unknown) {
      setError(e2 instanceof Error ? e2.message : 'Přihlášení selhalo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-5 space-y-3">
      {error ? (
        <div className="rounded-xl border border-border/10 bg-surface2 p-3 text-sm text-muted">{error}</div>
      ) : null}
      <div>
        <div className="mb-1 text-xs font-semibold text-muted">Email</div>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" />
      </div>
      <div>
        <div className="mb-1 text-xs font-semibold text-muted">Heslo</div>
        <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" />
      </div>
      <Button type="submit" loading={loading} className={cn('w-full')}>Přihlásit se</Button>
      <div className="text-center text-xs text-muted">Zapomněl/a jsi heslo? Kontaktuj podporu.</div>
    </form>
  )
}

