import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative grid w-full grid-cols-[auto_1fr] items-start gap-x-3 rounded-lg border px-3 py-2.5 text-sm [&>svg]:mt-0.5 [&>svg]:size-4",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive: "border-destructive/25 bg-destructive/5 text-destructive",
        success: "border-emerald-600/20 bg-emerald-50 text-emerald-800",
        warning: "border-amber-300 bg-amber-50 text-amber-800",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

function Alert({ className, variant, ...props }: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return <div role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("font-medium leading-5", className)} {...props} />
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("col-start-2 text-xs leading-5 opacity-90", className)} {...props} />
}

export { Alert, AlertDescription, AlertTitle }
