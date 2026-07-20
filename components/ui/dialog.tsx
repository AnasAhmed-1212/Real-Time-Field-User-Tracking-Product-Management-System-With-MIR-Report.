"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function Dialog(props: DialogPrimitive.Root.Props) { return <DialogPrimitive.Root {...props} /> }
function DialogTrigger(props: DialogPrimitive.Trigger.Props) { return <DialogPrimitive.Trigger {...props} /> }
function DialogClose(props: DialogPrimitive.Close.Props) { return <DialogPrimitive.Close {...props} /> }

function DialogContent({ className, children, ...props }: DialogPrimitive.Popup.Props) {
  return <DialogPrimitive.Portal><DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0" /><DialogPrimitive.Popup className={cn("fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-background p-6 shadow-xl transition data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0", className)} {...props}>{children}<DialogPrimitive.Close render={<Button variant="ghost" size="icon-sm" className="absolute right-3 top-3" />}><X /><span className="sr-only">Close</span></DialogPrimitive.Close></DialogPrimitive.Popup></DialogPrimitive.Portal>
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) { return <div className={cn("space-y-1.5", className)} {...props} /> }
function DialogFooter({ className, ...props }: React.ComponentProps<"div">) { return <div className={cn("mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} /> }
function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) { return <DialogPrimitive.Title className={cn("text-lg font-semibold", className)} {...props} /> }
function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props) { return <DialogPrimitive.Description className={cn("text-sm text-muted-foreground", className)} {...props} /> }

export { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger }
