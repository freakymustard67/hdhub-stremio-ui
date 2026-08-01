import { fetchStreams } from "./hdhub";
import { HDHUB_DEFAULT_URL } from "@/lib/constants";
import type { StremioStream, PlayerStream, PlayerStreamQuality } from "@/types/stremio";

export async function resolveStream(type: string, id: string, _preferredQuality: string = "1080p"): Promise<PlayerStream | null> {
  try {
    const response = await fetchStreams(type, id);
    if (!response.streams || response.streams.length === 0) return null;
    const sorted = response.streams.sort((a, b) => (b.behaviorHints?.videoSize ?? 0) - (a.behaviorHints?.videoSize ?? 0));
    const qualities = extractQualities(sorted);
    const best = sorted[0];
    if (!best) return null;
    const resolvedUrl = await resolveStreamUrl(best, type, id);
    if (!resolvedUrl) return null;
    return { url: resolvedUrl, label: best.name || "Auto", type: detectStreamType(best), qualities, subtitles: best.subtitles || [] };
  } catch { return null; }
}

function extractQualities(streams: StremioStream[]): PlayerStreamQuality[] {
  const qualities: PlayerStreamQuality[] = [];
  for (const s of streams) {
    const label = getQualityLabel(s.behaviorHints?.videoSize ?? 0, s.name);
    if (s.url || s.infoHash) qualities.push({ label, url: s.url || `torrent://${s.infoHash}` });
  }
  return qualities.filter((q, i, self) => i === self.findIndex((t) => t.label === q.label));
}

function getQualityLabel(height: number, fallback?: string): string {
  if (height >= 2160) return "4K";
  if (height >= 1440) return "1440p";
  if (height >= 1080) return "1080p";
  if (height >= 720) return "720p";
  if (height >= 480) return "480p";
  if (height >= 360) return "360p";
  return fallback || "Auto";
}

async function resolveStreamUrl(stream: StremioStream, _type: string, _id: string): Promise<string | null> {
  if (stream.url) {
    if (stream.url.startsWith("http")) return `/api/stream-proxy?url=${encodeURIComponent(stream.url)}`;
    return stream.url;
  }
  if (stream.infoHash) return `/api/stream-proxy?infoHash=${stream.infoHash}&fileIdx=${stream.fileIdx ?? 0}`;
  return null;
}

function detectStreamType(stream: StremioStream): "mp4" | "hls" | "torrent" {
  if (stream.streamType === "hls" || stream.url?.includes(".m3u8")) return "hls";
  if (stream.infoHash || stream.streamType === "torrent") return "torrent";
  return "mp4";
}
