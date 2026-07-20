import { Box } from "lucide-react"

import { cn } from "@/lib/utils"

export function CompanyMark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="flex size-10 items-center justify-center rounded-xl bg-neutral-950 text-white shadow-sm">
        <Box className="size-5" aria-hidden="true" />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold">Sales Management</span>
        <span className="block text-xs text-muted-foreground">Administrator portal</span>
      </span>
    </div>
  )
}
