import { NextResponse } from 'next/server'

import { adminCookieName, backendFetch } from '@/lib/server-api'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const response = await backendFetch('/auth/admin/login', { method: 'POST', body: JSON.stringify(body) })
  const payload = await response.json().catch(() => ({ message: 'The API returned an invalid response.' }))
  if (!response.ok) return NextResponse.json(payload, { status: response.status })
  const next = NextResponse.json({ user: payload.user, expiresAt: payload.expiresAt })
  next.cookies.set(adminCookieName, payload.token, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/',
    expires: new Date(payload.expiresAt), priority: 'high',
  })
  return next
}
