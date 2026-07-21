"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  AlertCircle,
  ArrowUpRight,
  ChevronRight,
  Clock3,
  History,
  LocateFixed,
  MapPin,
  Maximize2,
  RefreshCw,
  Search,
  Signal,
  SignalLow,
  Smartphone,
  UserRound,
  WifiOff,
  ZoomIn,
  ZoomOut,
} from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { loadGoogleMaps } from "@/lib/google-maps"

type UserStatus = "moving" | "inactive" | "offline" | "permission" | "network"
type MapState = "loading" | "ready" | "preview" | "error"
type ConnectionState = "connected" | "disconnected" | "reconnecting" | "restored"

type FieldUser = {
  id: number
  name: string
  initials: string
  status: UserStatus
  statusLabel: string
  area: string
  lat: number
  lng: number
  checkIn: string
  updated: string
  device: string
  network: string
  mapLeft: string
  mapTop: string
}

const users: FieldUser[] = [
  { id: 1, name: "Ahmed Raza", initials: "AR", status: "moving", statusLabel: "Online · Moving", area: "Gulberg III", lat: 31.5204, lng: 74.3587, checkIn: "8:42 AM", updated: "Just now", device: "Android 14 · 82%", network: "4G · Strong", mapLeft: "29%", mapTop: "31%" },
  { id: 2, name: "Sara Khan", initials: "SK", status: "inactive", statusLabel: "Online · Inactive", area: "DHA Phase 5", lat: 31.4708, lng: 74.4112, checkIn: "9:01 AM", updated: "4 min ago", device: "Android 13 · 64%", network: "4G · Good", mapLeft: "64%", mapTop: "25%" },
  { id: 3, name: "Hamza Iqbal", initials: "HI", status: "offline", statusLabel: "Offline", area: "Liberty Market", lat: 31.5102, lng: 74.3441, checkIn: "8:37 AM", updated: "18 min ago", device: "Android 12 · 31%", network: "Disconnected", mapLeft: "47%", mapTop: "51%" },
  { id: 4, name: "Nida Fatima", initials: "NF", status: "permission", statusLabel: "Permission disabled", area: "Township", lat: 31.4504, lng: 74.3062, checkIn: "9:12 AM", updated: "Location unavailable", device: "Android 14 · 72%", network: "Wi-Fi · Good", mapLeft: "31%", mapTop: "72%" },
  { id: 5, name: "Bilal Ahmed", initials: "BA", status: "network", statusLabel: "Network issue", area: "Model Town", lat: 31.4834, lng: 74.3239, checkIn: "8:54 AM", updated: "9 min ago", device: "Android 11 · 47%", network: "2G · Unstable", mapLeft: "71%", mapTop: "69%" },
]

const statusStyle: Record<UserStatus, { marker: string; dot: string; label: string }> = {
  moving: { marker: "bg-emerald-500", dot: "bg-emerald-500", label: "Online and moving" },
  inactive: { marker: "bg-amber-500", dot: "bg-amber-500", label: "Online but inactive" },
  offline: { marker: "bg-neutral-500", dot: "bg-neutral-400", label: "Offline" },
  permission: { marker: "bg-red-500", dot: "bg-red-500", label: "Permission disabled" },
  network: { marker: "bg-orange-500", dot: "bg-orange-500", label: "Network issue" },
}

function markerElement(user: FieldUser) {
  const element = document.createElement("button")
  element.type = "button"
  element.title = user.name
  element.className = `flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-white text-white shadow-lg ${statusStyle[user.status].marker}`
  element.innerHTML = `<span style="font-size:10px;font-weight:700">${user.initials}</span>`
  return element
}

