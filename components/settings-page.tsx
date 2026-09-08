"use client"

import { FormEvent, useEffect, useState } from "react"
import { Check, Save } from "lucide-react"

import { ApiError, ApiLoading } from "@/components/api-state"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAdminResource } from "@/hooks/use-admin-resource"
import { adminApi } from "@/lib/admin-api"

type Settings = {
  organization: { companyName: string; administratorEmail: string; supportPhone: string; timezone: string; dateFormat: string; defaultLanguage: string }
  tracking: { enabled: boolean; highAccuracy: boolean; updateIntervalSeconds: number; inactiveAfterMinutes: number; staleAfterMinutes: number }
  attendance: { workdayStarts: string; workdayEnds: string; lateGraceMinutes: number; minimumFullDayHours: number; requireLocationForCheckIn: boolean }
  security: { administratorSessionMinutes: number; fieldSessionDays: number; passwordMinimumLength: number; auditLogRetentionDays: number }
  data: { locationHistoryRetentionDays: number; activityAttachmentRetentionDays: number; maximumImageUploadMb: number; maximumApkUploadMb: number }
}

const empty: Settings = {
  organization: { companyName: "", administratorEmail: "", supportPhone: "", timezone: "Asia/Karachi", dateFormat: "DD/MM/YYYY", defaultLanguage: "English" },
  tracking: { enabled: true, highAccuracy: true, updateIntervalSeconds: 30, inactiveAfterMinutes: 5, staleAfterMinutes: 15 },
  attendance: { workdayStarts: "09:00", workdayEnds: "18:00", lateGraceMinutes: 15, minimumFullDayHours: 8, requireLocationForCheckIn: true },
  security: { administratorSessionMinutes: 60, fieldSessionDays: 30, passwordMinimumLength: 8, auditLogRetentionDays: 365 },
  data: { locationHistoryRetentionDays: 90, activityAttachmentRetentionDays: 365, maximumImageUploadMb: 5, maximumApkUploadMb: 150 },
}

export function SettingsPage() {
  const resource = useAdminResource<Settings>("settings", empty)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [actionError, setActionError] = useState("")
  useEffect(() => {
    if (resource.loading) return
    const timer = window.setTimeout(() => setForm(resource.data), 0)
    return () => window.clearTimeout(timer)
  }, [resource.data, resource.loading])

  function update(section: keyof Settings, key: string, value: string | number | boolean) {
    setForm((current) => ({ ...current, [section]: { ...current[section], [key]: value } }))
  }
  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setSaved(false); setActionError("")
    try { const next = await adminApi<Settings>("settings", { method: "PUT", body: JSON.stringify(form) }); setForm(next); setSaved(true) }
    catch (reason) { setActionError(reason instanceof Error ? reason.message : "Unable to save settings.") }
    finally { setSaving(false) }
  }

  if (resource.loading) return <main className="flex-1 p-6"><ApiLoading label="Loading settings…" /></main>
  return <main className="flex-1 bg-muted/20 p-4 sm:p-6"><form onSubmit={save} className="mx-auto max-w-6xl space-y-5">
    <div className="flex items-center justify-between"><div><h1 className="text-2xl font-semibold">Settings</h1><p className="text-sm text-muted-foreground">Server-backed operational configuration.</p></div><Button type="submit" disabled={saving}><Save />{saving ? "Saving…" : "Save changes"}</Button></div>
    {(resource.error || actionError) && <ApiError message={resource.error || actionError} />}
    {saved && <Alert variant="success"><Check /><AlertTitle>Settings saved</AlertTitle><AlertDescription>The database configuration is now active.</AlertDescription></Alert>}
    <div className="grid gap-5 lg:grid-cols-2">
      <Section title="Organization">{Object.entries(form.organization).map(([key, value]) => <TextField key={key} label={key} value={String(value)} type={key.includes("Email") ? "email" : "text"} onChange={(next) => update("organization", key, next)} />)}</Section>
      <Section title="Live tracking"><Toggle label="Tracking enabled" checked={form.tracking.enabled} onChange={(value) => update("tracking", "enabled", value)} /><Toggle label="High accuracy" checked={form.tracking.highAccuracy} onChange={(value) => update("tracking", "highAccuracy", value)} />{(["updateIntervalSeconds", "inactiveAfterMinutes", "staleAfterMinutes"] as const).map((key) => <NumberField key={key} label={key} value={form.tracking[key]} onChange={(value) => update("tracking", key, value)} />)}</Section>
      <Section title="Attendance"><TextField label="workdayStarts" value={form.attendance.workdayStarts} type="time" onChange={(value) => update("attendance", "workdayStarts", value)} /><TextField label="workdayEnds" value={form.attendance.workdayEnds} type="time" onChange={(value) => update("attendance", "workdayEnds", value)} /><NumberField label="lateGraceMinutes" value={form.attendance.lateGraceMinutes} onChange={(value) => update("attendance", "lateGraceMinutes", value)} /><NumberField label="minimumFullDayHours" value={form.attendance.minimumFullDayHours} onChange={(value) => update("attendance", "minimumFullDayHours", value)} /><Toggle label="Require location for check-in" checked={form.attendance.requireLocationForCheckIn} onChange={(value) => update("attendance", "requireLocationForCheckIn", value)} /></Section>
      <Section title="Security">{Object.entries(form.security).map(([key, value]) => <NumberField key={key} label={key} value={value} onChange={(next) => update("security", key, next)} />)}</Section>
      <Section title="Retention and uploads">{Object.entries(form.data).map(([key, value]) => <NumberField key={key} label={key} value={value} onChange={(next) => update("data", key, next)} />)}</Section>
    </div>
  </form></main>
}

function human(value: string) { return value.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase()) }
function Section({ title, children }: { title: string; children: React.ReactNode }) { return <Card><CardHeader><h2 className="font-semibold">{title}</h2></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">{children}</CardContent></Card> }
function TextField({ label, value, type, onChange }: { label: string; value: string; type: string; onChange: (value: string) => void }) { return <Label className="gap-2">{human(label)}<Input type={type} value={value} onChange={(event) => onChange(event.target.value)} /></Label> }
function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) { return <Label className="gap-2">{human(label)}<Input type="number" min={0} value={value} onChange={(event) => onChange(Number(event.target.value))} /></Label> }
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) { return <label className="flex items-center gap-3 text-sm font-medium"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="size-4" />{label}</label> }
