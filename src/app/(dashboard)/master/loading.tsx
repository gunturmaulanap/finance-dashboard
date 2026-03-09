import { Skeleton } from "@/components/ui/skeleton"

export default function MasterLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="rounded-md border bg-card">
        <div className="p-4 space-y-3">
          <Skeleton className="h-8 w-full" />
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