export function LiveTracking() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const mapElement = useRef<HTMLDivElement>(null)
  const [mapState, setMapState] = useState<MapState>(() => apiKey ? "loading" : "preview")
  const [connection, setConnection] = useState<ConnectionState>("connected")
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<UserStatus | "all">("all")
  const [area, setArea] = useState("all")
  const [lastUpdate, setLastUpdate] = useState("all")
  const [selectedId, setSelectedId] = useState(1)

  const filteredUsers = useMemo(() => users.filter((user) => {
    const matchesQuery = user.name.toLowerCase().includes(query.toLowerCase()) || user.area.toLowerCase().includes(query.toLowerCase())
    const matchesUpdate = lastUpdate === "all" || lastUpdate === "60" || (lastUpdate === "5" && [1, 2].includes(user.id)) || (lastUpdate === "15" && [1, 2, 5].includes(user.id))
    return matchesQuery && matchesUpdate && (status === "all" || user.status === status) && (area === "all" || user.area === area)
  }), [area, lastUpdate, query, status])

  const selected = users.find((user) => user.id === selectedId) ?? users[0]
  const markerKey = filteredUsers.map((user) => user.id).join(",")

  useEffect(() => {
    if (!apiKey || !mapElement.current) return
    let cancelled = false

    loadGoogleMaps(apiKey)
      .then(async (google) => {
        await Promise.all([google.maps.importLibrary("maps"), google.maps.importLibrary("marker")])
        if (cancelled || !mapElement.current) return
        const map = new google.maps.Map(mapElement.current, {
          center: { lat: 31.5007, lng: 74.3587 }, zoom: 12,
          mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID",
          disableDefaultUI: true, zoomControl: true, fullscreenControl: true,
        })
        filteredUsers.filter((user) => user.status !== "permission").forEach((user) => {
          const marker = new google.maps.marker.AdvancedMarkerElement({
            map, position: { lat: user.lat, lng: user.lng }, title: user.name, content: markerElement(user),
          })
          marker.addListener("click", () => setSelectedId(user.id))
        })
        setMapState("ready")
      })
      .catch(() => { if (!cancelled) setMapState("error") })

    return () => { cancelled = true }
  }, [apiKey, markerKey, filteredUsers])

  function reconnect() {
    setConnection("reconnecting")
    window.setTimeout(() => {
      setConnection("restored")
      window.setTimeout(() => setConnection("connected"), 2500)
    }, 1200)
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-muted/20">
      <div className="flex flex-col gap-3 border-b bg-background px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div><h1 className="text-xl font-semibold tracking-tight">Live tracking</h1><p className="mt-0.5 text-sm text-muted-foreground">Monitor field users and incoming locations in real time.</p></div>
        <div className="flex items-center gap-2">
          <Badge variant={connection === "connected" || connection === "restored" ? "success" : "warning"} className="h-7 px-3">
            <span className={`size-1.5 rounded-full ${connection === "connected" || connection === "restored" ? "bg-emerald-500" : "bg-amber-500"}`} />
            {connection === "connected" ? "Live connection" : connection === "restored" ? "Connection restored" : connection === "reconnecting" ? "Reconnecting…" : "Socket disconnected"}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => setConnection("disconnected")} className="hidden sm:inline-flex">Test connection</Button>
        </div>
      </div>

      {(connection === "disconnected" || connection === "reconnecting") && (
        <Alert variant="warning" className="m-4 mb-0 rounded-xl sm:mx-6">
          <WifiOff aria-hidden="true" /><AlertTitle>{connection === "disconnected" ? "Live socket disconnected" : "Reconnecting to live service"}</AlertTitle>
          <AlertDescription>{connection === "disconnected" ? "Map locations may be out of date." : "Trying to restore live location updates…"}</AlertDescription>
          {connection === "disconnected" && <Button size="sm" variant="outline" onClick={reconnect} className="col-start-2 mt-2 w-fit"><RefreshCw /> Reconnect</Button>}
        </Alert>
      )}

      <div className="grid min-h-0 flex-1 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="flex max-h-[48rem] min-h-0 flex-col border-b bg-background lg:max-h-none lg:border-b-0 lg:border-r">
          <div className="space-y-4 border-b p-4">
            <div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search users or areas…" className="h-10 pl-9" /></div>
            <div className="flex flex-wrap gap-1.5">
              {(["all", "moving", "inactive", "offline", "permission", "network"] as const).map((value) => (
                <button key={value} onClick={() => setStatus(value)} className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${status === value ? "border-neutral-900 bg-neutral-900 text-white" : "bg-background hover:bg-muted"}`}>
                  {value === "all" ? "All statuses" : statusStyle[value].label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-muted-foreground">Area<select value={area} onChange={(event) => setArea(event.target.value)} className="mt-1.5 h-9 w-full rounded-lg border bg-background px-2 text-sm text-foreground"><option value="all">All areas</option>{users.map((user) => <option value={user.area} key={user.area}>{user.area}</option>)}</select></label>
              <label className="text-xs text-muted-foreground">Last update<select value={lastUpdate} onChange={(event) => setLastUpdate(event.target.value)} className="mt-1.5 h-9 w-full rounded-lg border bg-background px-2 text-sm text-foreground"><option value="all">Any time</option><option value="5">Last 5 min</option><option value="15">Last 15 min</option><option value="60">Last hour</option></select></label>
            </div>
          </div>
          <div className="flex items-center justify-between border-b px-4 py-2.5 text-xs"><span className="font-medium">{filteredUsers.length} users</span><span className="text-muted-foreground">Updated now</span></div>
          <div className="min-h-0 flex-1 divide-y overflow-y-auto">
            {filteredUsers.length ? filteredUsers.map((user) => (
              <button key={user.id} onClick={() => setSelectedId(user.id)} className={`flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted/50 ${selected.id === user.id ? "bg-muted" : ""}`}>
                <span className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold">{user.initials}<span className={`absolute bottom-0 right-0 size-3 rounded-full border-2 border-white ${statusStyle[user.status].dot}`} /></span>
                <span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className="truncate text-sm font-medium">{user.name}</span><span className="text-[10px] text-muted-foreground">{user.updated}</span></span><span className="mt-1 block text-xs text-muted-foreground">{user.statusLabel}</span><span className="mt-1 flex items-center gap-1 truncate text-[11px] text-muted-foreground"><MapPin className="size-3" />{user.area}</span></span>
                <ChevronRight className="mt-3 size-4 shrink-0 text-muted-foreground" />
              </button>
            )) : <div className="flex flex-col items-center px-6 py-12 text-center"><UserRound className="size-8 text-muted-foreground" /><p className="mt-3 text-sm font-medium">No active users</p><p className="mt-1 text-xs text-muted-foreground">No users match the selected filters.</p><Button variant="outline" size="sm" onClick={() => { setStatus("all"); setArea("all"); setQuery("") }} className="mt-4">Clear filters</Button></div>}
          </div>
        </aside>

        <section className="relative min-h-[600px] overflow-hidden bg-[#edf0eb] lg:min-h-0">
          {mapState === "loading" && <div className="absolute inset-0 z-30 space-y-4 bg-background p-6"><Skeleton className="h-full w-full rounded-xl" /><div className="absolute inset-0 flex items-center justify-center"><Badge variant="secondary" className="h-8 px-3"><RefreshCw className="animate-spin" /> Loading map…</Badge></div></div>}
          {mapState === "error" && <div className="absolute inset-0 z-30 flex items-center justify-center bg-muted p-6"><Card className="max-w-sm"><CardContent className="p-6 text-center"><AlertCircle className="mx-auto size-8 text-destructive" /><h2 className="mt-4 font-semibold">Google Maps error</h2><p className="mt-2 text-sm text-muted-foreground">The map could not be loaded. Check your API key, Map ID, billing, and network connection.</p><Button variant="outline" onClick={() => window.location.reload()} className="mt-5"><RefreshCw /> Try again</Button></CardContent></Card></div>}
          <div ref={mapElement} className={`absolute inset-0 ${mapState === "ready" ? "block" : "hidden"}`} />

          {mapState === "preview" && <PreviewMap filteredUsers={filteredUsers} selectedId={selected.id} onSelect={setSelectedId} />}

          {mapState === "preview" && <Badge variant="outline" className="absolute left-4 top-4 z-10 h-7 bg-white/95 px-3 shadow-sm">Preview mode · Add Google Maps API key for live map</Badge>}
          <div className="absolute right-4 top-4 z-10 flex flex-col gap-2">
            {[{ icon: ZoomIn, label: "Zoom in" }, { icon: ZoomOut, label: "Zoom out" }, { icon: LocateFixed, label: "Center map" }, { icon: Maximize2, label: "Fullscreen" }].map((control) => <Button key={control.label} variant="outline" size="icon" className="bg-white shadow-sm" aria-label={control.label}><control.icon /></Button>)}
          </div>

          <div className="absolute bottom-4 left-4 z-10 hidden flex-wrap items-center gap-3 rounded-xl border bg-white/95 px-3 py-2 text-[11px] shadow-lg sm:flex">
            {(Object.keys(statusStyle) as UserStatus[]).map((key) => <span className="flex items-center gap-1.5" key={key}><span className={`size-2 rounded-full ${statusStyle[key].dot}`} />{statusStyle[key].label}</span>)}
          </div>

          <UserInformationCard user={selected} />
        </section>
      </div>
    </main>
  )
}

function PreviewMap({ filteredUsers, selectedId, onSelect }: { filteredUsers: FieldUser[]; selectedId: number; onSelect: (id: number) => void }) {
  return <div className="absolute inset-0 overflow-hidden"><div className="absolute inset-0 opacity-60 [background-image:linear-gradient(#d8ddd5_1px,transparent_1px),linear-gradient(90deg,#d8ddd5_1px,transparent_1px)] [background-size:48px_48px]" /><div className="absolute -left-8 top-[30%] h-12 w-[115%] rotate-[8deg] border-y-2 border-white bg-[#d7e0ea]" /><div className="absolute left-[42%] top-[-10%] h-[125%] w-10 rotate-[18deg] border-x border-white bg-white/80" /><div className="absolute left-[5%] top-[72%] h-7 w-[90%] -rotate-[5deg] border-y border-white bg-white/80" />{filteredUsers.map((user) => <button key={user.id} onClick={() => onSelect(user.id)} className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 ${user.status === "permission" ? "animate-pulse" : ""}`} style={{ left: user.mapLeft, top: user.mapTop }}><span className={`flex size-9 items-center justify-center rounded-full border-[3px] border-white text-[10px] font-bold text-white shadow-lg transition-transform ${statusStyle[user.status].marker} ${selectedId === user.id ? "scale-125 ring-4 ring-white/60" : "hover:scale-110"}`}>{user.status === "permission" ? <AlertCircle className="size-4" /> : user.initials}</span></button>)}</div>
}

