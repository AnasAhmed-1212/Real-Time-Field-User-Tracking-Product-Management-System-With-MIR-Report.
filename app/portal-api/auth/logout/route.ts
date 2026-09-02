import { NextResponse } from 'next/server'

import { adminCookieName, backendFetch } from '@/lib/server-api'

export async function POST() {
  await backendFetch('/auth/admin/logout', { method: 'POST' }, true).catch(() => undefined)
  const response = new NextResponse(null, { status: 204 })
  response.cookies.delete(adminCookieName)
  return response
}
