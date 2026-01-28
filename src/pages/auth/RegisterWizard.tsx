import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Logo } from '@/components/Logo'
import { useAuthStore } from '@/store/auth'
import { StepAccount } from './register/StepAccount'
import { StepConsents } from './register/StepConsents'
import { StepVerifyEmail } from './register/StepVerifyEmail'
import { StepPhone } from './register/StepPhone'
import { StepReview } from './register/StepReview'
import { TrustPanel } from './register/TrustPanel'
import type { FieldErrors } from './register/utils'
import { isEmailValid, isPhoneValid, normalizePhone, scorePassword, suggestHandle } from './register/utils'

type Step = 1 | 2 | 3 | 4 | 5

const stepVariants = {
  initial: (dir: number) => ({ opacity: 0, x: dir > 0 ? 24 : -24 }),
  animate: { opacity: 1, x: 0, transition: { duration: 0.22, ease: 'easeOut' } },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -24 : 24, transition: { duration: 0.18, ease: 'easeIn' } }),
}

export function RegisterWizard({ onDone, onSwitchToLogin }: { onDone: () => void; onSwitchToLogin: () => void }) {
  const navigate = useNavigate()
  const { requestCode, verifyCode, register } = useAuthStore()

  const [step, setStep] = useState<Step>(1)
  const [direction, setDirection] = useState(1)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [topError, setTopError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [handle, setHandle] = useState('@newcreator')
  const [gender, setGender] = useState<'male' | 'female' | 'other' | undefined>(undefined)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)

  const [verificationCode, setVerificationCode] = useState('')
  const [devCodeHint, setDevCodeHint] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)

  const [phone, setPhone] = useState('')
  const [consentContact, setConsentContact] = useState(false)
  const [consentMarketing, setConsentMarketing] = useState(false)

  const displayName = useMemo(() => `${firstName.trim()} ${lastName.trim()}`.trim(), [firstName, lastName])
  const pwScore = useMemo(() => scorePassword(password), [password])

  useEffect(() => {
    setHandle((h) => {
      const trimmed = String(h || '').trim()
      if (trimmed && trimmed !== '@newcreator') return trimmed
      return suggestHandle(firstName, lastName)
    })
  }, [firstName, lastName])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = window.setInterval(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000)
    return () => window.clearInterval(t)
  }, [resendCooldown])

  function go(next: Step) {
    setDirection(next > step ? 1 : -1)
    setStep(next)
  }
  function clearErrors() {
    setErrors({})
    setTopError(null)
  }

  function validateStep1(): boolean {
    const e: FieldErrors = {}
    if (!firstName.trim()) e.firstName = 'Zadej jméno'
    if (!lastName.trim()) e.lastName = 'Zadej příjmení'
    if (!email.trim()) e.email = 'Zadej email'
    else if (!isEmailValid(email.trim())) e.email = 'Neplatný email'
    if (!password) e.password = 'Zadej heslo'
    else if (password.length < 8) e.password = 'Minimálně 8 znaků'
    if (!confirmPassword) e.confirmPassword = 'Potvrď heslo'
    else if (confirmPassword !== password) e.confirmPassword = 'Hesla se neshodují'
    const h = handle.trim()
    if (!h || h === '@') e.handle = 'Zadej handle'
    setErrors(e)
    return Object.keys(e).length === 0
  }
  function validateStep2(): boolean {
    const e: FieldErrors = {}
    if (!termsAccepted) e.terms = 'Je potřeba souhlasit s Podmínkami'
    if (!privacyAccepted) e.privacy = 'Je potřeba souhlasit se Zásadami soukromí'
    setErrors(e)
    return Object.keys(e).length === 0
  }
  function validateStep3(): boolean {
    const e: FieldErrors = {}
    if (!verificationCode.trim()) e.verificationCode = 'Zadej ověřovací kód'
    else if (!/^\d{6}$/.test(verificationCode.trim())) e.verificationCode = 'Kód má 6 číslic'
    setErrors(e)
    return Object.keys(e).length === 0
  }
  function validateStep4(): boolean {
    const e: FieldErrors = {}
    if (!phone.trim()) e.phone = 'Zadej telefon'
    else if (!isPhoneValid(phone.trim())) e.phone = 'Neplatné číslo (ideálně +420…)'
    if (!consentContact) e.consentContact = 'Tento souhlas je povinný'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function onStep1Next() {
    clearErrors()
    if (!validateStep1()) return
    go(2)
  }

  async function onStep2Next() {
    clearErrors()
    if (!validateStep2()) return
    setBusy(true)
    try {
      const dev = await requestCode({ email: email.trim() })
      setDevCodeHint(dev)
      setResendCooldown(45)
      go(3)
    } catch (e2: unknown) {
      setTopError(e2 instanceof Error ? e2.message : 'Nepodařilo se odeslat kód')
    } finally {
      setBusy(false)
    }
  }

  async function onResend() {
    if (resendCooldown > 0) return
    setTopError(null)
    setBusy(true)
    try {
      const dev = await requestCode({ email: email.trim() })
      setDevCodeHint(dev)
      if (dev) alert(`Váš ověřovací kód je: ${dev}`)
      setResendCooldown(45)
    } catch (e2: unknown) {
      setTopError(e2 instanceof Error ? e2.message : 'Nepodařilo se poslat kód znovu')
    } finally {
      setBusy(false)
    }
  }

  async function onStep3Next() {
    clearErrors()
    if (!validateStep3()) return
    setBusy(true)
    try {
      await verifyCode({ email: email.trim(), verificationCode: verificationCode.trim() })
      go(4)
    } catch (e2: unknown) {
      setTopError(e2 instanceof Error ? e2.message : 'Ověření selhalo')
    } finally {
      setBusy(false)
    }
  }

  function onStep4Next() {
    clearErrors()
    if (!validateStep4()) return
    go(5)
  }

  async function onFinish() {
    setTopError(null)
    setBusy(true)
    try {
      await register({
        email: email.trim(),
        password,
        displayName: displayName || 'New Creator',
        handle: handle.trim(),
        verificationCode: verificationCode.trim(),
        acceptTerms: termsAccepted && privacyAccepted,
        phone: phone.trim(),
        consentContact,
        consentMarketing,
        consentVersion: 'v1',
        gender: gender || 'other',
      })
      navigate('/onboarding/setup')
    } catch (e2: unknown) {
      console.error('Registration error:', e2)
      const msg = e2 instanceof Error ? e2.message : 'Registrace selhala'
      setTopError(msg)
      if (msg.toLowerCase().includes('code')) go(2)
      else go(1)
    } finally {
      setBusy(false)
    }
  }

  const title = step === 1 ? 'Vytvoř si účet' : step === 2 ? 'Ověř svůj email' : step === 3 ? 'Zabezpečení účtu' : 'Dokončení'
  const subtitle = step === 1
    ? 'Zabere to jen chvilku. Ověření emailu proběhne v dalším kroku.'
    : step === 2
      ? `Poslali jsme kód na ${email.trim() || 'tvůj email'}.`
      : step === 3
        ? 'Telefon používáme jen pro bezpečnost účtu a důležité informace.'
        : 'Zkontroluj údaje a dokonči registraci.'

  return (
    <div className="w-full max-w-[1040px] rounded-2xl border border-border/10 bg-surface shadow-soft overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr]">
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Logo variant="horizontal" tone="dark" className="h-10" />
              <div className="text-xs text-muted">Krok {step} z 5</div>
            </div>
            <button onClick={onSwitchToLogin} type="button" className="text-xs font-semibold text-muted hover:text-text transition">Už mám účet</button>
          </div>

          <div className="mt-4">
            <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
              <div className="h-full bg-brand transition-all" style={{ width: `${(step / 5) * 100}%` }} />
            </div>
          </div>

          <div className="mt-6">
            <div className="text-xl font-semibold">{title}</div>
            <div className="mt-1 text-sm text-muted">{subtitle}</div>
          </div>

          {topError ? (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">{topError}</div>
          ) : null}

          <div className="mt-5">
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div key={step} custom={direction} variants={stepVariants} initial="initial" animate="animate" exit="exit">
                {step === 1 ? (
                  <StepAccount
                    firstName={firstName}
                    lastName={lastName}
                    email={email}
                    password={password}
                    confirmPassword={confirmPassword}
                    handle={handle}
                    gender={gender}
                    termsAccepted={termsAccepted}
                    privacyAccepted={privacyAccepted}
                    pwScore={pwScore}
                    errors={errors}
                    busy={busy}
                    onFirstName={setFirstName}
                    onLastName={setLastName}
                    onEmail={setEmail}
                    onPassword={setPassword}
                    onConfirmPassword={setConfirmPassword}
                    onHandle={setHandle}
                    onGender={setGender}
                    onTerms={setTermsAccepted}
                    onPrivacy={setPrivacyAccepted}
                    onNext={onStep1Next}
                  />
                ) : null}
                {step === 2 ? (
                  <StepConsents
                    termsAccepted={termsAccepted}
                    privacyAccepted={privacyAccepted}
                    busy={busy}
                    errors={errors}
                    onTerms={setTermsAccepted}
                    onPrivacy={setPrivacyAccepted}
                    onBack={() => go(1)}
                    onNext={onStep2Next}
                  />
                ) : null}
                {step === 3 ? (
                  <StepVerifyEmail
                    verificationCode={verificationCode}
                    devCodeHint={devCodeHint}
                    resendCooldown={resendCooldown}
                    busy={busy}
                    errors={errors}
                    onVerificationCode={setVerificationCode}
                    onResend={onResend}
                    onBack={() => {
                      clearErrors()
                      go(2)
                    }}
                    onNext={onStep3Next}
                  />
                ) : null}
                {step === 4 ? (
                  <StepPhone
                    phone={phone}
                    consentContact={consentContact}
                    consentMarketing={consentMarketing}
                    busy={busy}
                    errors={errors}
                    onPhone={setPhone}
                    onConsentContact={setConsentContact}
                    onConsentMarketing={setConsentMarketing}
                    onBack={() => go(3)}
                    onNext={onStep4Next}
                  />
                ) : null}
                {step === 5 ? (
                  <StepReview
                    displayName={displayName}
                    email={email.trim()}
                    phone={normalizePhone(phone)}
                    handle={handle.trim()}
                    busy={busy}
                    onBack={() => go(4)}
                    onFinish={onFinish}
                  />
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <TrustPanel />
      </div>
    </div>
  )
}
