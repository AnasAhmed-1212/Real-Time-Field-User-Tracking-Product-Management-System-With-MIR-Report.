import { NextRequest, NextResponse } from "next/server"

const publicRoutes = new Set([
  "/login",
  "/forgot-password",
  "/reset-password",
  "/session-expired",
  "/access-denied",
  "/download",
])

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname
  const session = request.cookies.get("admin_session")?.value
  const isPublicRoute = publicRoutes.has(path)

  if (!session && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("next", path)
    return NextResponse.redirect(loginUrl)
  }

  if (session && path === "/login") {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
