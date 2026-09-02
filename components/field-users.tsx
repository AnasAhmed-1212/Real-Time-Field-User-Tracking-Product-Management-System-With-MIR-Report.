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
import type { FieldUser } from "@/lib/api-types"

const emptyForm = { name: "", employeeCode: "", email: "", phone: "", role: "Sales Executive", territory: "", password: "" }

export function FieldUsers() {
  const { data, loading, error, refresh } = useAdminResource<FieldUser[]>("field-users", [])
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState("")

  async function createUser(event: FormEvent) {
    event.preventDefault(); setSaving(true); setActionError("")
    try {
      await adminApi("field-users", { method: "POST", body: JSON.stringify(form) })
      setForm(emptyForm); setShowForm(false); await refresh()
    } catch (reason) { setActionError(reason instanceof Error ? reason.message : "Unable to create field user.") }
    finally { setSaving(false) }
  }

  async function changeStatus(user: FieldUser) {
    setActionError("")
    try { await adminApi("field-users/" + user.id + "/status", { method: "PATCH", body: JSON.stringify({ active: !user.active }) }); await refresh() }
    catch (reason) { setActionError(reason instanceof Error ? reason.message : "Unable to update user.") }
  }

  async function resetPassword(user: FieldUser) {
    const temporaryPassword = window.prompt("Enter a temporary password (at least 8 characters):")
    if (!temporaryPassword) return
    try { await adminApi("field-users/" + user.id + "/reset-password", { method: "POST", body: JSON.stringify({ temporaryPassword }) }); window.alert("Temporary password saved.") }
    catch (reason) { setActionError(reason instanceof Error ? reason.message : "Unable to reset password.") }
  }

  return <main className="flex-1 bg-muted/20 p-4 sm:p-6"><div className="mx-auto max-w-7xl space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-semibold">Field users</h1><p className="text-sm text-muted-foreground">Accounts used by the mobile sales application.</p></div><div className="flex gap-2"><Button variant="outline" onClick={() => refresh()}><RefreshCw /> Refresh</Button><Button onClick={() => setShowForm((value) => !value)}><Plus /> Add user</Button></div></div>
    {(error || actionError) && <ApiError message={error || actionError} />}
    {showForm && <Card><CardHeader><h2 className="font-semibold">Create field user</h2></CardHeader><CardContent><form onSubmit={createUser} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Object.entries(form).map(([key, value]) => <Label key={key} className="gap-2 capitalize">{key.replace(/([A-Z])/g, " $1")}<Input type={key === "password" ? "password" : key === "email" ? "email" : "text"} required value={value} minLength={key === "password" ? 8 : undefined} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} /></Label>)}<div className="flex items-end gap-2"><Button disabled={saving}>{saving ? "Saving…" : "Create user"}</Button><Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div></form></CardContent></Card>}
    <Card className="overflow-hidden">{loading ? <ApiLoading label="Loading field users…" /> : <Table><TableHeader><TableRow><TableHead>User</TableHead><TableHead>Code</TableHead><TableHead>Territory</TableHead><TableHead>Live state</TableHead><TableHead>Account</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{data.map((user) => <TableRow key={user.id}><TableCell><div className="font-medium">{user.name}</div><div className="text-xs text-muted-foreground">{user.email} · {user.phone}</div></TableCell><TableCell>{user.employeeCode}</TableCell><TableCell>{user.territory}</TableCell><TableCell><Badge variant={user.online ? "success" : "secondary"}>{user.online ? "Online" : "Offline"}</Badge><div className="mt-1 text-xs text-muted-foreground">{user.lastSeenAt ? new Date(user.lastSeenAt).toLocaleString() : "Never connected"}</div></TableCell><TableCell><Badge variant={user.active ? "outline" : "destructive"}>{user.active ? "Active" : "Disabled"}</Badge></TableCell><TableCell className="space-x-2 text-right"><Button size="sm" variant="outline" onClick={() => resetPassword(user)}>Reset password</Button><Button size="sm" variant={user.active ? "destructive" : "default"} onClick={() => changeStatus(user)}>{user.active ? "Disable" : "Activate"}</Button></TableCell></TableRow>)}</TableBody></Table>}
      {!loading && !data.length && <p className="p-10 text-center text-sm text-muted-foreground">No field users have been created.</p>}
    </Card>
  </div></main>
}
