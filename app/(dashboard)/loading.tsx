import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <main className="flex-1 bg-muted/25 p-4 sm:p-6 xl:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-8 w-64" /></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => <Card key={index}><CardContent className="space-y-4 p-4"><Skeleton className="size-9 rounded-lg" /><Skeleton className="h-7 w-16" /><Skeleton className="h-4 w-28" /></CardContent></Card>)}
        </div>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.75fr)]">
          <Skeleton className="h-[450px] rounded-xl" /><Skeleton className="h-[450px] rounded-xl" />
        </div>
      </div>
    </main>
  )
}
