"use client"

import { FormEvent, useState } from "react"
import { Plus, RefreshCw } from "lucide-react"

import { ApiError, ApiLoading } from "@/components/api-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAdminResource } from "@/hooks/use-admin-resource"
import { adminApi } from "@/lib/admin-api"
import type { ApkRelease } from "@/lib/api-types"

const blank = { version: "", versionCode: "", minimumAndroid: "", releaseNotes: "", fileUrl: "", checksumSha256: "" }

export function ApkReleases() {
  const { data, loading, error, refresh } = useAdminResource<ApkRelease[]>("releases", [])
  const [form, setForm] = useState(blank)
  const [show, setShow] = useState(false)
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState("")

  async function create(event: FormEvent) {
    event.preventDefault(); setSaving(true)
    try { await adminApi("releases", { method: "POST", body: JSON.stringify({ ...form, versionCode: Number(form.versionCode) }) }); setForm(blank); setShow(false); await refresh() }
    catch (reason) { setActionError(reason instanceof Error ? reason.message : "Unable to create release.") }
    finally { setSaving(false) }
  }
  async function activate(id: string) {
    try { await adminApi("releases/" + id + "/activate", { method: "PATCH" }); await refresh() }
    catch (reason) { setActionError(reason instanceof Error ? reason.message : "Unable to activate release.") }
  }

  return <main className="flex-1 bg-muted/20 p-4 sm:p-6"><div className="mx-auto max-w-7xl space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-semibold">Android releases</h1><p className="text-sm text-muted-foreground">Publish real APK metadata and download URLs.</p></div><div className="flex gap-2"><Button variant="outline" onClick={() => refresh()}><RefreshCw /> Refresh</Button><Button onClick={() => setShow((value) => !value)}><Plus /> New release</Button></div></div>
    {(error || actionError) && <ApiError message={error || actionError} />}
    {show && <Card><CardHeader><h2 className="font-semibold">Create release</h2><p className="text-xs text-muted-foreground">Upload the APK to object storage first, then paste its HTTPS URL here.</p></CardHeader><CardContent><form onSubmit={create} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Object.entries(form).map(([key, value]) => <Label key={key} className="gap-2 capitalize">{key.replace(/([A-Z])/g, " $1")}<Input required={!["checksumSha256"].includes(key)} type={key === "versionCode" ? "number" : key === "fileUrl" ? "url" : "text"} min={key === "versionCode" ? 1 : undefined} value={value} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} /></Label>)}<div className="flex items-end gap-2"><Button disabled={saving}>{saving ? "Saving…" : "Create release"}</Button><Button type="button" variant="outline" onClick={() => setShow(false)}>Cancel</Button></div></form></CardContent></Card>}
    <Card className="overflow-hidden">{loading ? <ApiLoading label="Loading releases…" /> : <Table><TableHeader><TableRow><TableHead>Version</TableHead><TableHead>Android</TableHead><TableHead>Published</TableHead><TableHead>Downloads</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader><TableBody>{data.map((release) => <TableRow key={release.id}><TableCell><div className="font-medium">{release.version} ({release.versionCode})</div><div className="max-w-lg truncate text-xs text-muted-foreground">{release.releaseNotes}</div></TableCell><TableCell>{release.minimumAndroid}+</TableCell><TableCell>{new Date(release.publishedAt).toLocaleString()}</TableCell><TableCell>{release.downloadCount}</TableCell><TableCell><Badge variant={release.active ? "success" : "secondary"}>{release.active ? "Active" : "Inactive"}</Badge></TableCell><TableCell className="space-x-2 text-right"><Button render={<a href={release.fileUrl} target="_blank" rel="noreferrer" />} nativeButton={false} size="sm" variant="outline">APK</Button>{!release.active && <Button size="sm" onClick={() => activate(release.id)}>Activate</Button>}</TableCell></TableRow>)}</TableBody></Table>}
      {!loading && !data.length && <p className="p-10 text-center text-sm text-muted-foreground">No APK releases have been published.</p>}
    </Card>
  </div></main>
}
