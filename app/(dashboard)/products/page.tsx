import type { Metadata } from "next"

import { Products } from "@/components/products"

export const metadata: Metadata = { title: "Products | Sales Management" }

export default function ProductsPage() { return <Products /> }
