"use client"

import { FormEvent, useMemo, useState } from "react"
import {
  Activity,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  History,
  KeyRound,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  Power,
  Search,
  UsersRound,
} from "lucide-react"

import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type FieldUser = {
  id: number; name: string; initials: string; code: string; phone: string; email: string; role: string;
  online: boolean; checkedIn: boolean; lastSeen: string; location: string; active: boolean; joined: string
}

const initialUsers: FieldUser[] = [
  { id: 1, name: "Ahmed Raza", initials: "AR", code: "EMP-1042", phone: "+92 300 1234567", email: "ahmed@company.com", role: "Sales Executive", online: true, checkedIn: true, lastSeen: "Just now", location: "Gulberg III", active: true, joined: "2025-01-14" },
  { id: 2, name: "Sara Khan", initials: "SK", code: "EMP-1048", phone: "+92 321 7283041", email: "sara@company.com", role: "Team Lead", online: true, checkedIn: true, lastSeen: "2 min ago", location: "DHA Phase 5", active: true, joined: "2024-11-08" },
  { id: 3, name: "Bilal Ahmed", initials: "BA", code: "EMP-1051", phone: "+92 333 8821034", email: "bilal@company.com", role: "Field Officer", online: false, checkedIn: true, lastSeen: "18 min ago", location: "Model Town", active: true, joined: "2025-02-21" },
  { id: 4, name: "Ayesha Malik", initials: "AM", code: "EMP-1056", phone: "+92 301 6729104", email: "ayesha@company.com", role: "Sales Executive", online: true, checkedIn: false, lastSeen: "5 min ago", location: "Johar Town", active: true, joined: "2025-03-04" },
  { id: 5, name: "Hamza Iqbal", initials: "HI", code: "EMP-1060", phone: "+92 322 5108294", email: "hamza@company.com", role: "Field Officer", online: false, checkedIn: false, lastSeen: "1 hr ago", location: "Liberty Market", active: false, joined: "2024-12-19" },
  { id: 6, name: "Nida Fatima", initials: "NF", code: "EMP-1064", phone: "+92 304 2217850", email: "nida@company.com", role: "Merchandiser", online: false, checkedIn: true, lastSeen: "24 min ago", location: "Township", active: true, joined: "2025-04-11" },
  { id: 7, name: "Usman Ali", initials: "UA", code: "EMP-1069", phone: "+92 315 9928017", email: "usman@company.com", role: "Sales Executive", online: true, checkedIn: true, lastSeen: "Just now", location: "Cantt", active: true, joined: "2025-05-02" },
  { id: 8, name: "Mariam Saeed", initials: "MS", code: "EMP-1073", phone: "+92 320 4510876", email: "mariam@company.com", role: "Merchandiser", online: false, checkedIn: false, lastSeen: "2 hr ago", location: "Garden Town", active: false, joined: "2025-05-23" },
]

type SheetMode = "add" | "edit" | "view" | null

