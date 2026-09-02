"use client"

import { useMemo, useState } from "react"
import { RefreshCw, Search } from "lucide-react"

import { ApiError, ApiLoading } from "@/components/api-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAdminResource } from "@/hooks/use-admin-resource"
import { adminApi } from "@/lib/admin-api"
import type { ActivityRecord } from "@/lib/api-types"

export function Activities() {
  const { data, loading, error, refresh } = useAdminResource<ActivityRecord[]>("activities", [])
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("all")
  const [actionError, setActionError] = useState("")
  const filtered = useMemo(() => data.filter((item) => (status === "all" || item.status === status) && (item.description + " " + item.user?.name + " " + item.outletName).toLowerCase().includes(query.toLowerCase())), [data, query, status])

  async function review(id: string, next: "Approved" | "Flagged") {
    try { await adminApi("activities/" + id + "/review", { method: "PATCH", body: JSON.stringify({ status: next }) }); await refresh() }
    catch (reason) { setActionError(reason instanceof Error ? reason.message : "Unable to review activity.") }
  }

  return <main className="flex-1 bg-muted/20 p-4 sm:p-6"><div className="mx-auto max-w-7xl space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-semibold">Activities</h1><p className="text-sm text-muted-foreground">Sales and visits submitted by field users.</p></div><Button variant="outline" onClick={() => refresh()}><RefreshCw /> Refresh</Button></div>
    {(error || actionError) && <ApiError message={error || actionError} />}
    <div className="flex flex-wrap gap-2"><div className="relative min-w-64 flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search activities…" value={query} onChange={(event) => setQuery(event.target.value)} /></div><select className="rounded-md border bg-background px-3 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option><option>Pending</option><option>Approved</option><option>Flagged</option></select></div>
    <Card className="overflow-hidden">{loading ? <ApiLoading label="Loading activities…" /> : <Table><TableHeader><TableRow><TableHead>User</TableHead><TableHead>Activity</TableHead><TableHead>Location</TableHead><TableHead>Submitted</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Review</TableHead></TableRow></TableHeader><TableBody>{filtered.map((item) => <TableRow key={item.id}><TableCell className="font-medium">{item.user?.name || "Unknown user"}</TableCell><TableCell><div>{item.description}</div><div className="text-xs text-muted-foreground">{item.type} · {item.outletName || "No outlet"}</div></TableCell><TableCell>{item.location?.area || "—"}</TableCell><TableCell>{new Date(item.submittedAt).toLocaleString()}</TableCell><TableCell><Badge variant={item.status === "Approved" ? "success" : item.status === "Flagged" ? "destructive" : "warning"}>{item.status}</Badge></TableCell><TableCell className="space-x-2 text-right"><Button size="sm" variant="outline" onClick={() => review(item.id, "Approved")}>Approve</Button><Button size="sm" variant="destructive" onClick={() => review(item.id, "Flagged")}>Flag</Button></TableCell></TableRow>)}</TableBody></Table>}
      {!loading && !filtered.length && <p className="p-10 text-center text-sm text-muted-foreground">No activities match this view.</p>}
    </Card>
  </div></main>
}
