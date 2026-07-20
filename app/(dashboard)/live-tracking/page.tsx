import type { Metadata } from "next"

import { LiveTracking } from "@/components/live-tracking"

export const metadata: Metadata = { title: "Live Tracking | Sales Management" }

export default function LiveTrackingPage() {
  return <LiveTracking />
}
