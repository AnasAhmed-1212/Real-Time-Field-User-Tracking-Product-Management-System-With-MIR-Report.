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
import type { Product } from "@/lib/api-types"

const blank = { name: "", code: "", category: "", description: "", price: "", sku: "", unit: "unit", imageUrl: "" }

export function Products() {
  const { data, loading, error, refresh } = useAdminResource<Product[]>("products", [])
  const [form, setForm] = useState(blank)
  const [show, setShow] = useState(false)
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState("")

  async function create(event: FormEvent) {
    event.preventDefault(); setSaving(true); setActionError("")
    try {
      const { imageUrl, ...fields } = form
      await adminApi("products", { method: "POST", body: JSON.stringify({ ...fields, price: Number(fields.price), image: imageUrl ? { url: imageUrl } : undefined }) })
      setForm(blank); setShow(false); await refresh()
    } catch (reason) { setActionError(reason instanceof Error ? reason.message : "Unable to create product.") }
    finally { setSaving(false) }
  }

  async function toggle(product: Product) {
    try { await adminApi("products/" + product.databaseId, { method: "PATCH", body: JSON.stringify({ active: !product.active }) }); await refresh() }
    catch (reason) { setActionError(reason instanceof Error ? reason.message : "Unable to update product.") }
  }

  return <main className="flex-1 bg-muted/20 p-4 sm:p-6"><div className="mx-auto max-w-7xl space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-semibold">Products</h1><p className="text-sm text-muted-foreground">This catalog is downloaded by the mobile app.</p></div><div className="flex gap-2"><Button variant="outline" onClick={() => refresh()}><RefreshCw /> Refresh</Button><Button onClick={() => setShow((value) => !value)}><Plus /> Add product</Button></div></div>
    {(error || actionError) && <ApiError message={error || actionError} />}
    {show && <Card><CardHeader><h2 className="font-semibold">Create product</h2></CardHeader><CardContent><form onSubmit={create} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Object.entries(form).map(([key, value]) => <Label key={key} className="gap-2 capitalize">{key.replace(/([A-Z])/g, " $1")}<Input required={!["sku", "imageUrl"].includes(key)} type={key === "price" ? "number" : key === "imageUrl" ? "url" : "text"} min={key === "price" ? 0 : undefined} step={key === "price" ? "0.01" : undefined} value={value} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} /></Label>)}<div className="flex items-end gap-2"><Button disabled={saving}>{saving ? "Saving…" : "Create product"}</Button><Button type="button" variant="outline" onClick={() => setShow(false)}>Cancel</Button></div></form></CardContent></Card>}
    <Card className="overflow-hidden">{loading ? <ApiLoading label="Loading products…" /> : <Table><TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Code / SKU</TableHead><TableHead>Category</TableHead><TableHead>Price</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader><TableBody>{data.map((product) => <TableRow key={product.databaseId}><TableCell><div className="font-medium">{product.name}</div><div className="max-w-md truncate text-xs text-muted-foreground">{product.description}</div></TableCell><TableCell>{product.code}<div className="text-xs text-muted-foreground">{product.sku || "No SKU"}</div></TableCell><TableCell>{product.category}</TableCell><TableCell>{new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(product.price)} / {product.unit}</TableCell><TableCell><Badge variant={product.active ? "success" : "secondary"}>{product.active ? "Active" : "Inactive"}</Badge></TableCell><TableCell className="text-right"><Button size="sm" variant="outline" onClick={() => toggle(product)}>{product.active ? "Deactivate" : "Activate"}</Button></TableCell></TableRow>)}</TableBody></Table>}
      {!loading && !data.length && <p className="p-10 text-center text-sm text-muted-foreground">No products have been created.</p>}
    </Card>
  </div></main>
}
