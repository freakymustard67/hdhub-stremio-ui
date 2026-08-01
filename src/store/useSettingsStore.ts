import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "dark" | "light" | "system";
export type SubtitleSize = "small" | "medium" | "large" | "xlarge";
export type SubtitleFont = "default" | "monospace" | "serif" | "rounded";

export interface StreamingPreferences {
  preferredQuality: string;
  autoPlayNext: boolean;
  skipIntro: boolean;
  hardwareAcceleration: boolean;
  bufferSize: number;
}

export interface UICustomization {
  showGenreBadges: boolean;
  showRatings: boolean;
  showYearLabels: boolean;
  cardSize: "compact" | "normal" | "expanded";
}

interface SettingsStore {
  theme: Theme;
  appLanguage: string;
  subtitleLanguage: string;
  subtitleSize: SubtitleSize;
  subtitleFont: SubtitleFont;
  subtitleOpacity: number;
  subtitleBackground: boolean;
  streaming: StreamingPreferences;
  ui: UICustomization;
  setTheme: (theme: Theme) => void;
  setAppLanguage: (lang: string) => void;
  setSubtitleLanguage: (lang: string) => void;
  setSubtitleSize: (size: SubtitleSize) => void;
  setSubtitleFont: (font: SubtitleFont) => void;
  setSubtitleOpacity: (opacity: number) => void;
  setSubtitleBackground: (enabled: boolean) => void;
  setStreamingPreference: <K extends keyof StreamingPreferences>(key: K, value: StreamingPreferences[K]) => void;
  setUIPreference: <K extends keyof UICustomization>(key: K, value: UICustomization[K]) => void;
  resetSettings: () => void;
}

const defaultStreaming: StreamingPreferences = { preferredQuality: "1080p", autoPlayNext: true, skipIntro: false, hardwareAcceleration: true, bufferSize: 30 };
const defaultUI: UICustomization = { showGenreBadges: true, showRatings: true, showYearLabels: true, cardSize: "normal" };

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: "dark",
      appLanguage: "en",
      subtitleLanguage: "en",
      subtitleSize: "medium",
      subtitleFont: "default",
      subtitleOpacity: 0.85,
      subtitleBackground: true,
      streaming: { ...defaultStreaming },
      ui: { ...defaultUI },
      setTheme: (theme) => set({ theme }),
      setAppLanguage: (appLanguage) => set({ appLanguage }),
      setSubtitleLanguage: (subtitleLanguage) => set({ subtitleLanguage }),
      setSubtitleSize: (subtitleSize) => set({ subtitleSize }),
      setSubtitleFont: (subtitleFont) => set({ subtitleFont }),
      setSubtitleOpacity: (subtitleOpacity) => set({ subtitleOpacity: Math.max(0, Math.min(1, subtitleOpacity)) }),
      setSubtitleBackground: (subtitleBackground) => set({ subtitleBackground }),
      setStreamingPreference: (key, value) => set((s) => ({ streaming: { ...s.streaming, [key]: value } })),
      setUIPreference: (key, value) => set((s) => ({ ui: { ...s.ui, [key]: value } })),
      resetSettings: () => set({ theme: "dark", appLanguage: "en", subtitleLanguage: "en", subtitleSize: "medium", subtitleFont: "default", subtitleOpacity: 0.85, subtitleBackground: true, streaming: { ...defaultStreaming }, ui: { ...defaultUI } }),
    }),
    { name: "hdhub-settings-storage" },
  ),
);
