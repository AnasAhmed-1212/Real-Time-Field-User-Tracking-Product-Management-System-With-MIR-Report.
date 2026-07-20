"use client"

import { ChangeEvent, DragEvent, FormEvent, useRef, useState } from "react"
import {
  AlertCircle,
  Boxes,
  CheckCircle2,
  Grid2X2,
  ImagePlus,
  List,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  Power,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Product = { id: number; name: string; code: string; category: string; description: string; active: boolean; created: string; price?: string; sku?: string; tone: string }

const initialProducts: Product[] = [
  { id: 1, name: "Classic Black Tea", code: "PRD-1001", category: "Beverages", description: "Premium loose-leaf black tea for retail outlets.", active: true, created: "Jul 18, 2026", price: "Rs. 850", sku: "CBT-500", tone: "bg-amber-100 text-amber-800" },
  { id: 2, name: "Organic Green Tea", code: "PRD-1002", category: "Beverages", description: "Organic green tea bags in a 25-count box.", active: true, created: "Jul 16, 2026", price: "Rs. 720", sku: "OGT-025", tone: "bg-emerald-100 text-emerald-800" },
  { id: 3, name: "Whole Wheat Biscuits", code: "PRD-1003", category: "Snacks", description: "Fiber-rich wheat biscuits for everyday snacking.", active: true, created: "Jul 12, 2026", price: "Rs. 240", sku: "WWB-200", tone: "bg-orange-100 text-orange-800" },
  { id: 4, name: "Natural Mineral Water", code: "PRD-1004", category: "Beverages", description: "Purified mineral water in a 1.5 litre bottle.", active: false, created: "Jul 08, 2026", price: "Rs. 110", sku: "NMW-1500", tone: "bg-sky-100 text-sky-800" },
  { id: 5, name: "Premium Basmati Rice", code: "PRD-1005", category: "Grocery", description: "Long-grain aged basmati rice, five kilogram pack.", active: true, created: "Jun 29, 2026", price: "Rs. 2,450", sku: "PBR-5KG", tone: "bg-yellow-100 text-yellow-800" },
  { id: 6, name: "Herbal Shampoo", code: "PRD-1006", category: "Personal Care", description: "Gentle herbal shampoo with aloe and green tea.", active: true, created: "Jun 22, 2026", price: "Rs. 640", sku: "HSP-400", tone: "bg-violet-100 text-violet-800" },
]

type View = "table" | "cards"

export function Products() {
  const [products, setProducts] = useState(initialProducts)
  const [view, setView] = useState<View>("table")
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [status, setStatus] = useState("all")
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)

  const filtered = products.filter((product) => `${product.name} ${product.code} ${product.description}`.toLowerCase().includes(query.toLowerCase()) && (category === "all" || product.category === category) && (status === "all" || String(product.active) === status))

  function openForm(product: Product | null = null) { setEditing(product); setSheetOpen(true) }
  function toggleProduct(product: Product) { setProducts((current) => current.map((item) => item.id === product.id ? { ...item, active: !item.active } : item)) }
  function deleteProduct(product: Product) { setProducts((current) => current.filter((item) => item.id !== product.id)) }
  function saveProduct(event: FormEvent<HTMLFormElement>, imageFile: File | null) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    if (imageFile) data.set("image", imageFile)
    const name = String(data.get("name")); const productCategory = String(data.get("category")); const description = String(data.get("description")); const code = String(data.get("code")); const active = data.get("active") === "on"
    const payload = { name, category: productCategory, description, code, active, price: String(data.get("price") || ""), sku: String(data.get("sku") || "") }
    if (editing) setProducts((current) => current.map((item) => item.id === editing.id ? { ...item, ...payload } : item))
    else setProducts((current) => [{ id: Date.now(), ...payload, created: "Jul 21, 2026", tone: "bg-neutral-100 text-neutral-800" }, ...current])
    // `data` is intentionally multipart FormData. Send it to the product API or
    // cloud-storage signed upload endpoint; never serialize the image as Base64.
    setSheetOpen(false)
  }

  return (
    <main className="flex-1 bg-muted/25 p-4 sm:p-6 xl:p-8">
      <div className="mx-auto max-w-[1600px] space-y-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h1 className="text-2xl font-semibold tracking-tight">Products</h1><p className="mt-1 text-sm text-muted-foreground">Manage the product catalog available to your field teams.</p></div><Button size="lg" onClick={() => openForm()}><Plus /> Add product</Button></div>

        <Card className="rounded-xl shadow-none"><CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products, codes or descriptions…" className="h-10 pl-9" /></div>
          <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Category" className="h-10 rounded-lg border bg-background px-3 text-sm"><option value="all">All categories</option>{[...new Set(products.map((product) => product.category))].map((item) => <option key={item}>{item}</option>)}</select>
          <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Status" className="h-10 rounded-lg border bg-background px-3 text-sm"><option value="all">All statuses</option><option value="true">Active</option><option value="false">Inactive</option></select>
          <div className="flex h-10 rounded-lg border bg-background p-1"><Button size="sm" variant={view === "table" ? "secondary" : "ghost"} onClick={() => setView("table")}><List /> Table</Button><Button size="sm" variant={view === "cards" ? "secondary" : "ghost"} onClick={() => setView("cards")}><Grid2X2 /> Cards</Button></div>
        </CardContent></Card>

        {view === "table" ? <ProductTable products={filtered} onEdit={openForm} onToggle={toggleProduct} onDelete={deleteProduct} /> : <ProductCards products={filtered} onEdit={openForm} onToggle={toggleProduct} />}
      </div>
      <ProductSheet open={sheetOpen} onOpenChange={setSheetOpen} product={editing} onSubmit={saveProduct} />
    </main>
  )
}

