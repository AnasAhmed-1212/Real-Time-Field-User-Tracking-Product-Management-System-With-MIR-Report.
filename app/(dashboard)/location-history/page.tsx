import type { Metadata } from "next"
import { LocationHistory } from "@/components/location-history"

export const metadata: Metadata = { title: "Location History | Sales Management" }
export default function LocationHistoryPage() { return <LocationHistory /> }
