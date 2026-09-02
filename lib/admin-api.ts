export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message) }
}

export async function adminApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response
  try {
    response = await fetch(`/portal-api/admin/${path.replace(/^\//, '')}`, {
      ...init,
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    })
  } catch {
    throw new ApiError('The web portal could not reach its API proxy. Check your connection and deployment.', 0)
  }
  if (!response.ok) {
    const text = await response.text()
    let payload: { message?: string } | null = null
    try { payload = JSON.parse(text) as { message?: string } } catch { /* The status below remains actionable. */ }
    if (response.status === 401 && typeof window !== 'undefined') window.location.assign('/session-expired')
    throw new ApiError(payload?.message || `The sales API returned HTTP ${response.status}.`, response.status)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export async function authApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`/portal-api/auth/${path.replace(/^\//, '')}`, {
    ...init,
    headers: { Accept: 'application/json', ...(init.body ? { 'Content-Type': 'application/json' } : {}), ...init.headers },
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { message?: string } | null
    throw new ApiError(payload?.message || 'The API could not complete this request.', response.status)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}
