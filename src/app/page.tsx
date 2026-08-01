"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAddonConfig } from "@/hooks/useStremio";
import { Button } from "@/components/ui/button";
import { Sparkles, Search, ArrowRight, Film, Tv } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { data: config, isLoading: configLoading } = useAddonConfig();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[450px] w-full rounded-2xl overflow-hidden bg-gradient-to-br from-hdhub-950 via-background to-hdhub-900 flex items-center justify-center mb-16">
        <div className="absolute inset-0 bg-grid-white opacity-[0.03]" />
        <div className="text-center space-y-8 max-w-xl px-4 relative z-10">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-hdhub-500 to-hdhub-700 shadow-lg shadow-hdhub-600/30">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-hdhub-300 to-hdhub-100 bg-clip-text text-transparent">
              HDHub Stream
            </span>
          </div>
          <p className="text-muted-foreground text-lg">
            Stream movies and series. Search any title to find available streams.
          </p>

          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies &amp; series..."
              className="w-full h-14 pl-12 pr-24 rounded-xl bg-card border border-border/50 text-foreground text-lg placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-hdhub-500/50 focus:border-hdhub-500/50 transition-all shadow-lg"
            />
            {searchQuery.trim() && (
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-5 rounded-lg bg-hdhub-600 hover:bg-hdhub-500 text-white flex items-center gap-2 transition-colors text-sm font-medium"
              >
                Search <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </form>

          {!configLoading && config?.isReachable && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span className="flex h-2 w-2 rounded-full bg-green-500" />
              Connected &mdash; {config.manifest?.name || "HDHub"} v{config.manifest?.version || "?"}
            </div>
          )}
          {!configLoading && config && !config.isReachable && (
            <p className="text-sm text-red-400">Addon endpoint unreachable.</p>
          )}
        </div>
      </section>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto mb-12">
        <button
          onClick={() => router.push("/meta/movie/tt1375666")}
          className="flex items-center gap-4 rounded-xl border border-border/40 bg-card p-5 hover:border-hdhub-500/30 transition-all text-left"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-hdhub-600/20">
            <Film className="h-6 w-6 text-hdhub-400" />
          </div>
          <div>
            <p className="font-medium text-foreground">Inception</p>
            <p className="text-xs text-muted-foreground">Try a known movie</p>
          </div>
        </button>
        <button
          onClick={() => router.push("/meta/movie/tt0111161")}
          className="flex items-center gap-4 rounded-xl border border-border/40 bg-card p-5 hover:border-hdhub-500/30 transition-all text-left"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-hdhub-600/20">
            <Tv className="h-6 w-6 text-hdhub-400" />
          </div>
          <div>
            <p className="font-medium text-foreground">The Shawshank Redemption</p>
            <p className="text-xs text-muted-foreground">Try a known movie</p>
          </div>
        </button>
      </div>
    </div>
  );
}
