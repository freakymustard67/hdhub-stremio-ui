"use client";
import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Play, Star, Calendar, Film, ExternalLink, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useMetaDetail, useStreams } from "@/hooks/useStremio";
import { usePlayerStore } from "@/store/usePlayerStore";
import { Player } from "@/components/Player";
import type { PlayerStream, StremioStream } from "@/types/stremio";

/** Convert a raw Stremio stream to a PlayerStream */
function toPlayerStream(stream: StremioStream): PlayerStream | null {
  const hasDirectUrl = stream.url && !stream.url.startsWith("torrent://");
  const hasInfoHash = !!stream.infoHash;

  if (!hasDirectUrl && !hasInfoHash) return null;

  let type: "mp4" | "hls" | "torrent" = "mp4";
  if (stream.streamType === "hls" || stream.url?.includes(".m3u8")) type = "hls";
  else if (stream.infoHash || stream.streamType === "torrent") type = "torrent";

  const url = hasDirectUrl
    ? stream.url!
    : hasInfoHash
      ? `torrent://${stream.infoHash}${stream.fileIdx !== undefined ? `?fileIdx=${stream.fileIdx}` : ""}`
      : "";

  return {
    url,
    label: stream.name || "Auto",
    type,
    subtitles: stream.subtitles || [],
  };
}

export default function MetaDetailPage() {
  const params = useParams();
  const type = params.type as string;
  const id = params.id as string;
  const [playerVisible, setPlayerVisible] = useState(false);

  const { data: detail, isLoading } = useMetaDetail(type, id);
  const { data: streamData, isLoading: streamsLoading } = useStreams(type, id);
  const loadMedia = usePlayerStore((s) => s.loadMedia);

  const streams = streamData?.streams ?? [];
  const playerStreams = streams
    .map(toPlayerStream)
    .filter((s): s is PlayerStream => s !== null);

  // Separate HTTP/HLS from torrent
  const directStreams = playerStreams.filter((s) => s.type !== "torrent");
  const torrentStreams = playerStreams.filter((s) => s.type === "torrent");

  const handlePlay = useCallback((stream: PlayerStream) => {
    setPlayerVisible(true);
    loadMedia(
      { id, title: detail?.name || id, type: type as "movie" | "series" },
      stream,
    );
  }, [id, detail, type, loadMedia]);

  if (isLoading) return <LoadingSpinner size="lg" label="Loading..." fullPage />;

  return (
    <div className="min-h-screen">
      {playerVisible && <Player visible={playerVisible} onClose={() => setPlayerVisible(false)} />}

      {/* Hero */}
      <div className="relative h-[40vh] min-h-[300px] overflow-hidden bg-gradient-to-br from-hdhub-950 via-background to-hdhub-900">
        <div className="absolute inset-0 bg-grid-white opacity-[0.03]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row gap-6 items-end">
              <div className="flex-1 space-y-4">
                <Badge variant="quality">{type === "movie" ? "Movie" : "Series"}</Badge>
                <h1 className="text-3xl md:text-5xl font-bold text-white text-shadow-lg">
                  {detail?.name || id}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
                  {detail?.year && (
                    <span><Calendar className="h-4 w-4 inline mr-1" />{detail.year}</span>
                  )}
                  {detail?.imdbRating && (
                    <span className="text-yellow-400">
                      <Star className="h-4 w-4 inline mr-1 fill-current" />{detail.imdbRating}
                    </span>
                  )}
                  <span className="font-mono text-xs text-white/40">ID: {id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {(detail?.plot || detail?.description) && (
          <section className="mb-8 max-w-3xl">
            <h2 className="text-xl font-semibold mb-3">Synopsis</h2>
            <p className="text-muted-foreground leading-relaxed">{detail?.plot || detail?.description}</p>
          </section>
        )}

        {/* Direct streams section (HTTP/HLS — playable in browser) */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Available Streams
            {streamsLoading && <span className="text-sm font-normal text-muted-foreground ml-2">(loading...)</span>}
          </h2>

          {streamsLoading ? (
            <div className="grid gap-3">
              {[1,2,3].map((i) => (
                <div key={i} className="h-16 rounded-lg bg-muted/30 animate-pulse" />
              ))}
            </div>
          ) : directStreams.length > 0 ? (
            <div className="grid gap-3">
              {directStreams.map((stream, i) => (
                <div
                  key={stream.url}
                  className="flex items-center justify-between rounded-lg border border-border/40 bg-card p-4 hover:border-hdhub-500/30 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-hdhub-600/20">
                      <Film className="h-5 w-5 text-hdhub-400" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {stream.label || `Stream ${i + 1}`}
                      </p>
                      {stream.type === "hls" && (
                        <Badge variant="quality" className="mt-1">HLS</Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="gradient"
                    size="sm"
                    className="gap-2 shrink-0"
                    onClick={() => handlePlay(stream)}
                  >
                    <Play className="h-4 w-4 fill-current" />
                    Play
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-lg border border-dashed border-border/50">
              <Film className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-foreground mb-1">No playable streams</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                This title doesn't have any HTTP or HLS streams. Torrent-based streams below require a streaming server.
              </p>
            </div>
          )}
        </section>

        {/* Torrent streams section */}
        {torrentStreams.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <h2 className="text-xl font-semibold">Torrent Streams (server required)</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              These streams use BitTorrent and need a streaming server like WebTorrent or a backend proxy to play in the browser.
            </p>
            <div className="grid gap-3">
              {torrentStreams.map((stream, i) => (
                <div
                  key={stream.url}
                  className="flex items-center justify-between rounded-lg border border-border/40 bg-card p-4 opacity-60"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-600/20">
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {stream.label || `Torrent ${i + 1}`}
                      </p>
                      <Badge variant="outline" className="mt-1">Torrent</Badge>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">Not playable</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* IMDB link */}
        {id.startsWith("tt") && (
          <div className="mt-8 text-center">
            <a
              href={`https://www.imdb.com/title/${id}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-hdhub-400 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              View on IMDb
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