function ProductImage({ product, large = false }: { product: Product; large?: boolean }) { return <span className={`flex shrink-0 items-center justify-center rounded-lg ${large ? "size-14" : "size-10"} ${product.tone}`}><Package className={large ? "size-6" : "size-4"} /></span> }

function ProductTable({ products, onEdit, onToggle, onDelete }: { products: Product[]; onEdit: (product: Product) => void; onToggle: (product: Product) => void; onDelete: (product: Product) => void }) {
  return <Card className="overflow-visible rounded-xl shadow-none"><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Image</TableHead><TableHead>Product name</TableHead><TableHead>Product code</TableHead><TableHead>Category</TableHead><TableHead>Short description</TableHead><TableHead>Status</TableHead><TableHead>Created date</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{products.map((product) => <TableRow key={product.id}><TableCell><ProductImage product={product} /></TableCell><TableCell><div className="min-w-40"><p className="font-medium">{product.name}</p><p className="mt-0.5 text-xs text-muted-foreground">{product.sku}</p></div></TableCell><TableCell className="whitespace-nowrap font-mono text-xs">{product.code}</TableCell><TableCell><Badge variant="outline">{product.category}</Badge></TableCell><TableCell><p className="max-w-sm min-w-56 truncate text-muted-foreground">{product.description}</p></TableCell><TableCell><Badge variant={product.active ? "success" : "secondary"}>{product.active ? "Active" : "Inactive"}</Badge></TableCell><TableCell className="whitespace-nowrap text-muted-foreground">{product.created}</TableCell><TableCell className="text-right"><ProductActions product={product} onEdit={() => onEdit(product)} onToggle={() => onToggle(product)} onDelete={() => onDelete(product)} /></TableCell></TableRow>)}</TableBody></Table>{!products.length && <EmptyProducts />}</CardContent></Card>
}

