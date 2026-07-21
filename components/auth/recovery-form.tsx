"use client"

import Link from "next/link"
import { FormEvent, useState } from "react"
import { ArrowLeft, CheckCircle2, LoaderCircle, Mail } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function RecoveryForm() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    window.setTimeout(() => {
      setLoading(false)
      setSent(true)
    }, 700)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {sent && (
        <Alert variant="success">
          <CheckCircle2 aria-hidden="true" />
          <AlertTitle>Check your inbox</AlertTitle>
          <AlertDescription>If this administrator exists, a reset link has been sent.</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Administrator email</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input id="email" name="email" type="email" required placeholder="administrator@company.com" className="h-11 pl-9" />
        </div>
      </div>
      <Button type="submit" size="lg" className="h-11 w-full" disabled={loading}>
        {loading ? <><LoaderCircle className="animate-spin" /> Sending link…</> : "Send reset link"}
      </Button>
      <Button render={<Link href="/login" />} nativeButton={false} variant="ghost" className="w-full">
        <ArrowLeft /> Back to sign in
      </Button>
    </form>
  )
}
