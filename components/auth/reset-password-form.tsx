"use client"

import Link from "next/link"
import { FormEvent, useState } from "react"
import { CheckCircle2, Eye, EyeOff, LoaderCircle } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ResetPasswordForm() {
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [complete, setComplete] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    window.setTimeout(() => {
      setLoading(false)
      setComplete(true)
    }, 700)
  }

  if (complete) {
    return (
      <div className="space-y-5">
        <Alert variant="success">
          <CheckCircle2 aria-hidden="true" />
          <AlertTitle>Password updated</AlertTitle>
          <AlertDescription>You can now sign in using your new password.</AlertDescription>
        </Alert>
        <Button render={<Link href="/login" />} size="lg" className="h-11 w-full">Continue to sign in</Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {[
        { id: "password", label: "New password", autocomplete: "new-password" },
        { id: "confirm-password", label: "Confirm password", autocomplete: "new-password" },
      ].map((field) => (
        <div className="space-y-2" key={field.id}>
          <Label htmlFor={field.id}>{field.label}</Label>
          <div className="relative">
            <Input id={field.id} name={field.id} type={visible ? "text" : "password"} autoComplete={field.autocomplete} required minLength={6} className="h-11 pr-10" />
            <button type="button" onClick={() => setVisible((value) => !value)} className="absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted" aria-label={visible ? "Hide passwords" : "Show passwords"}>
              {visible ? <EyeOff /> : <Eye />}
            </button>
          </div>
        </div>
      ))}
      <Button type="submit" size="lg" className="h-11 w-full" disabled={loading}>
        {loading ? <><LoaderCircle className="animate-spin" /> Updating…</> : "Update password"}
      </Button>
    </form>
  )
}
