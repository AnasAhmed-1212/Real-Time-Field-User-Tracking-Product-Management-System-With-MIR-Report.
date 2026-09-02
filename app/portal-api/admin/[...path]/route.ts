import { cookies } from 'next/headers'

import { adminCookieName, backendFetch, copyBackendResponse } from '@/lib/server-api'

type Context = { params: Promise<{ path: string[] }> }

async function forward(request: Request, context: Context) {
  const { path } = await context.params
  if (!path.length || path.some((part) => !/^[A-Za-z0-9._-]+$/.test(part))) return Response.json({ message: 'Invalid API path' }, { status: 400 })
  const source = new URL(request.url)
  const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer()
  const response = await backendFetch(`/admin/${path.join('/')}${source.search}`, {
    method: request.method, body,
    headers: { 'Content-Type': request.headers.get('content-type') || 'application/json' },
  }, true)
  if (response.status === 401) (await cookies()).delete(adminCookieName)
  return copyBackendResponse(response)
}

export const GET = forward
export const POST = forward
export const PATCH = forward
export const PUT = forward
export const DELETE = forward
