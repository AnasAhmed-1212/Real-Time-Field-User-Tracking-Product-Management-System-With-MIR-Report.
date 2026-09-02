"use client"

import Link from 'next/link'
import { ClipboardCheck, PackageCheck, UserCheck, UsersRound, Wifi, WifiOff } from 'lucide-react'

import { ApiError, ApiLoading } from '@/components/api-state'
import { LiveMapPreview } from '@/components/live-map-preview'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAdminResource } from '@/hooks/use-admin-resource'
import type { DashboardData } from '@/lib/api-types'

const empty: DashboardData = { date: '', stats: { totalUsers: 0, activeUsers: 0, onlineUsers: 0, offlineUsers: 0, checkedIn: 0, activeProducts: 0, activitiesToday: 0 }, attendance: { working: 0, late: 0, checkedOut: 0, absent: 0 }, recentActivities: [] }

export default function DashboardPage() {
  const { data, loading, error } = useAdminResource('dashboard', empty, 30_000)
  if (loading) return <main className="flex-1 bg-muted/25 p-6"><ApiLoading label="Loading dashboard…" /></main>
  const stats = [
    ['Total field users', data.stats.totalUsers, UsersRound], ['Currently checked in', data.stats.checkedIn, UserCheck],
    ['Online users', data.stats.onlineUsers, Wifi], ['Offline users', data.stats.offlineUsers, WifiOff],
    ['Active products', data.stats.activeProducts, PackageCheck], ['Activities today', data.stats.activitiesToday, ClipboardCheck],
  ] as const
  return <main className="flex-1 bg-muted/25 p-4 sm:p-6 xl:p-8"><div className="mx-auto max-w-[1600px] space-y-6">
    <div><p className="text-sm text-muted-foreground">{data.date || 'Today'}</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Operational overview</h1></div>
    {error && <ApiError message={error} />}
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">{stats.map(([label, value, Icon]) => <Card key={label} className="rounded-xl shadow-none"><CardContent className="p-4"><Icon className="size-5 text-muted-foreground" /><p className="mt-5 text-2xl font-semibold">{value}</p><p className="mt-1 text-sm font-medium">{label}</p></CardContent></Card>)}</section>
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.75fr)]">
      <Card className="overflow-hidden rounded-xl shadow-none"><CardHeader className="flex-row items-center justify-between border-b p-5"><div><h2 className="font-semibold">Live map preview</h2><p className="text-xs text-muted-foreground">Latest GPS updates from field users</p></div><Button render={<Link href="/live-tracking" />} nativeButton={false} variant="outline" size="sm">Open map</Button></CardHeader><CardContent className="p-0"><LiveMapPreview /></CardContent></Card>
      <Card className="rounded-xl shadow-none"><CardHeader className="border-b p-5"><h2 className="font-semibold">Attendance</h2></CardHeader><CardContent className="space-y-4 p-5">{Object.entries(data.attendance).map(([label, value]) => <div key={label} className="flex items-center justify-between border-b pb-3 last:border-0"><span className="text-sm capitalize text-muted-foreground">{label.replace(/([A-Z])/g, ' $1')}</span><span className="font-semibold">{value}</span></div>)}</CardContent></Card>
    </section>
    <Card className="overflow-hidden rounded-xl shadow-none"><CardHeader className="flex-row items-center justify-between border-b p-5"><div><h2 className="font-semibold">Recent activities</h2><p className="text-xs text-muted-foreground">Latest field submissions</p></div><Button render={<Link href="/activities" />} nativeButton={false} variant="ghost">View all</Button></CardHeader><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>User</TableHead><TableHead>Activity</TableHead><TableHead>Outlet</TableHead><TableHead>Submitted</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{data.recentActivities.map((item) => <TableRow key={item.id}><TableCell className="font-medium">{item.user?.name || 'Unknown user'}</TableCell><TableCell>{item.description}</TableCell><TableCell>{item.outletName || '—'}</TableCell><TableCell>{new Date(item.submittedAt).toLocaleString()}</TableCell><TableCell><Badge variant={item.status === 'Approved' ? 'success' : item.status === 'Flagged' ? 'destructive' : 'warning'}>{item.status}</Badge></TableCell></TableRow>)}</TableBody></Table>{!data.recentActivities.length && <div className="p-10 text-center text-sm text-muted-foreground">No activity has been submitted yet.</div>}</CardContent></Card>
  </div></main>
}
