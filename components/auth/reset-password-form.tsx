import Link from "next/link"
import { KeyRound } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export function ResetPasswordForm() {
  return <div className="space-y-5"><Alert><KeyRound /><AlertTitle>Reset link unavailable</AlertTitle><AlertDescription>This server does not issue email reset links until a mail provider is configured. Contact an administrator for an audited password reset.</AlertDescription></Alert><Button render={<Link href="/login" />} nativeButton={false} className="w-full">Return to sign in</Button></div>
}
