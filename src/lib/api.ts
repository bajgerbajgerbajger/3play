export type ApiResult<T> = { success: true } & T
export type ApiError = { success: false; error: string }

function getErrorFromPayload(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null
  if (!('error' in payload)) return null
  const error = (payload as { error?: unknown }).error
  return typeof error === 'string' ? error : null
}

export async function apiFetch<T>(input: RequestInfo | URL, init?: RequestInit & { token?: string | null; timeout?: number }) {
  // Signal start
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('api-load-start'));
  }

  const headers = new Headers(init?.headers)
  headers.set('Accept', 'application/json')
  if (init?.body && !headers.has('Content-Type') && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  if (init?.token) headers.set('Authorization', `Bearer ${init.token}`)

  const DEFAULT_TIMEOUT = (typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: { PROD?: boolean } }).env?.PROD) ? 45000 : 15000
  const timeout = init?.timeout ?? DEFAULT_TIMEOUT
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  try {
    const res = await fetch(input, { ...init, headers, signal: controller.signal })
    clearTimeout(id)

    const data = (await res.json().catch(() => null)) as T | ApiError | null
    if (!res.ok) {
      const message = getErrorFromPayload(data) || res.statusText
      console.error(`API Error [${res.status}]:`, message, data)
      throw new Error(message)
    }
    return data as T
  } catch (err) {
    clearTimeout(id)
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('Požadavek trval příliš dlouho. Zkontrolujte připojení.')
    }
    throw err
  } finally {
    // Signal end
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('api-load-end'));
    }
  }
}
