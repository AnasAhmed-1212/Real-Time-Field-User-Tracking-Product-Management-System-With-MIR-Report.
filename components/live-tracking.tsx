"use client"

import { useMemo, useState } from "react"
import { Clock3, MapPin, RefreshCw, Search, Smartphone } from "lucide-react"

import { ApiError, ApiLoading } from "@/components/api-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAdminResource } from "@/hooks/use-admin-resource"
import { useLocationClock } from "@/hooks/use-location-clock"
import type { LiveLocation } from "@/lib/api-types"
import { InteractiveMap, type MapPoint } from "@/components/interactive-map"

function initials(name: string) {
  return name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()
}

function isOnline(item: LiveLocation, now: number) {
  return now - Date.parse(item.capturedAt) < 15 * 60_000
}

export function LiveTracking() {
  const now = useLocationClock()
  const { data, loading, error, refresh } = useAdminResource<LiveLocation[]>("locations/live", [], 15_000)
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState("")
  const filtered = useMemo(() => data.filter((item) => (item.user.name + " " + item.user.territory).toLowerCase().includes(query.toLowerCase())), [data, query])
  const selected = filtered.find((item) => item.user.id === selectedId) || filtered[0]
  const points = useMemo<MapPoint[]>(() => filtered.map((item) => ({
    id: item.user.id, latitude: item.latitude, longitude: item.longitude,
    label: initials(item.user.name), title: item.user.name,
    color: isOnline(item, now) ? "green" : "gray",
  })), [filtered, now])

  return <main className="flex min-h-0 flex-1 flex-col bg-muted/20">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b bg-background px-4 py-4 sm:px-6">
      <div><h1 className="text-xl font-semibold">Live tracking</h1><p className="text-sm text-muted-foreground">Latest mobile GPS events; refreshed every 15 seconds.</p></div>
      <Button variant="outline" onClick={() => refresh()}><RefreshCw /> Refresh</Button>
    </header>
    {error && <div className="p-4 sm:px-6"><ApiError message={error} /></div>}
    {loading ? <ApiLoading label="Loading live locations…" /> : <div className="grid min-h-0 flex-1 lg:grid-cols-[340px_minmax(0,1fr)]">
      <aside className="border-r bg-background">
        <div className="border-b p-4"><div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search field users…" className="pl-9" /></div></div>
        <div className="max-h-[70vh] divide-y overflow-y-auto">{filtered.map((item) => <button key={item.user.id} onClick={() => setSelectedId(item.user.id)} className={"flex w-full gap-3 p-4 text-left hover:bg-muted " + (selected?.user.id === item.user.id ? "bg-muted" : "")}>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">{initials(item.user.name)}</span>
          <span className="min-w-0 flex-1"><span className="flex items-center justify-between"><b className="truncate text-sm">{item.user.name}</b><span className={"size-2 rounded-full " + (isOnline(item, now) ? "bg-emerald-500" : "bg-neutral-400")} /></span><span className="mt-1 block truncate text-xs text-muted-foreground">{item.area || item.user.territory || "Area not reported"}</span><span className="mt-1 block text-[11px] text-muted-foreground">{new Date(item.capturedAt).toLocaleString()}</span></span>
        </button>)}</div>
        {!filtered.length && <p className="p-8 text-center text-sm text-muted-foreground">No mobile locations match this search.</p>}
      </aside>
      <section className="relative min-h-[620px] bg-[#edf0eb]">
        <InteractiveMap points={points} selectedId={selectedId} onSelect={setSelectedId} emptyMessage={query ? "No mobile locations match this search." : error ? "Location updates are temporarily unavailable." : undefined} />
        {selected && <Card className="absolute inset-x-4 bottom-12 max-w-md shadow-xl sm:left-auto sm:w-96"><CardContent className="space-y-3 p-5">
          <div className="flex items-center justify-between"><b>{selected.user.name}</b><Badge variant={isOnline(selected, now) ? "success" : "secondary"}>{isOnline(selected, now) ? "Online" : "Stale"}</Badge></div>
          <p className="flex gap-2 text-sm"><MapPin className="size-4 shrink-0" />{selected.address || selected.area || selected.user.territory || selected.latitude + ", " + selected.longitude}</p>
          <p className="flex gap-2 text-sm text-muted-foreground"><Clock3 className="size-4" />{new Date(selected.capturedAt).toLocaleString()} · ±{Math.round(selected.accuracy || 0)}m</p>
          <p className="flex gap-2 text-sm text-muted-foreground"><Smartphone className="size-4" />{selected.device?.platform || "Unknown device"} · {selected.network?.type || "Unknown network"}</p>
          <a className="text-sm font-medium underline" href={"https://www.google.com/maps?q=" + selected.latitude + "," + selected.longitude} target="_blank" rel="noreferrer">Open coordinates in Google Maps</a>
        </CardContent></Card>}
      </section>
    </div>}
  </main>
}