function UserInformationCard({ user }: { user: FieldUser }) {
  return (
    <Card className="absolute bottom-16 right-4 z-20 w-[calc(100%-2rem)] max-w-sm rounded-xl shadow-2xl sm:bottom-16">
      <CardContent className="p-4">
        <div className="flex items-start gap-3"><span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold">{user.initials}</span><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><h2 className="truncate font-semibold">{user.name}</h2><Badge variant={user.status === "moving" ? "success" : user.status === "permission" ? "destructive" : "secondary"}>{user.statusLabel}</Badge></div><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3" />{user.area}</p></div></div>
        {user.status === "permission" && <Alert variant="destructive" className="mt-3"><AlertCircle /><AlertTitle>Location permission disabled</AlertTitle><AlertDescription>This user must enable precise location access.</AlertDescription></Alert>}
        {user.status === "offline" && <Alert className="mt-3"><Clock3 /><AlertTitle>Stale location</AlertTitle><AlertDescription>The last known position is 18 minutes old.</AlertDescription></Alert>}
        {user.status === "network" && <Alert variant="warning" className="mt-3"><SignalLow /><AlertTitle>Network issue</AlertTitle><AlertDescription>Updates may arrive with a delay.</AlertDescription></Alert>}
        <Separator className="my-4" />
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
          <div><dt className="text-muted-foreground">Coordinates</dt><dd className="mt-1 font-medium tabular-nums">{user.lat.toFixed(4)}, {user.lng.toFixed(4)}</dd></div>
          <div><dt className="text-muted-foreground">Checked in</dt><dd className="mt-1 font-medium">{user.checkIn}</dd></div>
          <div><dt className="text-muted-foreground">Last updated</dt><dd className="mt-1 font-medium">{user.updated}</dd></div>
          <div><dt className="text-muted-foreground">Device</dt><dd className="mt-1 flex items-center gap-1 font-medium"><Smartphone className="size-3" />{user.device}</dd></div>
          <div className="col-span-2"><dt className="text-muted-foreground">Network status</dt><dd className="mt-1 flex items-center gap-1 font-medium"><Signal className="size-3" />{user.network}</dd></div>
        </dl>
        <Button variant="outline" className="mt-4 w-full"><History /> View complete history <ArrowUpRight className="ml-auto" /></Button>
      </CardContent>
    </Card>
  )
}
