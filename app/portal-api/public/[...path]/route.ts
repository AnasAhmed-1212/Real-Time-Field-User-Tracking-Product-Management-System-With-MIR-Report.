import { backendFetch, copyBackendResponse } from '@/lib/server-api'

type Context = { params: Promise<{ path: string[] }> }
export async function GET(request: Request, context: Context) {
  const { path } = await context.params
  if (!path.length || path.some((part) => !/^[A-Za-z0-9._-]+$/.test(part))) return Response.json({ message: 'Invalid API path' }, { status: 400 })
  const source = new URL(request.url)
  return copyBackendResponse(await backendFetch(`/public/${path.join('/')}${source.search}`))
}
