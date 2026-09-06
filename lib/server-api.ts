import 'server-only'

import { cookies } from 'next/headers'

export const serverApiBaseUrl = (process.env.API_BASE_URL || 'https://sales-server.vercel.app/api').replace(/\/$/, '')
export const adminCookieName = 'sales_admin_session_v2'

const transientStatuses = new Set([500, 502, 503, 504])
const retryDelay = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds))

export async function backendFetch(path: string, init: RequestInit = {}, authenticated = false) {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  if (authenticated) {
    const token = (await cookies()).get(adminCookieName)?.value
    if (!token) return new Response(JSON.stringify({ message: 'Authentication required' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
    headers.set('Authorization', `Bearer ${token}`)
  }
  const method = (init.method || 'GET').toUpperCase()
  const attempts = method === 'GET' || method === 'HEAD' ? 2 : 1
  let lastReason: unknown

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(`${serverApiBaseUrl}${path}`, {
        ...init,
        headers,
        cache: 'no-store',
        signal: AbortSignal.timeout(20_000),
      })
      if (attempt + 1 < attempts && transientStatuses.has(response.status)) {
        await retryDelay(300)
        continue
      }
      return response
    } catch (reason) {
      lastReason = reason
      if (attempt + 1 < attempts) {
        await retryDelay(300)
        continue
      }
    }
  }

  console.error('Sales API request failed', { baseUrl: serverApiBaseUrl, path, reason: lastReason })
  return Response.json(
    { message: `The sales server at ${serverApiBaseUrl} could not be reached.` },
    { status: 502 },
  )
}

export async function copyBackendResponse(response: Response) {
  const headers = new Headers()
  headers.set('Content-Type', response.headers.get('content-type') || 'application/json')
  const requestId = response.headers.get('x-request-id')
  if (requestId) headers.set('X-Request-Id', requestId)
  return new Response(await response.arrayBuffer(), { status: response.status, headers })
}
