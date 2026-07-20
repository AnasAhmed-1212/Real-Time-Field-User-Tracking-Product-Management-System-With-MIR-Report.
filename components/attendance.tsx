"use client"

import { useMemo, useState } from "react"
import {
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  FileSpreadsheet,
  LogOut,
  MapPin,
  Printer,
  Search,
  UserRoundX,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type AttendanceStatus = "Present" | "Working" | "Checked out" | "Late" | "Absent"
type AttendanceRecord = {
  id: number; name: string; initials: string; date: string; checkIn: string; checkOut: string;
  duration: string; start: string; end: string; status: AttendanceStatus; area: string
}

const records: AttendanceRecord[] = [
  { id: 1, name: "Ahmed Raza", initials: "AR", date: "2026-07-21", checkIn: "8:42 AM", checkOut: "—", duration: "3h 36m", start: "Gulberg III", end: "—", status: "Working", area: "Gulberg" },
  { id: 2, name: "Sara Khan", initials: "SK", date: "2026-07-21", checkIn: "9:01 AM", checkOut: "—", duration: "3h 17m", start: "DHA Phase 5", end: "—", status: "Working", area: "DHA" },
  { id: 3, name: "Bilal Ahmed", initials: "BA", date: "2026-07-21", checkIn: "8:54 AM", checkOut: "12:11 PM", duration: "3h 17m", start: "Model Town", end: "Garden Town", status: "Checked out", area: "Model Town" },
  { id: 4, name: "Ayesha Malik", initials: "AM", date: "2026-07-21", checkIn: "9:27 AM", checkOut: "—", duration: "2h 51m", start: "Johar Town", end: "—", status: "Late", area: "Johar Town" },
  { id: 5, name: "Hamza Iqbal", initials: "HI", date: "2026-07-21", checkIn: "—", checkOut: "—", duration: "—", start: "—", end: "—", status: "Absent", area: "Gulberg" },
  { id: 6, name: "Nida Fatima", initials: "NF", date: "2026-07-21", checkIn: "8:37 AM", checkOut: "11:48 AM", duration: "3h 11m", start: "Township", end: "Wapda Town", status: "Checked out", area: "Township" },
  { id: 7, name: "Usman Ali", initials: "UA", date: "2026-07-21", checkIn: "8:48 AM", checkOut: "—", duration: "3h 30m", start: "Cantt", end: "—", status: "Working", area: "Cantt" },
  { id: 8, name: "Mariam Saeed", initials: "MS", date: "2026-07-21", checkIn: "8:51 AM", checkOut: "5:12 PM", duration: "8h 21m", start: "Garden Town", end: "Garden Town", status: "Present", area: "Garden Town" },
  { id: 9, name: "Danish Noor", initials: "DN", date: "2026-07-20", checkIn: "8:46 AM", checkOut: "5:03 PM", duration: "8h 17m", start: "Wapda Town", end: "Johar Town", status: "Present", area: "Wapda Town" },
]

const statusVariant = (status: AttendanceStatus) => status === "Working" || status === "Present" ? "success" as const : status === "Late" ? "warning" as const : status === "Absent" ? "destructive" as const : "secondary" as const

export function Attendance() {
  const [dateMode, setDateMode] = useState<"single" | "range">("single")
  const [date, setDate] = useState("2026-07-21")
  const [fromDate, setFromDate] = useState("2026-07-15")
  const [toDate, setToDate] = useState("2026-07-21")
  const [query, setQuery] = useState("")
  const [userFilter, setUserFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [areaFilter, setAreaFilter] = useState("all")

  const filtered = useMemo(() => records.filter((record) => {
    const matchesDate = dateMode === "single" ? record.date === date : record.date >= fromDate && record.date <= toDate
    return matchesDate && record.name.toLowerCase().includes(query.toLowerCase()) &&
      (userFilter === "all" || record.name === userFilter) &&
      (statusFilter === "all" || record.status === statusFilter) &&
      (areaFilter === "all" || record.area === areaFilter)
  }), [areaFilter, date, dateMode, fromDate, query, statusFilter, toDate, userFilter])

  const todayRecords = records.filter((record) => record.date === "2026-07-21")
  const summaries = [
    { label: "Present today", value: todayRecords.filter((record) => record.status !== "Absent").length, helper: "of 8 scheduled", icon: CalendarCheck, color: "text-emerald-700 bg-emerald-50" },
    { label: "Checked out", value: todayRecords.filter((record) => record.status === "Checked out" || record.status === "Present").length, helper: "Completed shift", icon: LogOut, color: "text-blue-700 bg-blue-50" },
    { label: "Currently working", value: todayRecords.filter((record) => record.status === "Working" || record.status === "Late").length, helper: "Live attendance", icon: CheckCircle2, color: "text-violet-700 bg-violet-50" },
    { label: "Absent", value: todayRecords.filter((record) => record.status === "Absent").length, helper: "Not checked in", icon: UserRoundX, color: "text-red-700 bg-red-50" },
    { label: "Late", value: todayRecords.filter((record) => record.status === "Late").length, helper: "After 9:15 AM", icon: Clock3, color: "text-amber-700 bg-amber-50" },
  ]

  function exportCsv() {
    const header = ["User", "Date", "Check-in", "Check-out", "Total duration", "Starting location", "Ending location", "Status"]
    const rows = filtered.map((record) => [record.name, record.date, record.checkIn, record.checkOut, record.duration, record.start, record.end, record.status])
    const csv = [header, ...rows].map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(",")).join("\n")
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
    const link = document.createElement("a"); link.href = url; link.download = `attendance-${dateMode === "single" ? date : `${fromDate}-to-${toDate}`}.csv`; link.click(); URL.revokeObjectURL(url)
  }

  return (
    <main className="flex-1 bg-muted/25 p-4 sm:p-6 xl:p-8 print:bg-white print:p-0">
      <div className="mx-auto max-w-[1600px] space-y-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div><h1 className="text-2xl font-semibold tracking-tight">Attendance</h1><p className="mt-1 text-sm text-muted-foreground">Daily workforce attendance, working hours, and check-in locations.</p></div>
          <DropdownMenu><DropdownMenuTrigger render={<Button variant="outline" />}><Download /> Export report <ChevronDown /></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>Report options</DropdownMenuLabel><DropdownMenuItem onClick={exportCsv}><FileSpreadsheet /> Export CSV</DropdownMenuItem><DropdownMenuItem disabled><FileSpreadsheet /> Export Excel <Badge variant="secondary" className="ml-auto">Soon</Badge></DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem onClick={() => window.print()}><Printer /> Print report</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
        </div>

        <section aria-label="Attendance summary" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
          {summaries.map((summary) => <Card key={summary.label} className="rounded-xl shadow-none"><CardContent className="flex items-center gap-4 p-4"><span className={`flex size-10 items-center justify-center rounded-lg ${summary.color}`}><summary.icon className="size-4.5" /></span><div><p className="text-2xl font-semibold tracking-tight">{summary.value}</p><p className="text-sm font-medium">{summary.label}</p><p className="mt-0.5 text-xs text-muted-foreground">{summary.helper}</p></div></CardContent></Card>)}
        </section>

        <Card className="rounded-xl shadow-none print:hidden"><CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap gap-2"><Button variant={dateMode === "single" ? "default" : "outline"} size="sm" onClick={() => setDateMode("single")}>Single date</Button><Button variant={dateMode === "range" ? "default" : "outline"} size="sm" onClick={() => setDateMode("range")}>Date range</Button></div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            {dateMode === "single" ? <Input type="date" aria-label="Attendance date" value={date} onChange={(event) => setDate(event.target.value)} className="h-10" /> : <><Input type="date" aria-label="From date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="h-10" /><Input type="date" aria-label="To date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="h-10" /></>}
            <div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search user…" className="h-10 pl-9" /></div>
            <Select label="User" value={userFilter} onChange={setUserFilter}><option value="all">All users</option>{[...new Set(records.map((record) => record.name))].map((name) => <option key={name}>{name}</option>)}</Select>
            <Select label="Status" value={statusFilter} onChange={setStatusFilter}><option value="all">All statuses</option>{["Present", "Working", "Checked out", "Late", "Absent"].map((status) => <option key={status}>{status}</option>)}</Select>
            <Select label="Area" value={areaFilter} onChange={setAreaFilter}><option value="all">All areas</option>{[...new Set(records.map((record) => record.area))].map((area) => <option key={area}>{area}</option>)}</Select>
          </div>
        </CardContent></Card>

        <Card className="overflow-hidden rounded-xl shadow-none">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b px-5 py-4"><div><h2 className="font-semibold">Attendance report</h2><p className="mt-1 text-xs text-muted-foreground">{filtered.length} records for the selected period</p></div><Badge variant="outline" className="hidden sm:inline-flex">All times shown locally</Badge></div>
            <Table><TableHeader><TableRow><TableHead>User</TableHead><TableHead>Date</TableHead><TableHead>Check-in</TableHead><TableHead>Check-out</TableHead><TableHead>Total duration</TableHead><TableHead>Starting location</TableHead><TableHead>Ending location</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>
              {filtered.map((record) => <TableRow key={record.id}><TableCell><div className="flex items-center gap-2.5"><Avatar><AvatarFallback>{record.initials}</AvatarFallback></Avatar><span className="whitespace-nowrap font-medium">{record.name}</span></div></TableCell><TableCell className="whitespace-nowrap text-muted-foreground">{record.date}</TableCell><TableCell className="whitespace-nowrap font-medium">{record.checkIn}</TableCell><TableCell className="whitespace-nowrap">{record.checkOut}</TableCell><TableCell className="whitespace-nowrap tabular-nums">{record.duration}</TableCell><TableCell><span className="flex min-w-36 items-center gap-1.5 text-muted-foreground"><MapPin className="size-3.5" />{record.start}</span></TableCell><TableCell><span className="flex min-w-36 items-center gap-1.5 text-muted-foreground"><MapPin className="size-3.5" />{record.end}</span></TableCell><TableCell><Badge variant={statusVariant(record.status)}>{record.status}</Badge></TableCell></TableRow>)}
            </TableBody></Table>
            {!filtered.length && <div className="flex flex-col items-center py-16 text-center"><CalendarCheck className="size-9 text-muted-foreground" /><p className="mt-3 font-medium">No attendance records</p><p className="mt-1 text-sm text-muted-foreground">No records match the selected dates and filters.</p></div>}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) { return <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className="h-10 rounded-lg border bg-background px-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40">{children}</select> }
