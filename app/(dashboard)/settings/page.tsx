import type { Metadata } from "next"
import { SettingsPage } from "@/components/settings-page"

export const metadata: Metadata = { title: "Settings | Sales Management" }
export default function SettingsRoute() { return <SettingsPage /> }
