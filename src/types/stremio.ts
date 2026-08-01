export type StremioResource = "catalog" | "meta" | "stream" | "subtitles" | "addon_catalog";
export type StremioContentType = "movie" | "series" | "channel" | "tv";

export interface StremioManifest {
  id: string;
  name: string;
  description: string;
  version: string;
  resources: StremioResource[];
  types: StremioContentType[];
  idPrefixes?: string[];
  catalogs: StremioCatalogDescriptor[];
  background?: string;
  logo?: string;
  contactEmail?: string;
  behaviorHints?: { adult?: boolean; configurable?: boolean; configurationSchema?: Record<string, unknown> };
}

export interface StremioCatalogDescriptor {
  type: StremioContentType;
  id: string;
  name: string;
  extra?: StremioCatalogExtra[];
  genres?: string[];
}

export interface StremioCatalogExtra {
  name: string;
  isRequired?: boolean;
  options?: string[];
  optionsLimit?: number;
}

export interface StremioCatalogExtraParams {
  search?: string;
  genre?: string;
  skip?: number;
  [key: string]: string | number | undefined;
}

export interface StremioMetaPreview {
  id: string;
  type: StremioContentType;
  name: string;
  poster?: string;
  posterShape?: "poster" | "square" | "landscape";
  background?: string;
  description?: string;
  year?: number;
  rating?: string;
  imdbRating?: string;
  isFree?: boolean;
  runtime?: string;
  behaviorHints?: { defaultVideo?: boolean; hasScheduledVideos?: boolean };
}

export interface StremioMetaDetail extends StremioMetaPreview {
  plot?: string;
  cast?: string[];
  director?: string[];
  writer?: string[];
  studio?: string;
  genre?: string[];
  country?: string[];
  releaseInfo?: string;
  language?: string[];
  website?: string;
  trailer?: string;
  certification?: string;
  logo?: string;
  videos?: StremioVideo[];
}

export interface StremioVideo {
  id: string;
  title: string;
  season?: number;
  episode?: number;
  description?: string;
  released?: string;
  duration?: number;
  thumbnail?: string;
  available?: boolean;
}

export interface StremioCatalogResponse {
  metas: StremioMetaPreview[];
  total?: number;
  cache?: { maxAge?: number; staleRevalidate?: number; staleError?: number };
}

export interface StremioStream {
  url?: string;
  infoHash?: string;
  fileIdx?: number;
  name?: string;
  description?: string;
  streamType?: "mp4" | "hls" | "torrent" | "external";
  subtitles?: StremioSubtitle[];
  behaviorHints?: {
    notWebReady?: boolean;
    bingeGroup?: string;
    videoSize?: number;
    countryWhitelist?: string[];
    countryBlacklist?: string[];
  };
}

export interface StremioSubtitle {
  id: string;
  url: string;
  lang: string;
  langCode?: string;
  default?: boolean;
  format?: "srt" | "vtt" | "ass";
}

export interface StremioStreamResponse {
  streams: StremioStream[];
  cache?: { maxAge?: number; staleRevalidate?: number; staleError?: number };
}

export interface StremioSubtitleResponse {
  subtitles: StremioSubtitle[];
  cache?: { maxAge?: number; staleRevalidate?: number; staleError?: number };
}

export interface MediaItem {
  id: string;
  type: StremioContentType;
  title: string;
  poster?: string;
  backdrop?: string;
  description?: string;
  year?: number;
  rating?: string;
  genres?: string[];
  cast?: string[];
  runtime?: string;
  certification?: string;
  metaDetail?: StremioMetaDetail;
}

export interface PlayerStream {
  url: string;
  label: string;
  type: "mp4" | "hls" | "torrent";
  qualities?: PlayerStreamQuality[];
  subtitles?: StremioSubtitle[];
}

export interface PlayerStreamQuality {
  label: string;
  url: string;
}

export interface AddonConfig {
  baseUrl: string;
  manifest: StremioManifest | null;
  isReachable: boolean;
  error?: string;
}
