import type { Metadata } from "next"

import { AuthCard } from "@/components/auth/auth-card"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = { title: "Administrator Login | Sales Management" }

export default function LoginPage() {
  return (
    <AuthCard title="Administrator login" description="Enter your administrator credentials to access the dashboard.">
      <LoginForm />
    </AuthCard>
  )
}
