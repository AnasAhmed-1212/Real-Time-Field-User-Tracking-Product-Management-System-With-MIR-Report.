"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Download, FileCheck2, LoaderCircle, Smartphone } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { ApkRelease } from "@/lib/api-types"

export default function DownloadPage() {
  const [release, setRelease] = useState<ApkRelease | null>(null)
  const [error, setError] = useState("")
  useEffect(() => {
    fetch("/portal-api/public/releases/latest", { cache: "no-store" }).then(async (response) => {
      if (!response.ok) throw new Error((await response.json().catch(() => null))?.message || "No release is available.")
      setRelease(await response.json())
    }).catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load the release."))
  }, [])

  return <main className="min-h-svh bg-muted/30 px-5 py-12"><div className="mx-auto max-w-3xl">
    <div className="text-center"><span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-neutral-950 text-white"><Smartphone className="size-8" /></span><h1 className="mt-5 text-3xl font-semibold">Sales Management</h1><p className="mt-2 text-muted-foreground">Field operations app for authorized users.</p></div>
    {!release && !error && <p className="mt-10 flex items-center justify-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" />Loading current release…</p>}
    {error && <Alert variant="destructive" className="mt-8"><AlertTriangle /><AlertTitle>Download unavailable</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
    {release && <><Card className="mt-8"><CardContent className="p-6 sm:p-8"><div className="flex flex-wrap items-center justify-between gap-5"><div><Badge variant="success">Current release</Badge><p className="mt-3 text-2xl font-semibold">Version {release.version}</p><p className="text-sm text-muted-foreground">Published {new Date(release.publishedAt).toLocaleDateString()} · Android {release.minimumAndroid}+</p></div><Button render={<a href={release.fileUrl} />} nativeButton={false} size="lg"><Download /> Download APK</Button></div>{release.checksumSha256 && <div className="mt-6 rounded-xl bg-muted p-4"><p className="flex items-center gap-2 text-sm font-medium"><FileCheck2 className="size-4" />SHA-256 checksum</p><code className="mt-2 block break-all text-xs text-muted-foreground">{release.checksumSha256}</code></div>}</CardContent></Card>
      <Card className="mt-6"><CardContent className="p-6"><h2 className="font-semibold">Release notes</h2><p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{release.releaseNotes}</p></CardContent></Card></>}
    <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><p className="flex gap-2"><AlertTriangle className="mt-0.5 size-4 shrink-0" />Android may warn about apps installed outside Google Play. Verify the checksum and only install releases supplied by your administrator.</p></div>
  </div></main>
}
