"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useSearch } from "@/hooks/useStremio";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Search, AlertCircle, Film, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SearchResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const { data: results, isLoading, isError, error } = useSearch(query, query.length >= 2);

  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Search className="h-16 w-16 text-muted-foreground/20 mb-4" />
        <h2 className="text-xl font-semibold text-foreground">Search HDHub</h2>
        <p className="text-muted-foreground mt-1">Enter a movie or series title above to search.</p>
      </div>
    );
  }

  if (query.length < 2) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Type at least 2 characters to search.</p>
      </div>
    );
  }

  if (isLoading) return <LoadingSpinner size="lg" label={`Searching "${query}"...`} fullPage />;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-lg font-semibold text-foreground">Search failed</h2>
        <p className="text-muted-foreground mt-1">
          {error instanceof Error ? error.message : "An unexpected error occurred."}
        </p>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Search className="h-16 w-16 text-muted-foreground/20 mb-4" />
        <h2 className="text-xl font-semibold text-foreground">No results found</h2>
        <p className="text-muted-foreground mt-1 max-w-md">
          No results for &quot;{query}&quot;. Try a different movie name or use an IMDB ID (e.g. tt1375666).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">
          Search results for &quot;{query}&quot;
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Found {results.length} result{results.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid gap-3">
        {results.map((item) => (
          <button
            key={item.id}
            onClick={() => router.push(`/meta/${item.type}/${item.id}`)}
            className="flex items-center gap-4 rounded-lg border border-border/40 bg-card p-4 text-left hover:border-hdhub-500/30 transition-all group w-full"
          >
            {item.poster ? (
              <img
                src={item.poster}
                alt=""
                className="h-20 w-14 rounded object-cover flex-shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            ) : (
              <div className="h-20 w-14 rounded bg-muted flex items-center justify-center flex-shrink-0">
                <Film className="h-6 w-6 text-muted-foreground/40" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{item.title}</p>
              <p className="text-sm text-muted-foreground">
                {item.year && `${item.year} • `}
                {item.id.startsWith("tt") ? "IMDB" : "Movie"}
              </p>
              {item.description && (
                <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-1">
                  {item.description}
                </p>
              )}
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-hdhub-400 transition-colors flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
