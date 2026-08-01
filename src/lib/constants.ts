export const HDHUB_DEFAULT_URL =
  process.env.NEXT_PUBLIC_HDHUB_ADDON_URL ||
  "https://h7771n2m2h.execute-api.us-east-1.amazonaws.com/prod";

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "HDHub Stream";
export const DEFAULT_CACHE_TTL = 60 * 60 * 4;
export const STREAM_CACHE_TTL = 60 * 15;
export const CATALOG_PAGE_SIZE = 20;
export const HERO_CAROUSEL_MAX = 10;
export const SEARCH_DEBOUNCE_MS = 300;

export const ANIMATION = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  spring: { type: "spring" as const, stiffness: 300, damping: 25 },
} as const;

export const VOLUME = { min: 0, max: 1, step: 0.05, default: 0.8 } as const;

export const QUALITY_LABELS: Record<string, string> = {
  "4k": "4K Ultra HD", "1080p": "1080p Full HD", "720p": "720p HD",
  "480p": "480p SD", "360p": "360p",
} as const;

export const GENRE_COLORS: Record<string, string> = {
  Action: "bg-red-600/20 text-red-400 border-red-600/30",
  Adventure: "bg-orange-600/20 text-orange-400 border-orange-600/30",
  Comedy: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
  Drama: "bg-purple-600/20 text-purple-400 border-purple-600/30",
  Horror: "bg-gray-800/50 text-gray-300 border-gray-700/50",
  Romance: "bg-pink-600/20 text-pink-400 border-pink-600/30",
  "Sci-Fi": "bg-cyan-600/20 text-cyan-400 border-cyan-600/30",
  Thriller: "bg-indigo-600/20 text-indigo-400 border-indigo-600/30",
  Documentary: "bg-green-600/20 text-green-400 border-green-600/30",
  Animation: "bg-blue-600/20 text-blue-400 border-blue-600/30",
  default: "bg-gray-700/30 text-gray-300 border-gray-600/30",
};
