export type FieldErrors = Partial<Record<
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'password'
  | 'confirmPassword'
  | 'handle'
  | 'terms'
  | 'privacy'
  | 'verificationCode'
  | 'phone'
  | 'consentContact',
  string
>>

export function toAsciiSlug(input: string) {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '')
    .toLowerCase()
}

export function suggestHandle(firstName: string, lastName: string) {
  const a = toAsciiSlug(firstName)
  const b = toAsciiSlug(lastName)
  const base = a && b ? `${a}${b}` : a || b
  return base ? `@${base}` : '@newcreator'
}

export function isEmailValid(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function scorePassword(pw: string) {
  let s = 0
  if (pw.length >= 8) s += 1
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s += 1
  if (/\d/.test(pw)) s += 1
  if (/[^a-zA-Z0-9]/.test(pw)) s += 1
  return Math.min(s, 4)
}

export function normalizePhone(input: string) {
  const raw = String(input || '').trim()
  const keepPlus = raw.startsWith('+')
  const digits = raw.replace(/[\s\-()]/g, '')
  return keepPlus ? `+${digits.replace(/^\+/, '')}` : digits
}

export function isPhoneValid(phone: string) {
  return /^\+?[0-9]{7,15}$/.test(normalizePhone(phone))
}