function ProductCards({ products, onEdit, onToggle }: { products: Product[]; onEdit: (product: Product) => void; onToggle: (product: Product) => void }) { return products.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{products.map((product) => <Card key={product.id} className="rounded-xl shadow-none"><CardContent className="p-5"><div className="flex items-start justify-between"><ProductImage product={product} large /><Badge variant={product.active ? "success" : "secondary"}>{product.active ? "Active" : "Inactive"}</Badge></div><h2 className="mt-4 font-semibold">{product.name}</h2><p className="mt-1 text-xs text-muted-foreground">{product.code} · {product.category}</p><p className="mt-3 line-clamp-2 min-h-10 text-sm text-muted-foreground">{product.description}</p><div className="mt-5 flex items-center justify-between border-t pt-4"><span className="text-sm font-semibold">{product.price}</span><div className="flex gap-1"><Button variant="ghost" size="icon-sm" onClick={() => onToggle(product)}><Power /><span className="sr-only">Toggle status</span></Button><Button variant="outline" size="sm" onClick={() => onEdit(product)}><Pencil /> Edit</Button></div></div></CardContent></Card>)}</div> : <Card><EmptyProducts /></Card> }

function ProductActions({ product, onEdit, onToggle, onDelete }: { product: Product; onEdit: () => void; onToggle: () => void; onDelete: () => void }) { return <DropdownMenu><DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}><MoreHorizontal /><span className="sr-only">Product actions</span></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>{product.name}</DropdownMenuLabel><DropdownMenuItem onClick={onEdit}><Pencil /> Edit product</DropdownMenuItem><DropdownMenuItem onClick={onToggle}><Power /> Make {product.active ? "inactive" : "active"}</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem onClick={onDelete} className="text-destructive"><Trash2 /> Delete product</DropdownMenuItem></DropdownMenuContent></DropdownMenu> }

function EmptyProducts() { return <div className="flex flex-col items-center py-16 text-center"><Boxes className="size-9 text-muted-foreground" /><p className="mt-3 font-medium">No products found</p><p className="mt-1 text-sm text-muted-foreground">Try changing the search or selected filters.</p></div> }