export function FieldUsers() {
  const [users, setUsers] = useState(initialUsers)
  const [query, setQuery] = useState("")
  const [accountFilter, setAccountFilter] = useState("all")
  const [onlineFilter, setOnlineFilter] = useState("all")
  const [checkInFilter, setCheckInFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("")
  const [sheetMode, setSheetMode] = useState<SheetMode>(null)
  const [selected, setSelected] = useState<FieldUser | null>(null)
  const [resetUser, setResetUser] = useState<FieldUser | null>(null)
  const [statusUser, setStatusUser] = useState<FieldUser | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 6

  const filtered = useMemo(() => users.filter((user) => {
    const text = `${user.name} ${user.code} ${user.phone}`.toLowerCase()
    return text.includes(query.toLowerCase()) &&
      (accountFilter === "all" || String(user.active) === accountFilter) &&
      (onlineFilter === "all" || String(user.online) === onlineFilter) &&
      (checkInFilter === "all" || String(user.checkedIn) === checkInFilter) &&
      (roleFilter === "all" || user.role === roleFilter) &&
      (!dateFilter || user.joined >= dateFilter)
  }), [accountFilter, checkInFilter, dateFilter, onlineFilter, query, roleFilter, users])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const displayed = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  function openSheet(mode: SheetMode, user: FieldUser | null = null) { setSelected(user); setSheetMode(mode) }
  function saveUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const name = String(data.get("name")); const role = String(data.get("role")); const phone = String(data.get("phone")); const email = String(data.get("email"))
    if (sheetMode === "edit" && selected) setUsers((current) => current.map((user) => user.id === selected.id ? { ...user, name, role, phone, email, initials: name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() } : user))
    if (sheetMode === "add") setUsers((current) => [{ id: Date.now(), name, initials: name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(), code: `EMP-${1080 + current.length}`, phone, email, role, online: false, checkedIn: false, lastSeen: "Never", location: "Location unavailable", active: true, joined: new Date().toISOString().slice(0, 10) }, ...current])
    setSheetMode(null)
  }
  function toggleAccount() { if (!statusUser) return; setUsers((current) => current.map((user) => user.id === statusUser.id ? { ...user, active: !user.active } : user)); setStatusUser(null) }

  return (
    <main className="flex-1 bg-muted/25 p-4 sm:p-6 xl:p-8">
      <div className="mx-auto max-w-[1600px] space-y-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div><h1 className="text-2xl font-semibold tracking-tight">Field users</h1><p className="mt-1 text-sm text-muted-foreground">Manage field accounts, access, roles, and workforce status.</p></div>
          <Button size="lg" onClick={() => openSheet("add")}><Plus /> Add user</Button>
        </div>

        <Card className="rounded-xl shadow-none"><CardContent className="p-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(220px,1.5fr)_repeat(5,minmax(130px,1fr))]">
            <div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} placeholder="Search name, code or phone…" className="h-10 pl-9" /></div>
            <Filter value={accountFilter} onChange={setAccountFilter} label="Account"><option value="all">All accounts</option><option value="true">Active</option><option value="false">Inactive</option></Filter>
            <Filter value={onlineFilter} onChange={setOnlineFilter} label="Current status"><option value="all">Online & offline</option><option value="true">Online</option><option value="false">Offline</option></Filter>
            <Filter value={checkInFilter} onChange={setCheckInFilter} label="Attendance"><option value="all">All check-ins</option><option value="true">Checked in</option><option value="false">Checked out</option></Filter>
            <Filter value={roleFilter} onChange={setRoleFilter} label="Role"><option value="all">All roles</option>{[...new Set(users.map((user) => user.role))].map((role) => <option key={role}>{role}</option>)}</Filter>
            <Input type="date" aria-label="Date joined" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="h-10" />
          </div>
        </CardContent></Card>

        <Card className="overflow-visible rounded-xl shadow-none">
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Employee code</TableHead><TableHead>Phone</TableHead><TableHead>Assigned role</TableHead><TableHead>Current status</TableHead><TableHead>Check-in status</TableHead><TableHead>Last seen</TableHead><TableHead>Last location</TableHead><TableHead>Account status</TableHead><TableHead className="w-16 text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>{displayed.map((user) => <TableRow key={user.id}>
                <TableCell><button onClick={() => openSheet("view", user)} className="flex items-center gap-2.5 text-left"><Avatar><AvatarFallback>{user.initials}</AvatarFallback></Avatar><span><span className="block whitespace-nowrap font-medium">{user.name}</span><span className="block text-xs text-muted-foreground">{user.email}</span></span></button></TableCell>
                <TableCell className="font-mono text-xs">{user.code}</TableCell><TableCell className="whitespace-nowrap text-muted-foreground">{user.phone}</TableCell><TableCell className="whitespace-nowrap">{user.role}</TableCell>
                <TableCell><Badge variant={user.online ? "success" : "secondary"}><span className={`size-1.5 rounded-full ${user.online ? "bg-emerald-500" : "bg-neutral-400"}`} />{user.online ? "Online" : "Offline"}</Badge></TableCell>
                <TableCell><Badge variant={user.checkedIn ? "outline" : "secondary"}>{user.checkedIn ? "Checked in" : "Checked out"}</Badge></TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">{user.lastSeen}</TableCell><TableCell><span className="flex min-w-36 items-center gap-1 text-muted-foreground"><MapPin className="size-3.5" />{user.location}</span></TableCell>
                <TableCell><Badge variant={user.active ? "success" : "destructive"}>{user.active ? "Active" : "Inactive"}</Badge></TableCell>
                <TableCell className="text-right"><UserActions user={user} onView={() => openSheet("view", user)} onEdit={() => openSheet("edit", user)} onStatus={() => setStatusUser(user)} onReset={() => setResetUser(user)} /></TableCell>
              </TableRow>)}</TableBody>
            </Table>
            {!displayed.length && <div className="flex flex-col items-center py-16 text-center"><UsersRound className="size-9 text-muted-foreground" /><p className="mt-3 font-medium">No field users found</p><p className="mt-1 text-sm text-muted-foreground">Try changing or clearing the selected filters.</p></div>}
            <div className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 text-sm sm:flex-row"><p className="text-muted-foreground">Showing {displayed.length} of {filtered.length} users</p><div className="flex items-center gap-2"><Button variant="outline" size="icon-sm" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft /><span className="sr-only">Previous</span></Button><span className="text-xs">Page {currentPage} of {pageCount}</span><Button variant="outline" size="icon-sm" disabled={currentPage >= pageCount} onClick={() => setPage(currentPage + 1)}><ChevronRight /><span className="sr-only">Next</span></Button></div></div>
          </CardContent>
        </Card>
      </div>

      <UserSheet mode={sheetMode} user={selected} open={sheetMode !== null} onOpenChange={(open) => !open && setSheetMode(null)} onSubmit={saveUser} />
      <Dialog open={resetUser !== null} onOpenChange={(open) => !open && setResetUser(null)}><DialogContent><DialogHeader><DialogTitle>Reset password</DialogTitle><DialogDescription>Send a temporary password to {resetUser?.name}. They will be required to change it at the next login.</DialogDescription></DialogHeader><div className="mt-5 space-y-2"><Label htmlFor="temporary-password">Temporary password</Label><Input id="temporary-password" defaultValue="Temp@1234" /></div><DialogFooter><DialogClose render={<Button variant="outline" />}>Cancel</DialogClose><DialogClose render={<Button />}>Reset password</DialogClose></DialogFooter></DialogContent></Dialog>
      <AlertDialog open={statusUser !== null} onOpenChange={(open) => !open && setStatusUser(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{statusUser?.active ? "Deactivate" : "Activate"} {statusUser?.name}?</AlertDialogTitle><AlertDialogDescription>{statusUser?.active ? "This user will lose access to the field application immediately. Existing activity and attendance records will remain available." : "This user will regain access to the field application."}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel render={<Button variant="outline" />}>Cancel</AlertDialogCancel><Button variant={statusUser?.active ? "destructive" : "default"} onClick={toggleAccount}>{statusUser?.active ? "Deactivate user" : "Activate user"}</Button></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </main>
  )
}

