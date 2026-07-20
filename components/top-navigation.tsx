"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { FormEvent, useEffect, useRef, useState } from "react"
import {
  Bell,
  ChevronDown,
  ChevronRight,
  KeyRound,
  LogOut,
  Search,
  UserRound,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"

function formatSegment(segment: string) {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export function TopNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const menuArea = useRef<HTMLDivElement>(null)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const segments = pathname.split("/").filter(Boolean)

  useEffect(() => {
    function closeMenus(event: PointerEvent) {
      if (!menuArea.current?.contains(event.target as Node)) {
        setNotificationsOpen(false)
        setProfileOpen(false)
      }
    }

    document.addEventListener("pointerdown", closeMenus)
    return () => document.removeEventListener("pointerdown", closeMenus)
  }, [])

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
  }

  function logout() {
    document.cookie = "admin_session=; path=/; max-age=0; SameSite=Lax"
    router.replace("/login")
    router.refresh()
  }

  return (
    <header className="relative z-30 flex h-16 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6">
      <SidebarTrigger className="md:hidden" aria-label="Open navigation" />
      <Separator orientation="vertical" className="h-5 md:hidden" />

      <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 text-sm sm:flex">
        <Link href="/" className="font-medium text-muted-foreground transition-colors hover:text-foreground">
          Dashboard
        </Link>
        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`
          const last = index === segments.length - 1
          return (
            <span className="flex min-w-0 items-center gap-1.5" key={href}>
              <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" aria-hidden="true" />
              {last ? (
                <span className="truncate font-medium">{formatSegment(segment)}</span>
              ) : (
                <Link href={href} className="truncate text-muted-foreground hover:text-foreground">{formatSegment(segment)}</Link>
              )}
            </span>
          )
        })}
      </nav>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2" ref={menuArea}>
        <form onSubmit={handleSearch} role="search" className="relative hidden w-44 lg:block xl:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input type="search" aria-label="Global search" placeholder="Search anything…" className="h-9 bg-muted/45 pl-9 pr-12" />
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">⌘ K</kbd>
        </form>

        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Search">
          <Search aria-hidden="true" />
        </Button>

        <div className="hidden h-8 items-center gap-2 rounded-lg border px-2.5 text-xs font-medium text-muted-foreground md:flex" title="Live connection active">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-50" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          Live
        </div>

        <ThemeToggle />

        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            onClick={() => {
              setNotificationsOpen((open) => !open)
              setProfileOpen(false)
            }}
            className="relative"
          >
            <Bell aria-hidden="true" />
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-neutral-950 ring-2 ring-background" />
          </Button>
          {notificationsOpen && (
            <div className="absolute right-0 top-11 w-[min(22rem,calc(100vw-2rem))] rounded-xl border bg-popover p-2 text-popover-foreground shadow-xl">
              <div className="flex items-center justify-between px-2 py-2">
                <p className="text-sm font-semibold">Notifications</p>
                <button className="text-xs text-muted-foreground hover:text-foreground">Mark all read</button>
              </div>
              <Separator />
              <div className="space-y-1 pt-1">
                <div className="rounded-lg bg-muted/60 p-3">
                  <p className="text-sm font-medium">Live tracking connected</p>
                  <p className="mt-1 text-xs text-muted-foreground">Field location updates are being received normally.</p>
                </div>
                <div className="rounded-lg p-3 hover:bg-muted/60">
                  <p className="text-sm font-medium">Attendance report ready</p>
                  <p className="mt-1 text-xs text-muted-foreground">Today’s attendance summary is available.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <Button
            variant="ghost"
            className="h-10 gap-2 px-1.5 sm:pr-2"
            aria-expanded={profileOpen}
            onClick={() => {
              setProfileOpen((open) => !open)
              setNotificationsOpen(false)
            }}
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-neutral-950 text-white">
              <UserRound className="size-3.5" aria-hidden="true" />
            </span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-xs font-medium">Administrator</span>
              <span className="block text-[10px] font-normal text-muted-foreground">Admin</span>
            </span>
            <ChevronDown className="hidden size-3.5 text-muted-foreground sm:block" aria-hidden="true" />
          </Button>
          {profileOpen && (
            <div className="absolute right-0 top-12 w-56 rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-xl">
              <div className="px-2.5 py-2">
                <p className="text-sm font-medium">Administrator</p>
                <p className="truncate text-xs text-muted-foreground">admin@example.com</p>
              </div>
              <Separator className="my-1" />
              <Link href="/profile" className="flex h-9 items-center gap-2 rounded-lg px-2.5 text-sm hover:bg-muted">
                <UserRound className="size-4" /> Profile
              </Link>
              <Link href="/change-password" className="flex h-9 items-center gap-2 rounded-lg px-2.5 text-sm hover:bg-muted">
                <KeyRound className="size-4" /> Change password
              </Link>
              <Separator className="my-1" />
              <button onClick={logout} className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-sm hover:bg-muted">
                <LogOut className="size-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
