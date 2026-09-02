"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  Activity,
  Box,
  Boxes,
  ChevronRight,
  ChevronsUpDown,
  Clock3,
  Download,
  Gauge,
  LogOut,
  MapPinned,
  Settings,
  UserRound,
  UsersRound,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { authApi } from "@/lib/admin-api"
import type { AdminProfile } from "@/lib/api-types"

const navigation = [
  { title: "Dashboard", href: "/", icon: Gauge },
  { title: "Live Tracking", href: "/live-tracking", icon: MapPinned },
  { title: "Attendance", href: "/attendance", icon: Clock3 },
  { title: "Field Users", href: "/field-users", icon: UsersRound },
  { title: "Products", href: "/products", icon: Boxes },
  { title: "Activities", href: "/activities", icon: Activity },
  { title: "Location History", href: "/location-history", icon: MapPinned },
  { title: "APK Releases", href: "/apk-releases", icon: Download },
  { title: "Settings", href: "/settings", icon: Settings },
]

function isCurrentPage(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname.startsWith(href)
}

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [accountOpen, setAccountOpen] = useState(false)
  const [profile, setProfile] = useState<AdminProfile | null>(null)

  useEffect(() => { authApi<AdminProfile>("session").then(setProfile).catch(() => undefined) }, [])

  async function logout() {
    await authApi("logout", { method: "POST" }).catch(() => undefined)
    router.replace("/login")
    router.refresh()
  }

  return (
    <Sidebar
      collapsible="icon"
      className="[--sidebar:#fafafa] [--sidebar-accent:#f0f0f0] [--sidebar-accent-foreground:#171717] [--sidebar-border:#e5e5e5] [--sidebar-foreground:#171717] [--sidebar-ring:#a3a3a3] dark:[--sidebar:#171717] dark:[--sidebar-accent:#2a2a2a] dark:[--sidebar-accent-foreground:#fafafa] dark:[--sidebar-border:#303030] dark:[--sidebar-foreground:#fafafa] dark:[--sidebar-ring:#737373]"
    >
      <SidebarHeader className="p-2">
        <Link
          href="/"
          className="flex h-10 items-center gap-2 overflow-hidden rounded-md px-0 outline-none ring-sidebar-ring focus-visible:ring-2"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white shadow-sm">
            <Box className="size-4.5" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1 leading-tight group-data-[collapsible=icon]:hidden">
            <span className="block truncate text-sm font-semibold">Sales Management</span>
            <span className="block truncate text-xs text-sidebar-foreground/65">Admin Portal</span>
          </span>
          <ChevronsUpDown className="size-4 shrink-0 group-data-[collapsible=icon]:hidden" aria-hidden="true" />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="px-2 py-0">
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.slice(0, 4).map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={isCurrentPage(pathname, item.href)}
                    tooltip={item.title}
                    className="h-8 gap-3 px-2 font-normal"
                  >
                    <item.icon aria-hidden="true" />
                    <span className="flex-1">{item.title}</span>
                    <ChevronRight
                      className="ml-auto size-4 group-data-[collapsible=icon]:hidden"
                      aria-hidden="true"
                    />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-3 px-2 py-0">
          <SidebarGroupLabel className="px-2 text-xs font-normal">Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.slice(4).map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={isCurrentPage(pathname, item.href)}
                    tooltip={item.title}
                    className="h-8 gap-3 px-2 font-normal"
                  >
                    <item.icon aria-hidden="true" />
                    <span className="flex-1">{item.title}</span>
                    <ChevronRight
                      className="ml-auto size-4 group-data-[collapsible=icon]:hidden"
                      aria-hidden="true"
                    />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              type="button"
              onClick={() => setAccountOpen((open) => !open)}
              aria-expanded={accountOpen}
              tooltip="Administrator profile"
              className="h-12 gap-2 px-1"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 via-violet-500 to-cyan-400 text-white ring-1 ring-black/15">
                <UserRound className="size-4.5" aria-hidden="true" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col leading-tight">
                <span className="truncate font-medium">{profile?.name || "Administrator"}</span>
                <span className="truncate text-xs text-sidebar-foreground/65">{profile?.email || "Signed in"}</span>
              </span>
              <ChevronsUpDown className="size-4 group-data-[collapsible=icon]:hidden" aria-hidden="true" />
            </SidebarMenuButton>
          </SidebarMenuItem>
          {accountOpen && (
            <>
              <SidebarMenuItem className="group-data-[collapsible=icon]:hidden">
                <SidebarMenuButton render={<Link href="/profile" />} className="h-8 gap-3 px-2">
                  <UserRound aria-hidden="true" /><span>Profile</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem className="group-data-[collapsible=icon]:hidden">
                <SidebarMenuButton type="button" onClick={() => { void logout() }} className="h-8 gap-3 px-2">
                  <LogOut aria-hidden="true" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
