"use client"

import { useMemo } from "react"

import { InteractiveMap, type MapPoint } from "@/components/interactive-map"

export type HistoryPoint = { id: string; latitude: number; longitude: number; accuracy: number | null; speed: number | null; area: string; address: string; eventType: string; capturedAt: string }

export function RouteHistoryMap({ points }: { points: HistoryPoint[] }) {
  const mapPoints = useMemo<MapPoint[]>(() => points.map((point, index) => ({
    id: point.id, latitude: point.latitude, longitude: point.longitude,
    label: points.length === 1 ? "Start / End" : index === 0 ? "Start" : "End",
    title: new Date(point.capturedAt).toLocaleString(), color: index === 0 ? "green" : "red",
  })), [points])

  return <div className="relative h-[520px] overflow-hidden">
    <InteractiveMap points={mapPoints} showPath emptyMessage="Choose a field user and load a date range." />
    {!!points.length && <div className="pointer-events-none absolute bottom-7 left-3 rounded border bg-background/95 px-3 py-2 text-xs text-foreground shadow">{points.length} stored GPS updates</div>}
  </div>
}
