"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { LocateFixed, Minus, Plus, RefreshCw } from "lucide-react"

import { ApiError } from "@/components/api-state"
import { acquireGoogleMap, loadGoogleMaps, type AdvancedMarker, type GoogleMap, type GoogleMapsApi, type GooglePolyline } from "@/lib/google-maps"

export type MapPoint = {
  id: string
  latitude: number
  longitude: number
  label: string
  title: string
  color: "green" | "gray" | "red"
}

type MapInstance = { map: GoogleMap; google: GoogleMapsApi }
type MarkerEntry = { marker: AdvancedMarker; content: HTMLDivElement; point: MapPoint; listener: { remove: () => void } }

function fitPoints({ map, google }: MapInstance, points: MapPoint[]) {
  if (!points.length) return
  const first = points[0]
  if (points.every((point) => point.latitude === first.latitude && point.longitude === first.longitude)) {
    map.setCenter({ lat: first.latitude, lng: first.longitude })
    map.setZoom(14)
    return
  }
  const bounds = new google.maps.LatLngBounds()
  points.forEach((point) => bounds.extend({ lat: point.latitude, lng: point.longitude }))
  map.fitBounds(bounds, 70)
}

export function InteractiveMap({ points, selectedId, onSelect, showPath = false, emptyMessage = "No mobile location has been received yet." }: {
  points: MapPoint[]
  selectedId?: string
  onSelect?: (id: string) => void
  showPath?: boolean
  emptyMessage?: string
}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const element = useRef<HTMLDivElement>(null)
  const [instance, setInstance] = useState<MapInstance | null>(null)
  const [error, setError] = useState("")
  const fitted = useRef(false)
  const focusedId = useRef<string | undefined>(undefined)
  const markers = useRef(new Map<string, MarkerEntry>())
  const line = useRef<GooglePolyline | null>(null)
  const pathKey = useRef("")
  const select = useRef(onSelect)
  const validPoints = useMemo(() => points.filter((point) => Number.isFinite(point.latitude) && Number.isFinite(point.longitude) && Math.abs(point.latitude) <= 90 && Math.abs(point.longitude) <= 180), [points])

  useEffect(() => { select.current = onSelect }, [onSelect])

  useEffect(() => {
    if (!apiKey || !element.current) return
    let cancelled = false
    const container = element.current
    const entries = markers.current
    let acquired: ReturnType<typeof acquireGoogleMap> | undefined
    loadGoogleMaps(apiKey).then(async (google) => {
      await Promise.all([google.maps.importLibrary("maps"), google.maps.importLibrary("marker")])
      if (cancelled) return
      acquired = acquireGoogleMap(container, google)
      fitted.current = false
      focusedId.current = undefined
      setInstance(acquired)
    }).catch(() => {
      if (!cancelled) setError("The map could not load. Check your connection and reload the page.")
    })
    return () => {
      cancelled = true
      entries.forEach(({ marker, listener }) => { listener.remove(); marker.map = null })
      entries.clear()
      line.current?.setMap(null)
      line.current = null
      pathKey.current = ""
      acquired?.release()
    }
  }, [apiKey])

  useEffect(() => {
    if (!instance) return
    const { map, google } = instance
    const visible = validPoints.filter((_, index) => !showPath || index === 0 || index === validPoints.length - 1)
    const visibleIds = new Set(visible.map((point) => point.id))
    markers.current.forEach(({ marker, listener }, id) => {
      if (visibleIds.has(id)) return
      listener.remove()
      marker.map = null
      markers.current.delete(id)
    })
    visible.forEach((point) => {
      let entry = markers.current.get(point.id)
      const previous = entry?.point
      if (!entry) {
        const content = document.createElement("div")
        const marker = new google.maps.marker.AdvancedMarkerElement({
          map, position: { lat: point.latitude, lng: point.longitude }, title: point.title, content,
        })
        const listener = marker.addListener("click", () => select.current?.(point.id))
        entry = { marker, content, point, listener }
        markers.current.set(point.id, entry)
      } else {
        if (previous?.latitude !== point.latitude || previous?.longitude !== point.longitude) {
          entry.marker.position = { lat: point.latitude, lng: point.longitude }
        }
        if (previous?.title !== point.title) entry.marker.title = point.title
      }
      if (previous?.color !== point.color) entry.content.className = "rounded-full border-2 border-white px-3 py-1.5 text-xs font-semibold text-white shadow-lg " + (point.color === "green" ? "bg-emerald-600" : point.color === "red" ? "bg-red-600" : "bg-neutral-600")
      if (previous?.label !== point.label) entry.content.textContent = point.label
      entry.point = point
    })
    const path = showPath ? validPoints.map((point) => ({ lat: point.latitude, lng: point.longitude })) : []
    const nextPathKey = JSON.stringify(path)
    const pathChanged = nextPathKey !== pathKey.current
    if (pathChanged) {
      if (path.length > 1) {
        if (line.current) line.current.setPath(path)
        else line.current = new google.maps.Polyline({
          map, path, geodesic: true, strokeColor: "#059669", strokeOpacity: 0.9, strokeWeight: 4,
        })
      } else {
        line.current?.setMap(null)
        line.current = null
      }
      pathKey.current = nextPathKey
    }

    // Refresh marker positions without resetting the user's zoom or pan.
    if (validPoints.length && (!fitted.current || (showPath && pathChanged))) {
      fitPoints(instance, validPoints)
      fitted.current = true
    }
    if (selectedId !== focusedId.current) {
      const selected = validPoints.find((point) => point.id === selectedId)
      if (selected) map.setCenter({ lat: selected.latitude, lng: selected.longitude })
      focusedId.current = selectedId
    }
  }, [instance, validPoints, selectedId, showPath])

  const ready = !!instance && !error
  const controlClass = "flex size-9 items-center justify-center bg-background text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
  return <div className="absolute inset-0 bg-muted" role="region" aria-label={showPath ? "Route history map" : "Live field locations map"}>
    <div ref={element} className="absolute inset-0" />
    <div className="absolute left-3 top-3 flex overflow-hidden rounded-lg border bg-background shadow-md" role="group" aria-label="Map controls">
      <button type="button" className={controlClass} aria-label="Zoom in" title="Zoom in" disabled={!ready} onClick={() => instance && instance.map.setZoom(Math.min(21, (instance.map.getZoom() ?? 2) + 1))}><Plus className="size-4" /></button>
      <button type="button" className={controlClass + " border-x"} aria-label="Zoom out" title="Zoom out" disabled={!ready} onClick={() => instance && instance.map.setZoom(Math.max(2, (instance.map.getZoom() ?? 2) - 1))}><Minus className="size-4" /></button>
      <button type="button" className={controlClass} aria-label="Fit all locations" title="Fit all locations" disabled={!ready || !validPoints.length} onClick={() => instance && fitPoints(instance, validPoints)}><LocateFixed className="size-4" /></button>
    </div>
    {!apiKey && <div className="absolute inset-x-4 top-16 rounded-lg border bg-background p-4 text-sm text-foreground" role="status">Map setup is incomplete. Contact your portal administrator to enable maps.</div>}
    {apiKey && !instance && !error && <div className="absolute left-3 top-16 flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-xs text-foreground" role="status"><RefreshCw className="size-3 animate-spin" /> Loading map...</div>}
    {ready && !validPoints.length && <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6"><p className="rounded-lg border bg-background/95 p-4 text-center text-sm text-foreground" role="status">{emptyMessage}</p></div>}
    {error && <div className="absolute inset-x-4 top-16"><ApiError message={error} /></div>}
  </div>
}
