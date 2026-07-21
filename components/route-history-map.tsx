"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { AlertCircle, LocateFixed, Navigation, RefreshCw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { loadGoogleMaps, type GoogleMap } from "@/lib/google-maps"

type MapState = "loading" | "ready" | "fallback" | "error"

const routePoints = [
  { label: "Start", lat: 31.5204, lng: 74.3587, color: "#10b981" },
  { label: "2", lat: 31.5102, lng: 74.3441, color: "#171717" },
  { label: "3", lat: 31.5166, lng: 74.3521, color: "#171717" },
  { label: "4", lat: 31.5251, lng: 74.3358, color: "#171717" },
  { label: "5", lat: 31.5324, lng: 74.3197, color: "#171717" },
  { label: "6", lat: 31.5409, lng: 74.3074, color: "#171717" },
  { label: "7", lat: 31.5561, lng: 74.3234, color: "#171717" },
  { label: "End", lat: 31.5738, lng: 74.312, color: "#ef3340" },
]

function markerContent(label: string, color: string) {
  const marker = document.createElement("div")
  marker.style.cssText = `display:flex;width:32px;height:32px;align-items:center;justify-content:center;border-radius:9999px;border:2px solid white;background:${color};color:white;font-size:9px;font-weight:700;box-shadow:0 4px 10px rgb(0 0 0 / .3)`
  marker.textContent = label
  return marker
}

export function RouteHistoryMap() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const mapElement = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<GoogleMap | null>(null)
  const [state, setState] = useState<MapState>(() => apiKey ? "loading" : "fallback")

  const fitRoute = useCallback(() => {
    if (!mapInstance.current || !window.google) return
    const bounds = new window.google.maps.LatLngBounds()
    routePoints.forEach(({ lat, lng }) => bounds.extend({ lat, lng }))
    mapInstance.current.fitBounds(bounds, 64)
  }, [])

  useEffect(() => {
    if (!apiKey || !mapElement.current) return
    let cancelled = false

    loadGoogleMaps(apiKey)
      .then(async (google) => {
        await Promise.all([google.maps.importLibrary("maps"), google.maps.importLibrary("marker")])
        if (cancelled || !mapElement.current) return

        const map = new google.maps.Map(mapElement.current, {
          center: { lat: 31.539, lng: 74.335 },
          zoom: 13,
          mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID",
          disableDefaultUI: true,
          gestureHandling: "cooperative",
        })
        mapInstance.current = map

        new google.maps.Polyline({
          map,
          path: routePoints.map(({ lat, lng }) => ({ lat, lng })),
          geodesic: true,
          strokeColor: "#171717",
          strokeOpacity: 0.95,
          strokeWeight: 4,
        })

        routePoints.forEach((point) => new google.maps.marker.AdvancedMarkerElement({
          map,
          position: { lat: point.lat, lng: point.lng },
          title: point.label === "Start" || point.label === "End" ? `${point.label} of route` : `Route point ${point.label}`,
          content: markerContent(point.label, point.color),
        }))

        const bounds = new google.maps.LatLngBounds()
        routePoints.forEach(({ lat, lng }) => bounds.extend({ lat, lng }))
        map.fitBounds(bounds, 64)
        setState("ready")
      })
      .catch(() => { if (!cancelled) setState("error") })

    return () => { cancelled = true }
  }, [apiKey])

  const openDirections = () => {
    const start = routePoints[0]
    const end = routePoints.at(-1)!
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${start.lat},${start.lng}&destination=${end.lat},${end.lng}`, "_blank", "noopener,noreferrer")
  }

  return <div className="relative h-[520px] overflow-hidden bg-[#edf0eb]">
    <div ref={mapElement} className={`absolute inset-0 ${state === "ready" ? "block" : "invisible"}`} aria-label="Ahmed Raza location history route on Google Maps" />
    {(state === "fallback" || state === "error") && <FallbackRoute />}
    {state === "loading" && <div className="absolute inset-0 flex items-center justify-center bg-muted"><Badge variant="secondary"><RefreshCw className="animate-spin" /> Loading route map…</Badge></div>}
    {state === "error" && <div className="absolute left-4 top-4 z-10"><Badge variant="destructive"><AlertCircle /> Google Map unavailable</Badge></div>}
    <div className="absolute bottom-4 left-4 z-10 rounded-lg border bg-white/95 px-3 py-2 text-[11px] shadow-sm"><p className="font-medium">Route simplified for display</p><p className="mt-0.5 text-muted-foreground">48 raw updates · 8 meaningful points</p></div>
    <div className="absolute right-4 top-4 z-10 flex flex-col gap-2"><Button variant="outline" size="icon" className="bg-white" onClick={fitRoute} disabled={state !== "ready"} aria-label="Fit complete route"><LocateFixed /></Button><Button variant="outline" size="icon" className="bg-white" onClick={openDirections} aria-label="Open route in Google Maps"><Navigation /></Button></div>
  </div>
}

function FallbackRoute() {
  return <div className="absolute inset-0"><div className="absolute inset-0 opacity-60 [background-image:linear-gradient(#d8ddd5_1px,transparent_1px),linear-gradient(90deg,#d8ddd5_1px,transparent_1px)] [background-size:44px_44px]" /><div className="absolute left-[8%] top-[52%] h-9 w-[90%] -rotate-6 bg-white/80" /><div className="absolute left-[48%] top-[-10%] h-[120%] w-8 rotate-[16deg] bg-white/80" /><svg className="absolute inset-0 size-full" viewBox="0 0 800 500" preserveAspectRatio="none"><path d="M120 390 C170 330, 210 355, 260 290 S350 220, 420 260 S500 345, 560 270 S630 165, 700 120" fill="none" stroke="white" strokeWidth="12" strokeLinecap="round" /><path d="M120 390 C170 330, 210 355, 260 290 S350 220, 420 260 S500 345, 560 270 S630 165, 700 120" fill="none" stroke="#171717" strokeWidth="4" strokeLinecap="round" strokeDasharray="8 7" /></svg>{[{ left: "15%", top: "78%", label: "Start", className: "bg-emerald-500" }, { left: "33%", top: "56%", label: "2", className: "bg-neutral-900" }, { left: "53%", top: "52%", label: "3", className: "bg-neutral-900" }, { left: "70%", top: "45%", label: "4", className: "bg-neutral-900" }, { left: "87%", top: "24%", label: "End", className: "bg-red-500" }].map((point) => <span key={point.label} className={`absolute flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white text-[9px] font-bold text-white shadow-lg ${point.className}`} style={{ left: point.left, top: point.top }}>{point.label}</span>)}</div>
}
