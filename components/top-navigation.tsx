"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { ChevronDown, ChevronRight, LogOut, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { authApi } from "@/lib/admin-api"
import type { AdminProfile } from "@/lib/api-types"

function formatSegment(segment: string) { return segment.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ") }

export function TopNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const menuArea = useRef<HTMLDivElement>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const segments = pathname.split("/").filter(Boolean)

  useEffect(() => { authApi<AdminProfile>("session").then(setProfile).catch(() => undefined) }, [])
  useEffect(() => {
    function close(event: PointerEvent) { if (!menuArea.current?.contains(event.target as Node)) setProfileOpen(false) }
    document.addEventListener("pointerdown", close); return () => document.removeEventListener("pointerdown", close)
  }, [])
  async function logout() { await authApi("logout", { method: "POST" }).catch(() => undefined); router.replace("/login"); router.refresh() }

  return <header className="relative z-30 flex h-16 shrink-0 items-center gap-3 border-b bg-background/95 px-4 sm:px-6">
    <SidebarTrigger className="md:hidden" aria-label="Open navigation" /><Separator orientation="vertical" className="h-5 md:hidden" />
    <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 text-sm sm:flex"><Link href="/" className="font-medium text-muted-foreground">Dashboard</Link>{segments.map((segment, index) => { const href = "/" + segments.slice(0, index + 1).join("/"); return <span className="flex items-center gap-1.5" key={href}><ChevronRight className="size-3.5 text-muted-foreground" />{index === segments.length - 1 ? <span className="font-medium">{formatSegment(segment)}</span> : <Link href={href}>{formatSegment(segment)}</Link>}</span> })}</nav>
    <div className="ml-auto flex items-center gap-2" ref={menuArea}><ThemeToggle /><div className="relative"><Button variant="ghost" className="h-10 gap-2 px-2" onClick={() => setProfileOpen((value) => !value)}><span className="flex size-7 items-center justify-center rounded-full bg-neutral-950 text-white"><UserRound className="size-3.5" /></span><span className="hidden text-left sm:block"><span className="block text-xs font-medium">{profile?.name || "Administrator"}</span><span className="block text-[10px] text-muted-foreground">{profile?.role || "Admin"}</span></span><ChevronDown className="size-3.5" /></Button>
      {profileOpen && <div className="absolute right-0 top-12 w-56 rounded-xl border bg-popover p-1.5 shadow-xl"><div className="px-2.5 py-2"><p className="text-sm font-medium">{profile?.name || "Administrator"}</p><p className="truncate text-xs text-muted-foreground">{profile?.email || "Loading account…"}</p></div><Separator className="my-1" /><Link href="/profile" className="flex h-9 items-center gap-2 rounded-lg px-2.5 text-sm hover:bg-muted"><UserRound className="size-4" />Profile</Link><button onClick={() => void logout()} className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-sm hover:bg-muted"><LogOut className="size-4" />Logout</button></div>}
    </div></div>
  </header>
}
