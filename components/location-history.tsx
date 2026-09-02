"use client"

import { useState } from "react"
import { MapPin, RefreshCw } from "lucide-react"

import { ApiError, ApiLoading } from "@/components/api-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { RouteHistoryMap, type HistoryPoint } from "@/components/route-history-map"
import { useAdminResource } from "@/hooks/use-admin-resource"
import { adminApi } from "@/lib/admin-api"
import type { FieldUser } from "@/lib/api-types"

export function LocationHistory() {
  const users = useAdminResource<FieldUser[]>("field-users", [])
  const [userId, setUserId] = useState("")
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [points, setPoints] = useState<HistoryPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function load() {
    const selectedUserId = userId || users.data[0]?.id || ""
    if (!selectedUserId) return
    setLoading(true); setError("")
    try {
      const from = new Date(date + "T00:00:00").toISOString()
      const to = new Date(date + "T23:59:59.999").toISOString()
      setPoints(await adminApi<HistoryPoint[]>("locations/history?userId=" + encodeURIComponent(selectedUserId) + "&from=" + encodeURIComponent(from) + "&to=" + encodeURIComponent(to) + "&limit=2000"))
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to load location history.") }
    finally { setLoading(false) }
  }

  const effectiveUserId = userId || users.data[0]?.id || ""
  const selected = users.data.find((user) => user.id === effectiveUserId)
  return <main className="flex-1 bg-muted/20 p-4 sm:p-6"><div className="mx-auto max-w-[1500px] space-y-5">
    <div><h1 className="text-2xl font-semibold">Location history</h1><p className="text-sm text-muted-foreground">Review the stored route for one mobile user and date.</p></div>
    {(users.error || error) && <ApiError message={users.error || error} />}
    <Card><CardContent className="grid gap-4 p-4 sm:grid-cols-[1fr_220px_auto]"><label className="text-xs text-muted-foreground">Field user<select value={effectiveUserId} onChange={(event) => setUserId(event.target.value)} className="mt-1.5 h-10 w-full rounded-md border bg-background px-3 text-sm text-foreground"><option value="">Choose a user</option>{users.data.map((user) => <option key={user.id} value={user.id}>{user.name} · {user.employeeCode}</option>)}</select></label><label className="text-xs text-muted-foreground">Date<Input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-1.5" /></label><Button className="self-end" onClick={load} disabled={!effectiveUserId || loading}><RefreshCw className={loading ? "animate-spin" : ""} /> Load history</Button></CardContent></Card>
    {users.loading ? <ApiLoading label="Loading field users…" /> : <section className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_380px]"><Card className="overflow-hidden"><CardContent className="p-0"><div className="flex items-center justify-between border-b p-4"><div><h2 className="font-semibold">Route map</h2><p className="text-xs text-muted-foreground">{selected?.name || "No user selected"} · {date}</p></div><Badge variant="secondary">{points.length} points</Badge></div><RouteHistoryMap points={points} /></CardContent></Card>
      <Card><CardContent className="p-0"><div className="border-b p-4"><h2 className="font-semibold">GPS timeline</h2></div><div className="max-h-[570px] divide-y overflow-y-auto">{points.map((point) => <div className="p-4" key={point.id}><div className="flex justify-between gap-2"><p className="flex gap-1 text-sm font-medium"><MapPin className="size-4" />{point.area || point.address || "Coordinates"}</p><span className="text-xs text-muted-foreground">{new Date(point.capturedAt).toLocaleTimeString()}</span></div><p className="mt-1 text-xs text-muted-foreground">{point.latitude.toFixed(6)}, {point.longitude.toFixed(6)} · {point.eventType}</p></div>)}</div>{!points.length && <p className="p-10 text-center text-sm text-muted-foreground">No route loaded.</p>}</CardContent></Card>
    </section>}
  </div></main>
}
