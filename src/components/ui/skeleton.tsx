import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> { animate?: boolean; }
export function Skeleton({ className, animate = true, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("rounded-md bg-muted/50", animate && "animate-shimmer bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 bg-[length:200%_100%]", className)}
      {...props}
    />
  );
}

export function MediaCardSkeleton() {
  return (
    <div className="group relative overflow-hidden rounded-lg">
      <Skeleton className="aspect-[2/3] w-full" />
      <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function CatalogGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => <MediaCardSkeleton key={i} />)}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative h-[60vh] min-h-[400px] w-full rounded-xl overflow-hidden">
      <Skeleton className="h-full w-full" />
      <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
    </div>
  );
}
