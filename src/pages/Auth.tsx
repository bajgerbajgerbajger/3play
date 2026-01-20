import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

type Mode = 'login' | 'register'

export default function Auth() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const returnTo = params.get('returnTo') || '/studio'

  const { user, login, register, requestCode } = useAuthStore()

  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [handle, setHandle] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [codeSending, setCodeSending] = useState(false)
  const [devCodeHint, setDevCodeHint] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const subtitle = useMemo(() => {
    return mode === 'login' ? 'Welcome back. Keep it fast.' : 'Create your creator account.'
  }, [mode])

  useEffect(() => {
    if (user) nav(returnTo)
  }, [user, nav, returnTo])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'login') {
        await login({ email, password })
      } else {
        const finalDisplayName = displayName.trim() || 'New Creator'
        const finalHandle = handle.trim() || 'newcreator'
        await register({ email, password, displayName: finalDisplayName, handle: finalHandle, verificationCode, acceptTerms: termsAccepted })
      }
      nav(returnTo)
    } catch (e2: unknown) {
      console.error('Auth error:', e2)
      setError(e2 instanceof Error ? e2.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  async function onSendCode() {
    if (!email) {
      setError('Enter your email before requesting a code')
      return
    }
    setError(null)
    setCodeSending(true)
    try {
      const dev = await requestCode({ email })
      setDevCodeHint(dev)
    } catch (e2: unknown) {
      setError(e2 instanceof Error ? e2.message : 'Failed to send code')
    } finally {
      setCodeSending(false)
    }
  }

  return (
    <div className="min-h-[calc(100dvh-56px)] grid place-items-center py-10 animate-fadeUp">
      <div className="w-full max-w-[440px] rounded-2xl border border-border/10 bg-surface p-6 shadow-soft">
        <div className="flex justify-center py-4">
          <Logo variant="horizontal" tone="dark" className="h-16" />
        </div>
        <div className="text-center">
          <div className="mt-1 text-sm text-muted">{subtitle}</div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl border border-border/10 bg-surface2 p-1">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={cn(
              'h-10 rounded-[10px] text-sm font-semibold transition',
              mode === 'login' ? 'bg-white/5 text-text' : 'text-muted hover:text-text',
            )}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={cn(
              'h-10 rounded-[10px] text-sm font-semibold transition',
              mode === 'register' ? 'bg-white/5 text-text' : 'text-muted hover:text-text',
            )}
          >
            Create account
          </button>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-border/10 bg-surface2 p-3 text-sm text-muted">{error}</div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          {mode === 'register' ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <div className="mb-1 text-xs font-semibold text-muted">Display name</div>
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your channel name" />
              </div>
              <div>
                <div className="mb-1 text-xs font-semibold text-muted">Handle</div>
                <Input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="@yourhandle" />
              </div>
            </div>
          ) : null}
          <div>
            <div className="mb-1 text-xs font-semibold text-muted">Email</div>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" />
          </div>
          <div>
            <div className="mb-1 text-xs font-semibold text-muted">Password</div>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
          </div>
          {mode === 'register' ? (
            <>
              <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
                <div>
                  <div className="mb-1 text-xs font-semibold text-muted">Email verification code</div>
                  <Input value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} placeholder="123456" />
                </div>
                <Button type="button" variant="secondary" loading={codeSending} onClick={onSendCode}>
                  Send code
                </Button>
              </div>
              <label className="mt-2 flex items-start gap-2 text-xs text-muted">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 h-3 w-3 rounded border-border/60 bg-surface"
                />
                <span>
                  I agree to the Terms of Service, Privacy Policy, and Cookies Policy.
                </span>
              </label>
              {devCodeHint ? (
                <div className="mt-1 text-[11px] text-muted">
                  Dev code: {devCodeHint}
                </div>
              ) : null}
            </>
          ) : null}
          <Button type="submit" loading={loading} className="w-full">
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </Button>
        </form>

        <div className="mt-4 text-center text-xs text-muted">
          Need an account? <span className="text-text font-semibold">Contact Support</span>
        </div>
      </div>
    </div>
  )
}
