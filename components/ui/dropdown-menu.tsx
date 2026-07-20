"use client"

import * as React from "react"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"

import { cn } from "@/lib/utils"

function DropdownMenu(props: MenuPrimitive.Root.Props) { return <MenuPrimitive.Root {...props} /> }
function DropdownMenuTrigger(props: MenuPrimitive.Trigger.Props) { return <MenuPrimitive.Trigger {...props} /> }
function DropdownMenuContent({ className, sideOffset = 6, align = "center", ...props }: MenuPrimitive.Popup.Props & { sideOffset?: number; align?: "start" | "center" | "end" }) {
  return <MenuPrimitive.Portal><MenuPrimitive.Positioner sideOffset={sideOffset} align={align} className="z-50"><MenuPrimitive.Popup className={cn("min-w-52 rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-xl outline-none transition data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0", className)} {...props} /></MenuPrimitive.Positioner></MenuPrimitive.Portal>
}
function DropdownMenuItem({ className, ...props }: MenuPrimitive.Item.Props) { return <MenuPrimitive.Item className={cn("flex h-8 cursor-default select-none items-center gap-2 rounded-lg px-2 text-sm outline-none data-highlighted:bg-muted", className)} {...props} /> }
function DropdownMenuLabel({ className, ...props }: MenuPrimitive.GroupLabel.Props) { return <MenuPrimitive.GroupLabel className={cn("px-2 py-1.5 text-xs font-medium text-muted-foreground", className)} {...props} /> }
function DropdownMenuSeparator({ className, ...props }: MenuPrimitive.Separator.Props) { return <MenuPrimitive.Separator className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} /> }

export { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger }
