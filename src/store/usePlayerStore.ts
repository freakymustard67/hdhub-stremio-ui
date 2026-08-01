import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PlayerStream, PlayerStreamQuality, StremioSubtitle } from "@/types/stremio";
import { VOLUME } from "@/lib/constants";

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  playbackRate: number;
  controlsVisible: boolean;
  isBuffering: boolean;
  isPip: boolean;
  _prevVolume: number;
}

export interface CurrentMedia {
  id: string;
  title: string;
  type: "movie" | "series";
  poster?: string;
  backdrop?: string;
  season?: number;
  episode?: number;
}

interface PlayerStore {
  currentMedia: CurrentMedia | null;
  currentStream: PlayerStream | null;
  playback: PlaybackState;
  selectedQuality: string;
  availableQualities: PlayerStreamQuality[];
  selectedSubtitle: StremioSubtitle | null;
  availableSubtitles: StremioSubtitle[];
  playQueue: CurrentMedia[];
  loadMedia: (media: CurrentMedia, stream: PlayerStream, autoPlay?: boolean) => void;
  setPlaying: (isPlaying: boolean) => void;
  togglePlay: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setFullscreen: (isFullscreen: boolean) => void;
  toggleFullscreen: () => void;
  setPlaybackRate: (rate: number) => void;
  setControlsVisible: (visible: boolean) => void;
  setBuffering: (isBuffering: boolean) => void;
  setPip: (isPip: boolean) => void;
  setQuality: (quality: string) => void;
  setSubtitle: (subtitle: StremioSubtitle | null) => void;
  addToQueue: (media: CurrentMedia) => void;
  removeFromQueue: (id: string) => void;
  playNext: () => void;
  seek: (time: number) => void;
  seekRelative: (seconds: number) => void;
  close: () => void;
}

const initialPlayback: PlaybackState = {
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: VOLUME.default,
  isMuted: false,
  isFullscreen: false,
  playbackRate: 1,
  controlsVisible: true,
  isBuffering: true,
  isPip: false,
  _prevVolume: VOLUME.default,
};

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      currentMedia: null,
      currentStream: null,
      playback: { ...initialPlayback },
      selectedQuality: "1080p",
      availableQualities: [],
      selectedSubtitle: null,
      availableSubtitles: [],
      playQueue: [],

      loadMedia: (media, stream, autoPlay = true) => {
        set({
          currentMedia: media,
          currentStream: stream,
          availableQualities: stream.qualities || [],
          availableSubtitles: stream.subtitles || [],
          selectedQuality: stream.label || "Auto",
          selectedSubtitle: stream.subtitles?.[0] ?? null,
          playback: { ...initialPlayback, isPlaying: autoPlay, volume: get().playback.volume, isMuted: get().playback.isMuted },
        });
      },

      setPlaying: (isPlaying) => set((s) => ({ playback: { ...s.playback, isPlaying } })),
      togglePlay: () => set((s) => ({ playback: { ...s.playback, isPlaying: !s.playback.isPlaying } })),
      setCurrentTime: (currentTime) => set((s) => ({ playback: { ...s.playback, currentTime } })),
      setDuration: (duration) => set((s) => ({ playback: { ...s.playback, duration } })),
      setVolume: (volume) => set((s) => ({ playback: { ...s.playback, volume: Math.max(VOLUME.min, Math.min(VOLUME.max, volume)), isMuted: volume === 0, _prevVolume: volume > 0 ? volume : s.playback._prevVolume } })),
      toggleMute: () => set((s) => ({ playback: { ...s.playback, isMuted: !s.playback.isMuted, volume: s.playback.isMuted ? (s.playback._prevVolume || VOLUME.default) : 0 } })),
      setFullscreen: (isFullscreen) => set((s) => ({ playback: { ...s.playback, isFullscreen } })),
      toggleFullscreen: () => set((s) => ({ playback: { ...s.playback, isFullscreen: !s.playback.isFullscreen } })),
      setPlaybackRate: (playbackRate) => set((s) => ({ playback: { ...s.playback, playbackRate: Math.max(0.25, Math.min(4, playbackRate)) } })),
      setControlsVisible: (controlsVisible) => set((s) => ({ playback: { ...s.playback, controlsVisible } })),
      setBuffering: (isBuffering) => set((s) => ({ playback: { ...s.playback, isBuffering } })),
      setPip: (isPip) => set((s) => ({ playback: { ...s.playback, isPip } })),
      setQuality: (selectedQuality) => set({ selectedQuality }),
      setSubtitle: (selectedSubtitle) => set({ selectedSubtitle }),

      addToQueue: (media) => set((s) => ({ playQueue: s.playQueue.some((m) => m.id === media.id) ? s.playQueue : [...s.playQueue, media] })),
      removeFromQueue: (id) => set((s) => ({ playQueue: s.playQueue.filter((m) => m.id !== id) })),
      playNext: () => { const state = get(); if (state.playQueue.length > 0) set({ playQueue: state.playQueue.slice(1) }); },
      seek: (time) => { const state = get(); set({ playback: { ...state.playback, currentTime: Math.max(0, Math.min(time, state.playback.duration)) } }); },
      seekRelative: (seconds) => { get().seek(get().playback.currentTime + seconds); },
      close: () => set({ currentMedia: null, currentStream: null, playback: { ...initialPlayback }, availableQualities: [], selectedSubtitle: null, availableSubtitles: [] }),
    }),
    {
      name: "hdhub-player-storage",
      partialize: (state) => ({ playback: { volume: state.playback.volume, isMuted: state.playback.isMuted }, selectedQuality: state.selectedQuality, playQueue: state.playQueue }),
      merge: (persisted, current) => ({ ...current, ...(persisted as Partial<PlayerStore>), playback: { ...current.playback, ...(persisted as { playback?: Partial<PlaybackState> })?.playback } }),
    },
  ),
);
