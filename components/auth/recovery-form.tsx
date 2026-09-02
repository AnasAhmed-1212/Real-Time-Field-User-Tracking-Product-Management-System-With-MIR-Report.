import Link from "next/link"
import { ArrowLeft, MailWarning } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export function RecoveryForm() {
  return <div className="space-y-5"><Alert><MailWarning /><AlertTitle>Administrator reset required</AlertTitle><AlertDescription>Email delivery is not configured for this deployment. Ask another administrator to reset your account directly instead of displaying a false success message.</AlertDescription></Alert><Button render={<Link href="/login" />} nativeButton={false} variant="outline" className="w-full"><ArrowLeft />Back to sign in</Button></div>
}
