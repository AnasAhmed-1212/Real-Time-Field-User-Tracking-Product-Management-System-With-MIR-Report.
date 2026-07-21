import type { Metadata } from "next"
import Link from "next/link"
import { ShieldX } from "lucide-react"

import { AuthCard } from "@/components/auth/auth-card"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = { title: "Access Denied | Sales Management" }

export default function AccessDeniedPage() {
  return (
    <AuthCard title="Access denied" description="Your administrator account does not have permission to view this resource.">
      <div className="space-y-6">
        <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldX className="size-5" aria-hidden="true" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Button render={<Link href="/" />} nativeButton={false} size="lg" className="h-11">Go to dashboard</Button>
          <Button render={<Link href="/login" />} nativeButton={false} variant="outline" size="lg" className="h-11">Use another account</Button>
        </div>
      </div>
    </AuthCard>
  )
}
