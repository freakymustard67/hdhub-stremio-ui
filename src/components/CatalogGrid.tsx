"use client";
import { MediaCard } from "./MediaCard";
import { MediaCardSkeleton } from "@/components/ui/skeleton";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { motion } from "framer-motion";
import { Film, Tv } from "lucide-react";
import type { StremioMetaPreview } from "@/types/stremio";

export function CatalogGrid({ items, type, isLoading, hasMore, onLoadMore, isInitial, skeletonCount = 12 }: {
  items: StremioMetaPreview[];
  type: string;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isInitial?: boolean;
  skeletonCount?: number;
}) {
  const sentinelRef = useInfiniteScroll({ enabled: !!hasMore && !isLoading, onLoadMore: onLoadMore ?? (() => {}) });
  const gridClass = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4";

  if (!isLoading && items.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/30">
          {type === "movie" ? <Film className="h-8 w-8 text-muted-foreground/50" /> : <Tv className="h-8 w-8 text-muted-foreground/50" />}
        </div>
        <h3 className="text-lg font-medium text-foreground">No content found</h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">No {type === "movie" ? "movies" : "series"} match your filters.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={gridClass}>
        {items.map((item, index) => <MediaCard key={item.id} item={item} index={index} type={type} />)}
        {isLoading && Array.from({ length: skeletonCount }).map((_, i) => <MediaCardSkeleton key={`s-${i}`} />)}
      </div>
      {hasMore && (
        <div ref={sentinelRef} className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-hdhub-500" />
            Loading more...
          </div>
        </div>
      )}
    </div>
  );
}