function ProductSheet({ open, onOpenChange, product, onSubmit }: { open: boolean; onOpenChange: (open: boolean) => void; product: Product | null; onSubmit: (event: FormEvent<HTMLFormElement>, image: File | null) => void }) {
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState("")
  const [progress, setProgress] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const uploadTimer = useRef<number | null>(null)

  function acceptFile(file: File) {
    setUploadError("")
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setUploadError("Unsupported format. Choose a JPG, PNG, or WebP image."); return }
    if (file.size > 5 * 1024 * 1024) { setUploadError("Image is larger than the 5 MB file-size limit."); return }
    if (preview) URL.revokeObjectURL(preview)
    setImage(file); setPreview(URL.createObjectURL(file)); setProgress(15)
    if (uploadTimer.current) window.clearInterval(uploadTimer.current)
    uploadTimer.current = window.setInterval(() => setProgress((value) => { if (value >= 100) { if (uploadTimer.current) window.clearInterval(uploadTimer.current); uploadTimer.current = null; return 100 } return Math.min(100, value + 17) }), 90)
  }
  function onFileChange(event: ChangeEvent<HTMLInputElement>) { const file = event.target.files?.[0]; if (file) acceptFile(file) }
  function onDrop(event: DragEvent<HTMLDivElement>) { event.preventDefault(); const file = event.dataTransfer.files[0]; if (file) acceptFile(file) }
  function removeImage() { if (uploadTimer.current) window.clearInterval(uploadTimer.current); uploadTimer.current = null; if (preview) URL.revokeObjectURL(preview); setImage(null); setPreview(null); setProgress(0); if (inputRef.current) inputRef.current.value = "" }
  function close(value: boolean) { if (!value) removeImage(); onOpenChange(value) }

  return <Sheet open={open} onOpenChange={close}><SheetContent className="w-full overflow-y-auto sm:max-w-xl"><SheetHeader className="border-b p-6"><SheetTitle>{product ? "Edit product" : "Add product"}</SheetTitle><SheetDescription>{product ? "Update catalog information and product availability." : "Create a product for your field sales catalog."}</SheetDescription></SheetHeader><form onSubmit={(event) => { onSubmit(event, image); removeImage() }}><div className="grid gap-5 p-6 sm:grid-cols-2"><Field label="Product name" name="name" defaultValue={product?.name} /><Field label="Product code" name="code" defaultValue={product?.code} /><label className="space-y-2 text-sm font-medium sm:col-span-2">Category<select name="category" defaultValue={product?.category ?? "Beverages"} className="mt-2 h-10 w-full rounded-lg border bg-background px-2.5 font-normal"><option>Beverages</option><option>Snacks</option><option>Grocery</option><option>Personal Care</option><option>Other</option></select></label><label className="space-y-2 text-sm font-medium sm:col-span-2">Description<textarea name="description" defaultValue={product?.description} required rows={3} className="mt-2 w-full resize-none rounded-lg border bg-background p-2.5 font-normal outline-none focus:ring-2 focus:ring-ring/40" /></label><Field label="Price (optional)" name="price" defaultValue={product?.price} /><Field label="SKU (optional)" name="sku" defaultValue={product?.sku} /><label className="space-y-2 text-sm font-medium sm:col-span-2">Notes (optional)<textarea name="notes" rows={2} className="mt-2 w-full resize-none rounded-lg border bg-background p-2.5 font-normal" /></label><label className="flex items-center gap-2.5 text-sm font-medium sm:col-span-2"><input name="active" type="checkbox" defaultChecked={product?.active ?? true} className="size-4 accent-neutral-950" />Active product</label><div className="space-y-2 sm:col-span-2"><Label>Product image</Label><input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onFileChange} className="sr-only" />{preview ? <div className="overflow-hidden rounded-xl border"><div className="aspect-[2/1] bg-cover bg-center" style={{ backgroundImage: `url(${preview})` }} /><div className="flex items-center justify-between gap-3 p-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{image?.name}</p><p className="text-xs text-muted-foreground">{image ? `${(image.size / 1024 / 1024).toFixed(2)} MB` : ""}</p></div><div className="flex gap-2"><Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}><ImagePlus /> Replace</Button><Button type="button" variant="ghost" size="icon-sm" onClick={removeImage}><X /><span className="sr-only">Remove image</span></Button></div></div>{progress < 100 && <div className="px-3 pb-3"><div className="mb-1 flex justify-between text-[11px] text-muted-foreground"><span>Uploading preview…</span><span>{progress}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full bg-neutral-900 transition-all" style={{ width: `${progress}%` }} /></div></div>}{progress === 100 && <div className="flex items-center gap-1.5 border-t px-3 py-2 text-xs text-emerald-700"><CheckCircle2 className="size-3.5" />Ready for upload</div>}</div> : <div onDragOver={(event) => event.preventDefault()} onDrop={onDrop} onClick={() => inputRef.current?.click()} className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed p-8 text-center transition-colors hover:bg-muted/40"><UploadCloud className="size-8 text-muted-foreground" /><p className="mt-3 text-sm font-medium">Drag and drop an image here</p><p className="mt-1 text-xs text-muted-foreground">or click to browse your device</p><p className="mt-4 text-[11px] text-muted-foreground">JPG, PNG or WebP · Maximum 5 MB</p></div>}{uploadError && <Alert variant="destructive"><AlertCircle /><AlertTitle>Upload failed</AlertTitle><AlertDescription>{uploadError}</AlertDescription></Alert>}</div></div><SheetFooter className="border-t"><Button type="button" variant="outline" onClick={() => close(false)}>Cancel</Button><Button type="submit">{product ? "Save changes" : "Create product"}</Button></SheetFooter></form></SheetContent></Sheet>
}

function Field({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) { return <label className="space-y-2 text-sm font-medium">{label}<Input name={name} defaultValue={defaultValue} required className="mt-2 h-10 font-normal" /></label> }
