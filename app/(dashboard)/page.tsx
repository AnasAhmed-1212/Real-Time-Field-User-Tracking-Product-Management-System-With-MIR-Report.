import Link from "next/link"
import {
  ArrowUpRight,
  CheckCircle2,
  CircleOff,
  ClipboardCheck,
  Clock3,
  LogOut,
  MapPin,
  PackageCheck,
  UserCheck,
  UsersRound,
  Wifi,
  WifiOff,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { LiveMapPreview } from "@/components/live-map-preview"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const stats = [
  { label: "Total field users", value: "124", detail: "+6 this month", icon: UsersRound },
  { label: "Currently checked in", value: "86", detail: "69% of team", icon: UserCheck },
  { label: "Online users", value: "73", detail: "Live now", icon: Wifi, tone: "online" },
  { label: "Offline users", value: "13", detail: "4 recently offline", icon: WifiOff },
  { label: "Active products", value: "48", detail: "3 low inventory", icon: PackageCheck },
  { label: "Activities today", value: "216", detail: "+18% from yesterday", icon: ClipboardCheck },
]

const attendance = [
  { label: "Checked in today", value: 86, icon: CheckCircle2, color: "bg-emerald-500", width: "69%" },
  { label: "Checked out", value: 41, icon: LogOut, color: "bg-blue-500", width: "33%" },
  { label: "Late", value: 7, icon: Clock3, color: "bg-amber-500", width: "6%" },
  { label: "Absent", value: 12, icon: CircleOff, color: "bg-red-500", width: "10%" },
]

const activities = [
  { user: "Ahmed Raza", initials: "AR", activity: "Retail visit completed", time: "10:42 AM", area: "Gulberg III", status: "Completed" },
  { user: "Sara Khan", initials: "SK", activity: "New order submitted", time: "10:28 AM", area: "DHA Phase 5", status: "Submitted" },
  { user: "Bilal Ahmed", initials: "BA", activity: "Outlet check-in", time: "10:14 AM", area: "Model Town", status: "In progress" },
  { user: "Ayesha Malik", initials: "AM", activity: "Product audit completed", time: "9:56 AM", area: "Johar Town", status: "Completed" },
  { user: "Usman Ali", initials: "UA", activity: "Client follow-up", time: "9:31 AM", area: "Cantt", status: "Pending" },
]

const offlineUsers = [
  { name: "Hamza Iqbal", initials: "HI", seen: "11 min ago", location: "Liberty Market", offline: "11m" },
  { name: "Nida Fatima", initials: "NF", seen: "24 min ago", location: "Township", offline: "24m" },
  { name: "Danish Noor", initials: "DN", seen: "38 min ago", location: "Wapda Town", offline: "38m" },
  { name: "Mariam Saeed", initials: "MS", seen: "1 hr ago", location: "Garden Town", offline: "1h" },
]

function statusVariant(status: string) {
  if (status === "Completed" || status === "Submitted") return "success" as const
  if (status === "In progress") return "warning" as const
  return "secondary" as const
}

export default function DashboardPage() {
  return (
    <main className="flex-1 bg-muted/25 p-4 sm:p-6 xl:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm text-muted-foreground">Tuesday, July 21</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Operational overview</h1>
          </div>
          <p className="text-sm text-muted-foreground">Last updated just now</p>
        </div>

        <section aria-label="Key statistics" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
          {stats.map((stat) => (
            <Card key={stat.label} className="rounded-xl shadow-none">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-foreground">
                    <stat.icon className="size-4.5" aria-hidden="true" />
                  </div>
                  {stat.tone === "online" && <span className="mt-1 size-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />}
                </div>
                <p className="mt-5 text-2xl font-semibold tracking-tight">{stat.value}</p>
                <p className="mt-1 text-sm font-medium">{stat.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.detail}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.75fr)]">
          <Card className="overflow-hidden rounded-xl shadow-none">
            <CardHeader className="flex-row items-center justify-between gap-4 border-b p-5">
              <div>
                <h2 className="font-semibold">Live map preview</h2>
                <p className="mt-1 text-xs text-muted-foreground">Latest reported locations from field users</p>
              </div>
              <Button render={<Link href="/live-tracking" />} nativeButton={false} variant="outline" size="sm">
                Open live map <ArrowUpRight aria-hidden="true" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <LiveMapPreview />
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-none">
            <CardHeader className="border-b p-5">
              <h2 className="font-semibold">Attendance overview</h2>
              <p className="text-xs text-muted-foreground">Today’s workforce attendance</p>
            </CardHeader>
            <CardContent className="space-y-6 p-5">
              {attendance.map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 text-sm">
                      <item.icon className="size-4 text-muted-foreground" aria-hidden="true" />
                      <span>{item.label}</span>
                    </div>
                    <span className="font-semibold tabular-nums">{item.value}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: item.width }} />
                  </div>
                </div>
              ))}
              <div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
                86 of 124 field users have checked in today.
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.75fr)]">
          <Card className="overflow-hidden rounded-xl shadow-none">
            <CardHeader className="flex-row items-center justify-between border-b p-5">
              <div>
                <h2 className="font-semibold">Recent activities</h2>
                <p className="mt-1 text-xs text-muted-foreground">Latest field submissions</p>
              </div>
              <Button variant="ghost" size="sm">View all <ArrowUpRight /></Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead><TableHead>Activity</TableHead><TableHead>Time</TableHead><TableHead>Area</TableHead><TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.map((item) => (
                    <TableRow key={`${item.user}-${item.time}`}>
                      <TableCell><div className="flex items-center gap-2.5"><span className="flex size-8 items-center justify-center rounded-full bg-muted text-[11px] font-semibold">{item.initials}</span><span className="whitespace-nowrap font-medium">{item.user}</span></div></TableCell>
                      <TableCell className="min-w-48">{item.activity}</TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">{item.time}</TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">{item.area}</TableCell>
                      <TableCell><Badge variant={statusVariant(item.status)}>{item.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-none">
            <CardHeader className="border-b p-5">
              <div className="flex items-center justify-between">
                <div><h2 className="font-semibold">Recently offline</h2><p className="mt-1 text-xs text-muted-foreground">Users who lost connection</p></div>
                <Badge variant="secondary">4 users</Badge>
              </div>
            </CardHeader>
            <CardContent className="divide-y p-0">
              {offlineUsers.map((user) => (
                <div className="flex items-start gap-3 p-4" key={user.name}>
                  <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold">
                    {user.initials}<span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-card bg-neutral-400" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2"><p className="truncate text-sm font-medium">{user.name}</p><span className="text-xs font-medium tabular-nums">{user.offline}</span></div>
                    <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground"><MapPin className="size-3" />{user.location}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">Last seen {user.seen}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}
