import type { Metadata } from "next"
import { ApkReleases } from "@/components/apk-releases"

export const metadata: Metadata = { title: "APK Releases | Sales Management" }
export default function ApkReleasesPage() { return <ApkReleases /> }
