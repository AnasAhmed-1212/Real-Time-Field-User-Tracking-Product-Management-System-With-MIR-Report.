import { Box, CheckCircle2 } from "lucide-react"

export default function AuthenticationLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-svh bg-background lg:grid-cols-[minmax(320px,0.9fr)_1.1fr]">
      <aside className="relative hidden overflow-hidden bg-neutral-950 p-10 text-white lg:flex lg:flex-col">
        <div className="absolute -left-24 top-1/4 size-80 rounded-full bg-white/5 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-white text-neutral-950">
            <Box className="size-5" aria-hidden="true" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold">Sales Management</span>
            <span className="block text-xs text-white/60">Administrator portal</span>
          </span>
        </div>
        <div className="relative my-auto max-w-md">
          <p className="text-3xl font-semibold leading-tight tracking-tight">Manage your field operations from one secure workspace.</p>
          <ul className="mt-8 space-y-4 text-sm text-white/70">
            {['Real-time workforce visibility', 'Secure administrator access', 'Centralized sales operations'].map((item) => (
              <li key={item} className="flex items-center gap-3"><CheckCircle2 className="size-4 text-white" />{item}</li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-white/45">© 2026 Sales Management. Authorized access only.</p>
      </aside>
      <section className="flex min-h-svh items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        {children}
      </section>
    </main>
  )
}
