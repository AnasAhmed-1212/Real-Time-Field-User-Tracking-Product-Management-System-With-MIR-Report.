"use client"

import { FormEvent, useState } from "react"
import { Pencil, Plus, RefreshCw, Trash2 } from "lucide-react"

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
  const { data, setData, loading, error, refresh } = useAdminResource<FieldUser[]>("field-users", [], 15_000)
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState("")

  function closeForm() {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(false)
  }

  function openCreateForm() {
    if (showForm && !editingId) return closeForm()
    setActionError("")
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(true)
  }

  function editUser(user: FieldUser) {
    setActionError("")
    setForm({ name: user.name, employeeCode: user.employeeCode, email: user.email, phone: user.phone, role: user.role, territory: user.territory, password: "" })
    setEditingId(user.id)
    setShowForm(true)
  }

  async function saveUser(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setActionError("")
    try {
      if (editingId) {
        const fields = { name: form.name, employeeCode: form.employeeCode, email: form.email, phone: form.phone, role: form.role, territory: form.territory }
        const updated = await adminApi<FieldUser>(`field-users/${editingId}`, { method: "PATCH", body: JSON.stringify(fields) })
        setData((current) => current.map((user) => user.id === editingId
          ? { ...user, ...updated, online: user.online, checkedIn: user.checkedIn, lastSeenAt: user.lastSeenAt, lastLocation: user.lastLocation }
          : user).sort((left, right) => left.name.localeCompare(right.name)))
      } else {
        const created = await adminApi<FieldUser>("field-users", { method: "POST", body: JSON.stringify(form) })
        setData((current) => [...current, created].sort((left, right) => left.name.localeCompare(right.name)))
      }
      closeForm()
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "Unable to save field user.")
    } finally {
      setSaving(false)
    }
  }

  async function changeStatus(user: FieldUser) {
    setActionError("")
    try {
      await adminApi(`field-users/${user.id}/status`, { method: "PATCH", body: JSON.stringify({ active: !user.active }) })
      await refresh()
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "Unable to update user.")
    }
  }

  async function resetPassword(user: FieldUser) {
    const temporaryPassword = window.prompt("Enter a temporary password (at least 8 characters):")
    if (!temporaryPassword) return
    setActionError("")
    try {
      await adminApi(`field-users/${user.id}/reset-password`, { method: "POST", body: JSON.stringify({ temporaryPassword }) })
      window.alert("Temporary password saved. The user can now sign in with it.")
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "Unable to reset password.")
    }
  }

  async function deleteUser(user: FieldUser) {
    if (!window.confirm(`Delete ${user.name}? Users with sales, attendance, activity, or location history must be disabled instead.`)) return
    setActionError("")
    try {
      await adminApi(`field-users/${user.id}`, { method: "DELETE" })
      setData((current) => current.filter((item) => item.id !== user.id))
      if (editingId === user.id) closeForm()
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "Unable to delete field user.")
    }
  }

  return <main className="flex-1 bg-muted/20 p-4 sm:p-6"><div className="mx-auto max-w-7xl space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-semibold">Field users</h1><p className="text-sm text-muted-foreground">Accounts used by the mobile sales application.</p></div><div className="flex gap-2"><Button variant="outline" onClick={() => refresh()}><RefreshCw /> Refresh</Button><Button onClick={openCreateForm}><Plus /> Add user</Button></div></div>
    {error && <ApiError message={error} />}
    {actionError && <ApiError title="Unable to save field user" message={actionError} />}
    {showForm && <Card><CardHeader><h2 className="font-semibold">{editingId ? "Edit field user" : "Create field user"}</h2><p className="text-sm text-muted-foreground">All fields are required, including phone. New passwords must contain at least 8 characters.</p></CardHeader><CardContent><form onSubmit={saveUser} onInvalid={(event) => {
      const input = event.target as HTMLInputElement
      setActionError(`${input.labels?.[0]?.textContent?.trim() || "Field"}: ${input.validationMessage}`)
    }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Object.entries(form).filter(([key]) => !editingId || key !== "password").map(([key, value]) => <Label key={key} className="gap-2 capitalize">{key.replace(/([A-Z])/g, " $1")}<Input name={key} type={key === "phone" ? "tel" : key === "password" ? "password" : key === "email" ? "email" : "text"} required value={value} minLength={key === "password" ? 8 : undefined} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} /></Label>)}<div className="flex items-end gap-2"><Button type="submit" disabled={saving}>{saving ? "Saving…" : editingId ? "Save changes" : "Create user"}</Button><Button type="button" variant="outline" onClick={closeForm}>Cancel</Button></div></form></CardContent></Card>}
    <Card className="overflow-hidden">{loading ? <ApiLoading label="Loading field users…" /> : <Table><TableHeader><TableRow><TableHead>User</TableHead><TableHead>Code</TableHead><TableHead>Territory</TableHead><TableHead>Live state</TableHead><TableHead>Account</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{data.map((user) => <TableRow key={user.id}><TableCell><div className="font-medium">{user.name}</div><div className="text-xs text-muted-foreground">{user.email} · {user.phone}</div></TableCell><TableCell>{user.employeeCode}</TableCell><TableCell>{user.territory}</TableCell><TableCell><Badge variant={user.online ? "success" : "secondary"}>{user.online ? "Online" : "Offline"}</Badge><div className="mt-1 text-xs text-muted-foreground">{user.lastSeenAt ? new Date(user.lastSeenAt).toLocaleString() : "Never connected"}</div></TableCell><TableCell><Badge variant={user.active ? "outline" : "destructive"}>{user.active ? "Active" : "Disabled"}</Badge></TableCell><TableCell><div className="flex flex-wrap justify-end gap-2"><Button size="sm" variant="outline" onClick={() => editUser(user)}><Pencil /> Edit</Button><Button size="sm" variant="outline" onClick={() => resetPassword(user)}>Reset password</Button><Button size="sm" variant={user.active ? "destructive" : "default"} onClick={() => changeStatus(user)}>{user.active ? "Disable" : "Activate"}</Button><Button size="sm" variant="destructive" onClick={() => deleteUser(user)}><Trash2 /> Delete</Button></div></TableCell></TableRow>)}</TableBody></Table>}
      {!loading && !data.length && <p className="p-10 text-center text-sm text-muted-foreground">No field users have been created.</p>}
    </Card>
  </div></main>
}
