export type ApiResult<T> = { success: true } & T
export type ApiError = { success: false; error: string }

function getErrorFromPayload(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null
  if (!('error' in payload)) return null
  const error = (payload as { error?: unknown }).error
  return typeof error === 'string' ? error : null
}

export async function apiFetch<T>(input: RequestInfo | URL, init?: RequestInit & { token?: string | null }) {
  const headers = new Headers(init?.headers)
  headers.set('Accept', 'application/json')
  if (init?.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  if (init?.token) headers.set('Authorization', `Bearer ${init.token}`)

  const res = await fetch(input, { ...init, headers })
  const data = (await res.json().catch(() => null)) as T | ApiError | null
  if (!res.ok) {
    const message = getErrorFromPayload(data) || res.statusText
    throw new Error(message)
  }
  return data as T
}
