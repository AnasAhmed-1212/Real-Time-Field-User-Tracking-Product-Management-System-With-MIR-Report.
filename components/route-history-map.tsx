"use client"

import { useEffect, useRef, useState } from "react"
import { RefreshCw } from "lucide-react"

import { ApiError } from "@/components/api-state"
import { Badge } from "@/components/ui/badge"
import { loadGoogleMaps } from "@/lib/google-maps"

export type HistoryPoint = { id: string; latitude: number; longitude: number; accuracy: number | null; speed: number | null; area: string; address: string; eventType: string; capturedAt: string }

export function RouteHistoryMap({ points }: { points: HistoryPoint[] }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const element = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">("idle")
  const key = points.map((point) => point.id).join(",")

  useEffect(() => {
    if (!apiKey || !element.current || !points.length) return
    let cancelled = false; setState("loading")
    loadGoogleMaps(apiKey).then(async (google) => {
      await Promise.all([google.maps.importLibrary("maps"), google.maps.importLibrary("marker")])
      if (cancelled || !element.current) return
      const map = new google.maps.Map(element.current, { center: { lat: points[0].latitude, lng: points[0].longitude }, zoom: 13, mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID", streetViewControl: false, mapTypeControl: false })
      const path = points.map((point) => ({ lat: point.latitude, lng: point.longitude }))
      new google.maps.Polyline({ map, path, geodesic: true, strokeColor: "#171717", strokeOpacity: 0.9, strokeWeight: 4 })
      const bounds = new google.maps.LatLngBounds(); path.forEach((point) => bounds.extend(point)); map.fitBounds(bounds, 60)
      ;[points[0], points.at(-1)].forEach((point, index) => {
        if (!point) return
        const marker = document.createElement("div"); marker.className = "rounded-full border-2 border-white px-2 py-1 text-xs font-bold text-white shadow " + (index ? "bg-red-500" : "bg-emerald-500"); marker.textContent = index ? "End" : "Start"
        new google.maps.marker.AdvancedMarkerElement({ map, position: { lat: point.latitude, lng: point.longitude }, content: marker })
      })
      setState("ready")
    }).catch(() => { if (!cancelled) setState("error") })
    return () => { cancelled = true }
  }, [apiKey, key, points])

  return <div className="relative h-[520px] overflow-hidden bg-[#edf0eb]">
    {apiKey && points.length ? <div ref={element} className="absolute inset-0" /> : <div className="absolute inset-0 flex items-center justify-center p-8 text-center text-sm text-muted-foreground">{points.length ? "Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to draw these real route coordinates." : "Choose a field user and load a date range."}</div>}
    {state === "loading" && <Badge className="absolute left-4 top-4" variant="secondary"><RefreshCw className="animate-spin" /> Loading route…</Badge>}
    {state === "error" && <div className="absolute inset-x-4 top-4"><ApiError message="Google Maps could not render this route." /></div>}
    {!!points.length && <div className="absolute bottom-4 left-4 rounded border bg-white/95 px-3 py-2 text-xs shadow">{points.length} stored GPS updates</div>}
  </div>
}
