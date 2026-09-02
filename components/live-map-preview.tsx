"use client"

import { useState } from "react"
import { MapPin, RefreshCw } from "lucide-react"

import { ApiError } from "@/components/api-state"
import { Badge } from "@/components/ui/badge"
import { useAdminResource } from "@/hooks/use-admin-resource"
import type { LiveLocation } from "@/lib/api-types"

function position(value: number, min: number, max: number) {
  if (max === min) return 50
  return 8 + ((value - min) / (max - min)) * 84
}

export function LiveMapPreview() {
  const { data, loading, error } = useAdminResource<LiveLocation[]>("locations/live", [], 15_000)
  const [now] = useState(() => Date.now())
  const latitudes = data.map((item) => item.latitude)
  const longitudes = data.map((item) => item.longitude)
  const minLat = Math.min(...latitudes)
  const maxLat = Math.max(...latitudes)
  const minLng = Math.min(...longitudes)
  const maxLng = Math.max(...longitudes)

  return <div className="relative h-[340px] overflow-hidden bg-[#edf0eb] sm:h-[390px]">
    <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(#d8ddd5_1px,transparent_1px),linear-gradient(90deg,#d8ddd5_1px,transparent_1px)] [background-size:42px_42px]" />
    <div className="absolute -left-8 top-20 h-10 w-[115%] rotate-[8deg] border-y border-white bg-[#d7e0ea]" />
    <div className="absolute left-[38%] top-[-10%] h-[125%] w-8 rotate-[20deg] border-x border-white bg-white/80" />
    {data.map((location) => {
      const recent = now - Date.parse(location.capturedAt) < 15 * 60_000
      return <div key={location.user.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: position(location.longitude, minLng, maxLng) + "%", top: (100 - position(location.latitude, minLat, maxLat)) + "%" }}>
        <span className={"flex size-8 items-center justify-center rounded-full border-2 border-white text-white shadow-lg " + (recent ? "bg-emerald-500" : "bg-neutral-500")}><MapPin className="size-4" fill="currentColor" /></span>
        <span className="absolute left-1/2 top-9 -translate-x-1/2 whitespace-nowrap rounded bg-white px-1.5 py-0.5 text-[10px] font-medium shadow-sm">{location.user.name}</span>
      </div>
    })}
    {loading && <div className="absolute inset-0 flex items-center justify-center bg-muted/80"><Badge variant="secondary"><RefreshCw className="animate-spin" /> Loading locations…</Badge></div>}
    {!loading && !error && !data.length && <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">No mobile location has been received yet.</div>}
    {error && <div className="absolute inset-x-4 top-4"><ApiError message={error} /></div>}
    <div className="absolute bottom-4 left-4 rounded-lg border bg-white/95 px-3 py-2 text-xs shadow-sm">Positions refresh every 15 seconds</div>
  </div>
}
