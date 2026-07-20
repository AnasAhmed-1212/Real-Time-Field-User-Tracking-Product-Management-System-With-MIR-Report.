import type { Metadata } from "next"
import { Activities } from "@/components/activities"

export const metadata: Metadata = { title: "Activities | Sales Management" }
export default function ActivitiesPage() { return <Activities /> }
