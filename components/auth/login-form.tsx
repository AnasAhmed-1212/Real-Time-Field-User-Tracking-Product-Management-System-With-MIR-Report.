"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { AlertCircle, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authApi } from "@/lib/admin-api"

export function LoginForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")

    const form = new FormData(event.currentTarget)
    const identity = String(form.get("identity") ?? "").trim()
    const password = String(form.get("password") ?? "")

    if (!identity || !password) {
      setError("Enter your email or username and password to continue.")
      return
    }

    if (password.length < 6) {
      setError("The password must contain at least 6 characters.")
      return
    }

    setLoading(true)
    try {
      await authApi("login", { method: "POST", body: JSON.stringify({ identity, password, remember }) })
      const requested = new URLSearchParams(window.location.search).get("next")
      router.replace(requested?.startsWith("/") && !requested.startsWith("//") ? requested : "/")
      router.refresh()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to sign in.")
      setLoading(false)
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      {error && (
        <Alert variant="destructive">
          <AlertCircle aria-hidden="true" />
          <AlertTitle>Unable to sign in</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="identity">Email or username</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            id="identity"
            name="identity"
            autoComplete="username"
            placeholder="administrator@company.com"
            disabled={loading}
            className="h-11 pl-9"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="password">Password</Label>
          <Link href="/forgot-password" className="text-xs font-medium text-muted-foreground hover:text-foreground">
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            disabled={loading}
            className="h-11 px-9"
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            className="absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
          </button>
        </div>
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={remember}
          onChange={(event) => setRemember(event.target.checked)}
          disabled={loading}
          className="size-4 rounded border-input accent-neutral-950"
        />
        Remember this session
      </label>

      <Button type="submit" size="lg" className="h-11 w-full" disabled={loading}>
        {loading ? (
          <>
            <LoaderCircle className="animate-spin" aria-hidden="true" />
            Signing in…
          </>
        ) : (
          "Sign in to dashboard"
        )}
      </Button>
    </form>
  )
}
