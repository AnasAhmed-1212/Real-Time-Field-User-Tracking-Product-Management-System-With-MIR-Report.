import 'server-only'

import { cookies } from 'next/headers'

export const serverApiBaseUrl = (process.env.API_BASE_URL || 'https://sales-server.vercel.app/api').replace(/\/$/, '')
export const adminCookieName = 'admin_session'

export async function backendFetch(path: string, init: RequestInit = {}, authenticated = false) {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  if (authenticated) {
    const token = (await cookies()).get(adminCookieName)?.value
    if (!token) return new Response(JSON.stringify({ message: 'Authentication required' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
    headers.set('Authorization', `Bearer ${token}`)
  }
  return fetch(`${serverApiBaseUrl}${path}`, { ...init, headers, cache: 'no-store', signal: AbortSignal.timeout(20_000) })
}

export async function copyBackendResponse(response: Response) {
  const headers = new Headers()
  headers.set('Content-Type', response.headers.get('content-type') || 'application/json')
  return new Response(await response.arrayBuffer(), { status: response.status, headers })
}
