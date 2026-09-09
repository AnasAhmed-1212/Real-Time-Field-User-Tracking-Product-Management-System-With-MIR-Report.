"use client"

import { useMemo } from "react"

import { ApiError } from "@/components/api-state"
import { InteractiveMap, type MapPoint } from "@/components/interactive-map"
import { useAdminResource } from "@/hooks/use-admin-resource"
import { useLocationClock } from "@/hooks/use-location-clock"
import type { LiveLocation } from "@/lib/api-types"

export function LiveMapPreview() {
  const { data, loading, error } = useAdminResource<LiveLocation[]>("locations/live", [], 15_000)
  const now = useLocationClock()
  const points = useMemo<MapPoint[]>(() => data.map((location) => ({
    id: location.user.id, latitude: location.latitude, longitude: location.longitude,
    label: location.user.name, title: location.user.name,
    color: now - Date.parse(location.capturedAt) < 15 * 60_000 ? "green" : "gray",
  })), [data, now])

  return <div className="relative h-[340px] overflow-hidden sm:h-[390px]">
    <InteractiveMap points={points} emptyMessage={loading ? "Loading locations..." : error ? "Location updates are temporarily unavailable." : undefined} />
    {error && <div className="absolute inset-x-4 top-16"><ApiError message={error} /></div>}
    <div className="pointer-events-none absolute bottom-7 left-3 rounded-lg border bg-background/95 px-3 py-2 text-xs text-foreground shadow-sm">Positions refresh every 15 seconds</div>
  </div>
}
