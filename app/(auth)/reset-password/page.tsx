import type { Metadata } from "next"

import { AuthCard } from "@/components/auth/auth-card"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export const metadata: Metadata = { title: "Reset Password | Sales Management" }

export default function ResetPasswordPage() {
  return (
    <AuthCard title="Create a new password" description="Choose a strong password that you haven’t used before.">
      <ResetPasswordForm />
    </AuthCard>
  )
}