function Filter({ value, onChange, label, children }: { value: string; onChange: (value: string) => void; label: string; children: React.ReactNode }) { return <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className="h-10 rounded-lg border bg-background px-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40">{children}</select> }

function UserActions({ user, onView, onEdit, onStatus, onReset }: { user: FieldUser; onView: () => void; onEdit: () => void; onStatus: () => void; onReset: () => void }) {
  return <DropdownMenu><DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}><MoreHorizontal /><span className="sr-only">Open actions</span></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>{user.name}</DropdownMenuLabel><DropdownMenuItem onClick={onView}><Eye /> View user</DropdownMenuItem><DropdownMenuItem onClick={onEdit}><Pencil /> Edit user</DropdownMenuItem><DropdownMenuItem onClick={onReset}><KeyRound /> Reset password</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem><CalendarDays /> View attendance</DropdownMenuItem><DropdownMenuItem><Activity /> View activity</DropdownMenuItem><DropdownMenuItem><History /> View location history</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem onClick={onStatus} className={user.active ? "text-destructive" : ""}><Power /> {user.active ? "Deactivate" : "Activate"}</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
}

function UserSheet({ mode, user, open, onOpenChange, onSubmit }: { mode: SheetMode; user: FieldUser | null; open: boolean; onOpenChange: (open: boolean) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  const isView = mode === "view"
  return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent className="w-full overflow-y-auto sm:max-w-xl"><SheetHeader className="border-b p-6"><SheetTitle>{mode === "add" ? "Add field user" : mode === "edit" ? "Edit field user" : "Field user profile"}</SheetTitle><SheetDescription>{isView ? "Account, attendance, and latest operational details." : "Enter the user’s account and work assignment information."}</SheetDescription></SheetHeader>{isView && user ? <div className="p-6"><div className="flex items-center gap-4"><Avatar className="size-14"><AvatarFallback className="text-base">{user.initials}</AvatarFallback></Avatar><div><h2 className="font-semibold">{user.name}</h2><p className="text-sm text-muted-foreground">{user.code} · {user.role}</p></div></div><Tabs defaultValue="profile" className="mt-6"><TabsList className="w-full"><TabsTrigger value="profile" className="flex-1">Profile</TabsTrigger><TabsTrigger value="attendance" className="flex-1">Attendance</TabsTrigger><TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger></TabsList><TabsContent value="profile"><InfoRows user={user} /></TabsContent><TabsContent value="attendance"><EmptyTab icon={CalendarDays} title="Attendance summary" text={user.checkedIn ? "Currently checked in for today." : "Not currently checked in."} /></TabsContent><TabsContent value="activity"><EmptyTab icon={Activity} title="Recent activity" text="12 activities submitted during the last 7 days." /></TabsContent></Tabs></div> : <form onSubmit={onSubmit} className="flex min-h-full flex-col"><div className="grid gap-5 p-6 sm:grid-cols-2"><Field label="Full name" name="name" defaultValue={user?.name} /><Field label="Employee code" name="code" defaultValue={user?.code} disabled={mode === "edit"} /><Field label="Email address" name="email" type="email" defaultValue={user?.email} /><Field label="Phone number" name="phone" defaultValue={user?.phone} /><label className="space-y-2 text-sm font-medium sm:col-span-2">Assigned role<select name="role" defaultValue={user?.role ?? "Sales Executive"} className="h-10 w-full rounded-lg border bg-background px-2.5 font-normal"><option>Sales Executive</option><option>Field Officer</option><option>Team Lead</option><option>Merchandiser</option></select></label><Field label="Assigned area" name="area" defaultValue={user?.location} className="sm:col-span-2" /></div><SheetFooter className="border-t"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit">{mode === "add" ? "Create user" : "Save changes"}</Button></SheetFooter></form>}</SheetContent></Sheet>
}

function Field({ label, name, defaultValue, type = "text", disabled, className }: { label: string; name: string; defaultValue?: string; type?: string; disabled?: boolean; className?: string }) { return <label className={`space-y-2 text-sm font-medium ${className ?? ""}`}>{label}<Input name={name} type={type} defaultValue={defaultValue} disabled={disabled} required={!disabled} className="mt-2 h-10 font-normal" /></label> }
function InfoRows({ user }: { user: FieldUser }) { return <dl className="divide-y rounded-xl border text-sm">{[["Email", user.email], ["Phone", user.phone], ["Role", user.role], ["Last location", user.location], ["Date joined", user.joined], ["Account", user.active ? "Active" : "Inactive"]].map(([label, value]) => <div className="flex justify-between gap-4 p-3" key={label}><dt className="text-muted-foreground">{label}</dt><dd className="text-right font-medium">{value}</dd></div>)}</dl> }
function EmptyTab({ icon: Icon, title, text }: { icon: typeof Clock3; title: string; text: string }) { return <div className="rounded-xl border p-6 text-center"><Icon className="mx-auto size-6 text-muted-foreground" /><p className="mt-3 text-sm font-medium">{title}</p><p className="mt-1 text-xs text-muted-foreground">{text}</p></div> }
