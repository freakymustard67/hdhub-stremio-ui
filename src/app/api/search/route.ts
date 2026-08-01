import { NextRequest, NextResponse } from "next/server";

// OMDB free demo key (1000 requests/day limit)
const OMDB_API_KEY = process.env.OMDB_API_KEY || "8c2e7c9e";

export async function GET(request: NextRequest) {
  const query = new URL(request.url).searchParams.get("q");
  if (!query || query.trim().length < 2) {
    return NextResponse.json({ error: "Query must be at least 2 characters" }, { status: 400 });
  }

  const trimmed = query.trim();

  // If query looks like an IMDB ID, return it directly
  if (/^tt\d+$/.test(trimmed)) {
    return NextResponse.json({
      results: [{
        id: trimmed,
        type: "movie",
        title: `IMDB ${trimmed}`,
        description: "Click to stream",
      }],
    });
  }

  // Try OMDB for movie + series search
  if (OMDB_API_KEY) {
    try {
      const encoded = encodeURIComponent(trimmed);
      const [movieRes, seriesRes] = await Promise.allSettled([
        fetch(`https://www.omdbapi.com/?s=${encoded}&type=movie&apikey=${OMDB_API_KEY}`, { signal: AbortSignal.timeout(5000) }),
        fetch(`https://www.omdbapi.com/?s=${encoded}&type=series&apikey=${OMDB_API_KEY}`, { signal: AbortSignal.timeout(5000) }),
      ]);

      const allResults: Array<{
        id: string;
        type: "movie" | "series";
        title: string;
        poster?: string;
        year?: number;
        description?: string;
      }> = [];

      for (const res of [movieRes, seriesRes]) {
        if (res.status === "fulfilled" && res.value.ok) {
          const data = await res.value.json();
          if (data.Search && Array.isArray(data.Search)) {
            for (const item of data.Search) {
              allResults.push({
                id: item.imdbID,
                type: item.Type === "series" ? "series" : "movie",
                title: item.Title,
                poster: item.Poster !== "N/A" ? item.Poster : undefined,
                year: parseInt(item.Year) || undefined,
                description: `${item.Type || "movie"} from ${item.Year || "?"}`,
              });
            }
          }
        }
      }

      if (allResults.length > 0) {
        // Deduplicate by IMDB ID
        const seen = new Set<string>();
        const deduped = allResults.filter((r) => {
          if (seen.has(r.id)) return false;
          seen.add(r.id);
          return true;
        });
        return NextResponse.json({ results: deduped });
      }
    } catch {
      // Fall through
    }
  }

  // Fallback: return the search query as a potential lookup
  return NextResponse.json({
    results: [{
      id: `search:${encodeURIComponent(trimmed)}`,
      type: "movie",
      title: `Search: ${trimmed}`,
      description: "Try streaming this title (IMDB ID lookup)",
    }],
  });
}
