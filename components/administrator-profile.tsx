"use client"

import { FormEvent, useEffect, useState } from "react"
import { Check, Mail, MapPin, Phone, ShieldCheck } from "lucide-react"

import { ApiError, ApiLoading } from "@/components/api-state"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAdminResource } from "@/hooks/use-admin-resource"
import { adminApi } from "@/lib/admin-api"
import type { AdminProfile } from "@/lib/api-types"

const empty: AdminProfile = { id: "", name: "", firstName: "", lastName: "", email: "", username: "", phone: "", role: "", jobTitle: "", officeLocation: "", timezone: "Asia/Karachi", language: "English" }

export function AdministratorProfile() {
  const resource = useAdminResource<AdminProfile>("profile", empty)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [actionError, setActionError] = useState("")
  useEffect(() => {
    if (resource.loading) return
    const timer = window.setTimeout(() => setForm(resource.data), 0)
    return () => window.clearTimeout(timer)
  }, [resource.data, resource.loading])

  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setActionError(""); setSaved(false)
    try { setForm(await adminApi<AdminProfile>("profile", { method: "PATCH", body: JSON.stringify(form) })); setSaved(true) }
    catch (reason) { setActionError(reason instanceof Error ? reason.message : "Unable to update profile.") }
    finally { setSaving(false) }
  }
  if (resource.loading) return <main className="flex-1 p-6"><ApiLoading label="Loading administrator profile…" /></main>
  const initials = form.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "AD"
  const fields: Array<[keyof AdminProfile, string, string]> = [["name", "Display name", "text"], ["firstName", "First name", "text"], ["lastName", "Last name", "text"], ["email", "Email", "email"], ["phone", "Phone", "text"], ["jobTitle", "Job title", "text"], ["officeLocation", "Office location", "text"], ["timezone", "Timezone", "text"], ["language", "Language", "text"]]
  return <main className="flex-1 bg-muted/20 p-4 sm:p-6"><div className="mx-auto max-w-5xl space-y-5">
    {(resource.error || actionError) && <ApiError message={resource.error || actionError} />}
    <Card className="overflow-hidden"><div className="h-28 bg-neutral-950" /><CardContent className="-mt-10 flex flex-wrap items-end gap-4 p-6"><Avatar className="size-20 border-4 border-background"><AvatarFallback>{initials}</AvatarFallback></Avatar><div className="flex-1"><div className="flex items-center gap-2"><h1 className="text-2xl font-semibold">{form.name}</h1><Badge variant="success">Active</Badge></div><p className="text-sm text-muted-foreground">{form.role}</p></div><Badge variant="outline"><ShieldCheck /> Administrator</Badge></CardContent></Card>
    <div className="grid gap-3 sm:grid-cols-3"><Meta icon={Mail} value={form.email} /><Meta icon={Phone} value={form.phone || "No phone"} /><Meta icon={MapPin} value={form.officeLocation || "No office location"} /></div>
    <Card><CardContent className="p-6"><h2 className="font-semibold">Personal information</h2><p className="mb-6 text-sm text-muted-foreground">These values are stored in the administrator account.</p>{saved && <Alert variant="success" className="mb-5"><Check /><AlertTitle>Profile updated</AlertTitle><AlertDescription>Your changes were saved.</AlertDescription></Alert>}<form onSubmit={save} className="grid gap-5 sm:grid-cols-2">{fields.map(([key, label, type]) => <Label key={key} className="gap-2">{label}<Input type={type} required={["name", "email"].includes(key)} value={String(form[key] || "")} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} /></Label>)}<div className="sm:col-span-2 sm:text-right"><Button disabled={saving}>{saving ? "Saving…" : "Save profile"}</Button></div></form></CardContent></Card>
  </div></main>
}

function Meta({ icon: Icon, value }: { icon: typeof Mail; value: string }) { return <Card><CardContent className="flex items-center gap-3 p-4"><Icon className="size-4 text-muted-foreground" /><span className="truncate text-sm">{value}</span></CardContent></Card> }
