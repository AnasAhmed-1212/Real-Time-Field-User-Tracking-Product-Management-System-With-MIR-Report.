import { ReactNode } from "react"

import { CompanyMark } from "@/components/company-mark"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function AuthCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <Card className="w-full max-w-md border-0 shadow-none sm:border sm:shadow-xl sm:shadow-black/5">
      <CardHeader className="gap-2 px-0 pb-6 pt-0 sm:p-8 sm:pb-6">
        <CompanyMark className="mb-7 lg:hidden" />
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0 sm:px-8 sm:pb-8">{children}</CardContent>
    </Card>
  )
}
