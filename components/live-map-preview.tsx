"use client"

import { useEffect, useRef, useState } from "react"
import { AlertCircle, MapPin, RefreshCw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { loadGoogleMaps } from "@/lib/google-maps"

type PreviewState = "loading" | "ready" | "fallback" | "error"

const locations = [
  { name: "Ahmed", lat: 31.5204, lng: 74.3587, online: true, left: "18%", top: "25%" },
  { name: "Sara", lat: 31.4708, lng: 74.4112, online: true, left: "44%", top: "33%" },
  { name: "Hamza", lat: 31.5102, lng: 74.3441, online: false, left: "69%", top: "21%" },
  { name: "Ayesha", lat: 31.4697, lng: 74.2728, online: true, left: "77%", top: "62%" },
  { name: "Bilal", lat: 31.4834, lng: 74.3239, online: true, left: "29%", top: "72%" },
  { name: "Nida", lat: 31.4504, lng: 74.3062, online: false, left: "57%", top: "76%" },
]

function createMarker(name: string, online: boolean) {
  const marker = document.createElement("div")
  marker.className = "flex flex-col items-center"
  marker.innerHTML = `<span style="display:flex;width:32px;height:32px;align-items:center;justify-content:center;border-radius:9999px;border:2px solid white;background:${online ? "#10b981" : "#737373"};color:white;box-shadow:0 4px 8px rgb(0 0 0 / .25)"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="white"/></svg></span><span style="margin-top:4px;border-radius:3px;background:white;padding:2px 6px;font-size:10px;font-weight:500;box-shadow:0 1px 3px rgb(0 0 0 / .2)">${name}</span>`
  return marker
}

export function LiveMapPreview() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const mapElement = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<PreviewState>(() => apiKey ? "loading" : "fallback")

  useEffect(() => {
    if (!apiKey || !mapElement.current) return
    let cancelled = false

    loadGoogleMaps(apiKey)
      .then(async (google) => {
        await Promise.all([google.maps.importLibrary("maps"), google.maps.importLibrary("marker")])
        if (cancelled || !mapElement.current) return

        const map = new google.maps.Map(mapElement.current, {
          center: { lat: 31.487, lng: 74.336 },
          zoom: 12,
          mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID",
          disableDefaultUI: true,
          gestureHandling: "cooperative",
        })

        locations.forEach((location) => {
          new google.maps.marker.AdvancedMarkerElement({
            map,
            position: { lat: location.lat, lng: location.lng },
            title: location.name,
            content: createMarker(location.name, location.online),
          })
        })
        setState("ready")
      })
      .catch(() => { if (!cancelled) setState("error") })

    return () => { cancelled = true }
  }, [apiKey])

  return (
    <div className="relative h-[340px] overflow-hidden bg-[#edf0eb] sm:h-[390px]">
      <div ref={mapElement} className={`absolute inset-0 ${state === "ready" ? "block" : "invisible"}`} aria-label="Latest field user locations on Google Maps" />
      {(state === "fallback" || state === "error") && <FallbackMap />}
      {state === "loading" && <div className="absolute inset-0 flex items-center justify-center bg-muted"><Badge variant="secondary"><RefreshCw className="animate-spin" /> Loading Google Map…</Badge></div>}
      {state === "error" && <div className="absolute right-3 top-3"><Button size="sm" variant="outline" onClick={() => window.location.reload()} className="bg-white"><AlertCircle /> Retry map</Button></div>}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-4 rounded-lg border bg-white/95 px-3 py-2 text-xs shadow-sm">
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-500" />Online</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-neutral-500" />Offline</span>
      </div>
    </div>
  )
}

function FallbackMap() {
  return <div className="absolute inset-0"><div className="absolute inset-0 opacity-60 [background-image:linear-gradient(#d8ddd5_1px,transparent_1px),linear-gradient(90deg,#d8ddd5_1px,transparent_1px)] [background-size:42px_42px]" /><div className="absolute -left-8 top-20 h-10 w-[115%] rotate-[8deg] border-y border-white bg-[#d7e0ea]" /><div className="absolute left-[38%] top-[-10%] h-[125%] w-8 rotate-[20deg] border-x border-white bg-white/80" /><div className="absolute left-[8%] top-[68%] h-6 w-[86%] -rotate-[6deg] border-y border-white bg-white/80" />{locations.map((location) => <div key={location.name} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: location.left, top: location.top }}><span className={`flex size-8 items-center justify-center rounded-full border-2 border-white text-white shadow-lg ${location.online ? "bg-emerald-500" : "bg-neutral-500"}`}><MapPin className="size-4" fill="currentColor" aria-hidden="true" /></span><span className="absolute left-1/2 top-9 -translate-x-1/2 rounded bg-white px-1.5 py-0.5 text-[10px] font-medium shadow-sm">{location.name}</span></div>)}</div>
}
