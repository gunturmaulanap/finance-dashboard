import { Skeleton } from "@/components/ui/skeleton"

export default function TransactionsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-9 w-36" />
      </div>
      <Skeleton className="h-9 w-80" />
      <Skeleton className="h-10 w-72" />
      <div className="rounded-md border bg-card">
        <div className="p-4 space-y-3">
          <Skeleton className="h-8 w-full" />
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
