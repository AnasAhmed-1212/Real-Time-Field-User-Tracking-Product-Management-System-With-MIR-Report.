"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type TabsContextValue = { value: string; setValue: (value: string) => void }
const TabsContext = React.createContext<TabsContextValue | null>(null)

function Tabs({ defaultValue, className, children, ...props }: React.ComponentProps<"div"> & { defaultValue: string }) {
  const [value, setValue] = React.useState(defaultValue)
  return <TabsContext.Provider value={{ value, setValue }}><div className={className} {...props}>{children}</div></TabsContext.Provider>
}
function TabsList({ className, ...props }: React.ComponentProps<"div">) { return <div role="tablist" className={cn("inline-flex h-9 items-center rounded-lg bg-muted p-1", className)} {...props} /> }
function TabsTrigger({ value, className, ...props }: React.ComponentProps<"button"> & { value: string }) { const context = React.useContext(TabsContext); const active = context?.value === value; return <button type="button" role="tab" aria-selected={active} onClick={() => context?.setValue(value)} className={cn("h-7 rounded-md px-3 text-xs font-medium text-muted-foreground transition-colors", active && "bg-background text-foreground shadow-sm", className)} {...props} /> }
function TabsContent({ value, className, ...props }: React.ComponentProps<"div"> & { value: string }) { const context = React.useContext(TabsContext); if (context?.value !== value) return null; return <div role="tabpanel" className={cn("mt-4", className)} {...props} /> }

export { Tabs, TabsContent, TabsList, TabsTrigger }
