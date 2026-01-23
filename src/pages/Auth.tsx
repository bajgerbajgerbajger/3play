import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { useModalStore } from '@/store/modal'
import { Logo } from '@/components/Logo'
import { cn } from '@/lib/utils'
import { LoginForm } from '@/pages/auth/LoginForm'
import { RegisterWizard } from '@/pages/auth/RegisterWizard'

type Mode = 'login' | 'register'

export default function Auth() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const returnTo = params.get('returnTo') || '/'

  const { user } = useAuthStore()
  const { openChannelCreation } = useModalStore()
  const [mode, setMode] = useState<Mode>('login')

  const subtitle = useMemo(() => {
    return mode === 'login' ? 'Vítej zpět. Přihlaš se během pár vteřin.' : 'Vytvoř si účet během pár kroků.'
  }, [mode])

  useEffect(() => {
    if (user) nav(returnTo)
  }, [user, nav, returnTo])

  const onRegisterDone = () => {
    openChannelCreation('welcome')
    nav('/')
  }

  return (
    <div className="min-h-[calc(100dvh-56px)] grid place-items-center py-10 animate-fadeUp">
      <div className={cn('w-full', mode === 'login' ? 'max-w-[440px]' : 'max-w-[1040px]')}>
        {mode === 'login' ? (
          <div className="rounded-2xl border border-border/10 bg-surface p-6 shadow-soft">
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
                  'bg-white/5 text-text',
                )}
              >
                Přihlášení
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={cn(
                  'h-10 rounded-[10px] text-sm font-semibold transition',
                  'text-muted hover:text-text',
                )}
              >
                Registrace
              </button>
            </div>
            <LoginForm onDone={() => nav(returnTo)} />
          </div>
        ) : (
          <RegisterWizard onDone={onRegisterDone} onSwitchToLogin={() => setMode('login')} />
        )}
      </div>
    </div>
  )
}
