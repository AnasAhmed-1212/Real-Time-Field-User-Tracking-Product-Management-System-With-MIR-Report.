import { AlertCircle, LoaderCircle } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function ApiLoading({ label = 'Loading data…' }: { label?: string }) {
  return <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" />{label}</div>
}

export function ApiError({ message }: { message: string }) {
  return <Alert variant="destructive"><AlertCircle /><AlertTitle>Unable to load data</AlertTitle><AlertDescription>{message}</AlertDescription></Alert>
}
