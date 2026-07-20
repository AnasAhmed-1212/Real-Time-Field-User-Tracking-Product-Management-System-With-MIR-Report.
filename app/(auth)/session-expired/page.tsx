import type { Metadata } from "next"
import Link from "next/link"
import { Clock3 } from "lucide-react"

import { AuthCard } from "@/components/auth/auth-card"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = { title: "Session Expired | Sales Management" }

export default function SessionExpiredPage() {
  return (
    <AuthCard title="Your session has expired" description="For your security, we signed you out after a period of inactivity.">
      <div className="space-y-6">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <Clock3 className="size-5" aria-hidden="true" />
        </div>
        <Button render={<Link href="/login" />} size="lg" className="h-11 w-full">Sign in again</Button>
      </div>
    </AuthCard>
  )
}
