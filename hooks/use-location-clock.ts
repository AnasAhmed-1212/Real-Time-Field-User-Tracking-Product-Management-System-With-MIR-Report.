"use client"

import { useEffect, useState } from "react"

// Keep stale-location badges current even when a GPS request fails.
export function useLocationClock() {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 15_000)
    return () => window.clearInterval(timer)
  }, [])
  return now
}
