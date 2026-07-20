import * as React from "react"
import Image, { type ImageProps } from "next/image"

import { cn } from "@/lib/utils"

function Avatar({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("relative flex size-9 shrink-0 overflow-hidden rounded-full", className)} {...props} />
}

function AvatarImage({ className, alt = "", ...props }: Omit<ImageProps, "fill">) {
  return <Image fill alt={alt} className={cn("object-cover", className)} {...props} />
}

function AvatarFallback({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("flex size-full items-center justify-center rounded-full bg-muted text-xs font-medium", className)} {...props} />
}

export { Avatar, AvatarFallback, AvatarImage }
