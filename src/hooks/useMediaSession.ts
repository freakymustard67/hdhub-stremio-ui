"use client";
import { useEffect } from "react";

export function useMediaSession(
  media: { id: string; title: string; type: string; poster?: string; backdrop?: string; season?: number; episode?: number } | null,
  isPlaying: boolean,
  onPlay: () => void,
  onPause: () => void,
  onSeekForward?: () => void,
  onSeekBackward?: () => void,
  onSeekTo?: (time: number) => void,
): void {
  useEffect(() => {
    if (!media || !("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: media.title,
      artist: media.type === "movie" ? "Movie" : `Season ${media.season ?? 1}`,
      album: media.type === "series" ? `Episode ${media.episode ?? 1}` : "",
      artwork: [{ src: media.poster ?? "", sizes: "256x256", type: "image/jpeg" }],
    });
    return () => { navigator.mediaSession.metadata = null; };
  }, [media]);

  useEffect(() => {
    if ("mediaSession" in navigator) navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [isPlaying]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const ms = navigator.mediaSession;
    ms.setActionHandler("play", () => onPlay());
    ms.setActionHandler("pause", () => onPause());
    if (onSeekForward) ms.setActionHandler("seekforward", () => onSeekForward());
    if (onSeekBackward) ms.setActionHandler("seekbackward", () => onSeekBackward());
    if (onSeekTo) ms.setActionHandler("seekto", (d) => { if (d.seekTime !== undefined) onSeekTo(d.seekTime); });
    ms.setActionHandler("stop", () => onPause());
    return () => {
      const handlers = ["play", "pause", "seekbackward", "seekforward", "seekto", "stop"] as MediaSessionAction[];
      for (const h of handlers) { try { ms.setActionHandler(h, null); } catch {} }
    };
  }, [onPlay, onPause, onSeekForward, onSeekBackward, onSeekTo]);
}
