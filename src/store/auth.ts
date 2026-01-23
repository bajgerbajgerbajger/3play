import { create } from 'zustand'
import { apiFetch } from '@/lib/api'

export type AuthUser = {
  id: string
  email: string
  handle: string
  displayName: string
  avatarUrl: string
  channelId?: string
}

type AuthState = {
  token: string | null
  user: AuthUser | null
  hydrated: boolean
  error: string | null
  init: () => Promise<void>
  login: (input: { email: string; password: string }) => Promise<void>
  register: (input: {
    email: string
    password: string
    displayName: string
    handle: string
    verificationCode: string
    acceptTerms: boolean
    phone: string
    consentContact: boolean
    consentMarketing: boolean
    consentVersion: string
    gender: 'male' | 'female' | 'other'
  }) => Promise<void>
  requestCode: (input: { email: string }) => Promise<string | null>
  verifyCode: (input: { email: string; verificationCode: string }) => Promise<void>
  logout: () => void
}

const storageKey = 'auth'

function loadStored() {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return { token: null as string | null }
    const parsed = JSON.parse(raw) as { token?: string }
    return { token: typeof parsed.token === 'string' ? parsed.token : null }
  } catch {
    return { token: null as string | null }
  }
}

function saveStored(token: string | null) {
  localStorage.setItem(storageKey, JSON.stringify({ token }))
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  hydrated: false,
  error: null,
  init: async () => {
    const { token } = loadStored()
    if (!token) {
      set({ token: null, user: null, hydrated: true, error: null })
      return
    }
    try {
      // Add timeout to prevent infinite loading state
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const data = await apiFetch<{ success: true; user: AuthUser }>('/api/auth/me', { 
        token,
        signal: controller.signal 
      })
      clearTimeout(timeoutId)
      set({ token, user: data.user, hydrated: true, error: null })
    } catch {
      saveStored(null)
      set({ token: null, user: null, hydrated: true, error: null })
    }
  },
  login: async ({ email, password }) => {
    set({ error: null })
    const data = await apiFetch<{ success: true; token: string; user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    saveStored(data.token)
    set({ token: data.token, user: data.user, error: null })
  },
  register: async ({
    email,
    password,
    displayName,
    handle,
    verificationCode,
    acceptTerms,
    phone,
    consentContact,
    consentMarketing,
    consentVersion,
  }) => {
    set({ error: null })
    const data = await apiFetch<{ success: true; token: string; user: AuthUser }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        displayName,
        handle,
        verificationCode,
        acceptTerms,
        phone,
        consentContact,
        consentMarketing,
        consentVersion,
      }),
    })
    saveStored(data.token)
    set({ token: data.token, user: data.user, error: null })
  },
  requestCode: async ({ email }) => {
    set({ error: null })
    const data = await apiFetch<{ success: true; devCode?: string }>('/api/auth/request-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
    return data.devCode ?? null
  },
  verifyCode: async ({ email, verificationCode }) => {
    set({ error: null })
    await apiFetch<{ success: true }>('/api/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify({ email, verificationCode }),
    })
  },
  logout: () => {
    saveStored(null)
    set({ token: null, user: null })
  },
}))
