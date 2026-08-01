"use client";
import { useParams } from "next/navigation";
import { useInfiniteCatalog } from "@/hooks/useStremio";
import { CatalogGrid } from "@/components/CatalogGrid";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Film, Tv } from "lucide-react";
import type { StremioMetaPreview } from "@/types/stremio";

export default function CatalogPage() {
  const params = useParams();
  const type = (params.type as string) || "movie";
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteCatalog(type);
  const items: StremioMetaPreview[] = (data as any)?.pages?.flatMap((page: any) => page.metas ?? []) ?? [];

  if (isLoading) return <LoadingSpinner size="lg" label={`Loading ${type === "movie" ? "movies" : "series"}...`} fullPage />;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-hdhub-600/20">
          {type === "movie" ? <Film className="h-5 w-5 text-hdhub-400" /> : <Tv className="h-5 w-5 text-hdhub-400" />}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground capitalize">{type === "movie" ? "Movies" : "Series"}</h1>
          <p className="text-sm text-muted-foreground">Browse all available {type === "movie" ? "movies" : "series"}</p>
        </div>
      </div>
      <CatalogGrid items={items} type={type} isLoading={isFetchingNextPage} hasMore={hasNextPage} onLoadMore={() => fetchNextPage()} />
    </div>
  );
}
