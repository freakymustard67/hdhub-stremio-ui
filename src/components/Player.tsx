"use client";
import { useEffect, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward, Settings, Subtitles, X, Loader2, Monitor, Check, ChevronDown } from "lucide-react";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useMediaSession } from "@/hooks/useMediaSession";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QUALITY_LABELS } from "@/lib/constants";
import { QualitySelector } from "@/components/QualitySelector";
import Hls from "hls.js";

export function Player({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined as any);
  const { currentMedia, currentStream, playback, selectedQuality, selectedSubtitle, availableSubtitles, setPlaying, setCurrentTime, setDuration, setVolume, toggleMute, toggleFullscreen, setPlaybackRate, setControlsVisible, setBuffering, setQuality, setSubtitle, seekRelative, close } = usePlayerStore();
  const subtitleSize = useSettingsStore((s) => s.subtitleSize);
  const subtitleOpacity = useSettingsStore((s) => s.subtitleOpacity);
  const [showSettings, setShowSettings] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(false);

  const startHideTimer = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setControlsVisible(true);
    if (playback.isPlaying) hideTimer.current = setTimeout(() => { setControlsVisible(false); setShowSettings(false); setShowSubtitles(false); }, 3000);
  }, [playback.isPlaying, setControlsVisible]);

  // --- Load stream source into video element ---
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentStream) return;

    // Cleanup previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const streamUrl = currentStream.url;

    if (currentStream.type === "hls" && Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
    } else if (currentStream.type === "torrent") {
      // Torrent streams can't play in a browser <video> — fallback message
      console.warn("[Player] Torrent streams are not supported in browser. Showing placeholder.");
      video.src = "";
    } else {
      video.src = streamUrl;
      video.load();
      video.play().catch(() => {});
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentStream]);

  // --- Attach video event listeners ---
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !currentMedia) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTimeUpdate = () => setCurrentTime(v.currentTime);
    const onDuration = () => setDuration(v.duration);
    const onWaiting = () => setBuffering(true);
    const onCanPlay = () => setBuffering(false);
    const onError = () => setBuffering(false);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("timeupdate", onTimeUpdate);
    v.addEventListener("durationchange", onDuration);
    v.addEventListener("waiting", onWaiting);
    v.addEventListener("canplay", onCanPlay);
    v.addEventListener("error", onError);
    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("timeupdate", onTimeUpdate);
      v.removeEventListener("durationchange", onDuration);
      v.removeEventListener("waiting", onWaiting);
      v.removeEventListener("canplay", onCanPlay);
      v.removeEventListener("error", onError);
    };
  }, [currentMedia, setPlaying, setCurrentTime, setDuration, setBuffering]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = playback.volume;
    v.muted = playback.isMuted;
    v.playbackRate = playback.playbackRate;
  }, [playback.volume, playback.isMuted, playback.playbackRate]);

  const toggleLocalPlay = () => {
    const v = videoRef.current;
    if (!v) return;
    v.paused ? v.play() : v.pause();
  };

  const toggleLocalFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) { document.exitFullscreen(); toggleFullscreen(); }
    else { containerRef.current.requestFullscreen(); toggleFullscreen(); }
  };

  useEffect(() => {
    if (!visible) return;
    const handleKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA") return;
      switch (e.key) {
        case " ": e.preventDefault(); toggleLocalPlay(); break;
        case "f": toggleLocalFullscreen(); break;
        case "m": toggleMute(); break;
        case "ArrowLeft": e.preventDefault(); seekRelative(-10); break;
        case "ArrowRight": e.preventDefault(); seekRelative(10); break;
        case "ArrowUp": e.preventDefault(); setVolume(Math.min(1, playback.volume + 0.1)); break;
        case "ArrowDown": e.preventDefault(); setVolume(Math.max(0, playback.volume - 0.1)); break;
        case "Escape": document.fullscreenElement ? document.exitFullscreen() : onClose(); break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [visible, toggleLocalFullscreen, toggleMute, seekRelative, setVolume, playback.volume, onClose]);

  useEffect(() => { return () => { if (hideTimer.current) clearTimeout(hideTimer.current); }; }, []);

  useMediaSession(currentMedia, playback.isPlaying, toggleLocalPlay, toggleLocalPlay, () => seekRelative(10), () => seekRelative(-10), (t) => seek(t));

  const seek = (time: number) => { if (videoRef.current) videoRef.current.currentTime = time; setCurrentTime(time); };
  const formatTime = (s: number) => { if (!isFinite(s) || s < 0) return "0:00"; const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60); return h > 0 ? `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}` : `${m}:${sec.toString().padStart(2, "0")}`; };
  const progress = playback.duration > 0 ? (playback.currentTime / playback.duration) * 100 : 0;

  if (!visible || !currentMedia) return null;

  const isTorrent = currentStream?.type === "torrent";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black" ref={containerRef} onMouseMove={startHideTimer}>
      {isTorrent ? (
        <div className="flex h-full w-full items-center justify-center flex-col gap-4 text-white/70">
          <Loader2 className="h-12 w-12 animate-spin" />
          <p className="text-lg">Torrent streams require a streaming server</p>
          <p className="text-sm text-white/40">This stream type isn't supported in the browser yet</p>
        </div>
      ) : (
        <video ref={videoRef} className="h-full w-full object-contain" controls={false} autoPlay playsInline />
      )}
      {playback.isBuffering && !isTorrent && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
          <Loader2 className="h-12 w-12 animate-spin text-white/70" />
        </div>
      )}
      <AnimatePresence>
        {playback.controlsVisible && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon-sm" onClick={onClose} className="text-white hover:bg-white/10"><X className="h-5 w-5" /></Button>
                <p className="text-sm font-medium text-white truncate">{currentMedia.title}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {playback.controlsVisible && !isTorrent && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-4 pt-12 bg-gradient-to-t from-black/80 via-black/40 to-transparent" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4">
              <input type="range" min={0} max={playback.duration || 100} value={playback.currentTime}
                onChange={(e) => seek(parseFloat(e.target.value))}
                className="w-full h-1 appearance-none bg-white/20 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-hdhub-500" />
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon-sm" onClick={toggleLocalPlay} className="text-white hover:bg-white/10">{playback.isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}</Button>
                <Button variant="ghost" size="icon-sm" onClick={() => seekRelative(-10)} className="text-white/70 hover:text-white hover:bg-white/10"><SkipBack className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon-sm" onClick={() => seekRelative(10)} className="text-white/70 hover:text-white hover:bg-white/10"><SkipForward className="h-4 w-4" /></Button>
                <div className="flex items-center gap-1 group/vol">
                  <Button variant="ghost" size="icon-sm" onClick={toggleMute} className="text-white/70 hover:text-white hover:bg-white/10">
                    {playback.isMuted || playback.volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <input type="range" min={0} max={1} step={0.05} value={playback.isMuted ? 0 : playback.volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-0 group-hover/vol:w-20 transition-all duration-300 h-1 appearance-none bg-white/20 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white" />
                </div>
                <span className="text-xs text-white/60 ml-2 tabular-nums">{formatTime(playback.currentTime)} / {formatTime(playback.duration)}</span>
              </div>
              <div className="flex items-center gap-1">
                {availableSubtitles.length > 0 && (
                  <div className="relative">
                    <Button variant="ghost" size="icon-sm" onClick={() => { setShowSubtitles(!showSubtitles); setShowSettings(false); }} className={cn("text-white/70 hover:text-white hover:bg-white/10", selectedSubtitle && "text-hdhub-400")}>
                      <Subtitles className="h-4 w-4" />
                    </Button>
                    <AnimatePresence>{showSubtitles && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute bottom-full right-0 mb-2 w-48 rounded-lg border border-border bg-card shadow-xl overflow-hidden">
                        <button onClick={() => { setSubtitle(null); setShowSubtitles(false); }} className={cn("w-full px-3 py-2 text-left text-sm hover:bg-accent", !selectedSubtitle && "text-hdhub-400 bg-accent/50")}>Off</button>
                        {availableSubtitles.map((sub) => (
                          <button key={sub.id} onClick={() => { setSubtitle(sub); setShowSubtitles(false); }} className={cn("w-full px-3 py-2 text-left text-sm hover:bg-accent", selectedSubtitle?.id === sub.id && "text-hdhub-400 bg-accent/50")}>{sub.lang}</button>
                        ))}
                      </motion.div>
                    )}</AnimatePresence>
                  </div>
                )}
                <div className="relative">
                  <Button variant="ghost" size="icon-sm" onClick={() => { setShowSettings(!showSettings); setShowSubtitles(false); }} className="text-white/70 hover:text-white hover:bg-white/10"><Settings className="h-4 w-4" /></Button>
                  <AnimatePresence>{showSettings && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute bottom-full right-0 mb-2 w-56 rounded-lg border border-border bg-card shadow-xl overflow-hidden p-3 space-y-3">
                      <QualitySelector
                        qualities={currentStream?.qualities || []}
                        currentQuality={selectedQuality}
                        onQualityChange={setQuality}
                        isOpen={showSettings}
                        onToggle={() => {}}
                        className="mb-2"
                      />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Speed</p>
                        <div className="flex flex-wrap gap-1">
                          {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                            <button key={speed} onClick={() => setPlaybackRate(speed)} className={cn("px-2 py-1 text-xs rounded transition-colors", playback.playbackRate === speed ? "bg-hdhub-600/30 text-hdhub-300" : "text-muted-foreground hover:bg-accent")}>{speed}x</button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}</AnimatePresence>
                </div>
                <Button variant="ghost" size="icon-sm" onClick={toggleLocalFullscreen} className="text-white/70 hover:text-white hover:bg-white/10">
                  {playback.isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {selectedSubtitle && (
        <div className="absolute bottom-20 left-0 right-0 z-20 flex items-center justify-center px-4 pointer-events-none">
          <div className="inline-block max-w-[80%] text-center rounded-lg bg-black/60 px-4 py-2 text-white text-base drop-shadow-lg" style={{ opacity: subtitleOpacity }}>
            <span>Subtitles: {selectedSubtitle.lang}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
