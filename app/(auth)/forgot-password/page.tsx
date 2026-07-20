import type { Metadata } from "next"

import { AuthCard } from "@/components/auth/auth-card"
import { RecoveryForm } from "@/components/auth/recovery-form"

export const metadata: Metadata = { title: "Forgot Password | Sales Management" }

export default function ForgotPasswordPage() {
  return (
    <AuthCard title="Forgot your password?" description="Enter your administrator email and we’ll send instructions to reset your password.">
      <RecoveryForm />
    </AuthCard>
  )
}
