import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded bg-gray-200", className)}
      {...props}
    />
  );
}

export function ExpenseListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="bg-white rounded-lg shadow-sm divide-y">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="w-10 space-y-1">
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-5 w-6" />
          </div>
          <Skeleton className="h-8 w-8 rounded" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-12 ms-auto" />
            <Skeleton className="h-4 w-16 ms-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function BalanceSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="grid grid-cols-3 gap-4 text-center">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-16 mx-auto" />
            <Skeleton className="h-6 w-20 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
