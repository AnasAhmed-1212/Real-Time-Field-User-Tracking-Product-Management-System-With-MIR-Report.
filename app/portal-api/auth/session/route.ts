import { NextResponse } from 'next/server'

import { adminCookieName, backendFetch } from '@/lib/server-api'

export async function GET() {
  const response = await backendFetch('/admin/profile', {}, true)
  if (!response.ok) {
    const next = NextResponse.json({ message: 'Session is invalid or expired' }, { status: 401 })
    next.cookies.delete(adminCookieName)
    return next
  }
  return NextResponse.json(await response.json())
}
