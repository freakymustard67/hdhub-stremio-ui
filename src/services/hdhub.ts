import { type StremioManifest, type StremioCatalogResponse, type StremioMetaDetail, type StremioStreamResponse, type StremioCatalogExtraParams, type AddonConfig, type MediaItem } from "@/types/stremio";
import { HDHUB_DEFAULT_URL, STREAM_CACHE_TTL } from "@/lib/constants";

export class HDHubError extends Error {
  public statusCode: number;
  public isNetworkError: boolean;
  public isParseError: boolean;
  constructor(message: string, opts: { statusCode?: number; isNetworkError?: boolean; isParseError?: boolean; cause?: unknown } = {}) {
    super(message, { cause: opts.cause });
    this.name = "HDHubError";
    this.statusCode = opts.statusCode ?? 500;
    this.isNetworkError = opts.isNetworkError ?? false;
    this.isParseError = opts.isParseError ?? false;
  }
}

async function fetchWithRetry<T>(url: string, options: { timeout?: number; retries?: number; cache?: RequestCache } = {}): Promise<T> {
  const { timeout = 10000, retries = 2, cache = "default" } = options;
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      const response = await fetch(url, { signal: controller.signal, cache, headers: { Accept: "application/json" } });
      clearTimeout(timeoutId);
      if (!response.ok) throw new HDHubError(`HTTP ${response.status}`, { statusCode: response.status });
      return (await response.json()) as T;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (error instanceof HDHubError && error.statusCode >= 400 && error.statusCode < 500) throw error;
      if (attempt < retries) await new Promise((r) => setTimeout(r, Math.min(1000 * Math.pow(2, attempt), 4000)));
    }
  }
  throw new HDHubError(`Failed after ${retries + 1} attempts: ${lastError?.message}`, { isNetworkError: true, cause: lastError });
}

export async function getAddonConfig(baseUrl?: string): Promise<AddonConfig> {
  const url = baseUrl || HDHUB_DEFAULT_URL;
  try {
    const manifest = await fetchWithRetry<StremioManifest>(`${url}/manifest.json`, { timeout: 8000, retries: 1 });
    if (!manifest.id || !manifest.name || !manifest.resources || !manifest.types)
      throw new HDHubError("Invalid manifest", { isParseError: true });
    return { baseUrl: url, manifest, isReachable: true };
  } catch (error) {
    return { baseUrl: url, manifest: null, isReachable: false, error: error instanceof Error ? error.message : "Unknown" };
  }
}

export async function fetchCatalog(type: string, extra: StremioCatalogExtraParams = {}, baseUrl?: string): Promise<StremioCatalogResponse> {
  const url = baseUrl || HDHUB_DEFAULT_URL;
  const catalogId = `hdhub-${type}`;
  const catalogUrl = `${url}/catalog/${type}/${catalogId}${buildExtraParams(extra)}.json`;
  try {
    const response = await fetchWithRetry<StremioCatalogResponse>(catalogUrl, { timeout: 15000, retries: 1, cache: extra.search ? "no-cache" : "default" });
    if (!response.metas || !Array.isArray(response.metas)) return { metas: [] };
    return response;
  } catch {
    return { metas: [] };
  }
}

function buildExtraParams(extra: StremioCatalogExtraParams): string {
  const params: string[] = [];
  if (extra.search) params.push(`search=${encodeURIComponent(extra.search)}`);
  if (extra.genre) params.push(`genre=${encodeURIComponent(extra.genre)}`);
  if (extra.skip !== undefined && extra.skip > 0) params.push(`skip=${extra.skip}`);
  for (const [k, v] of Object.entries(extra)) {
    if (!["search", "genre", "skip"].includes(k) && v !== undefined)
      params.push(`${k}=${encodeURIComponent(String(v))}`);
  }
  return params.length > 0 ? `/${params.join("/")}` : "";
}

export async function fetchMetaDetail(type: string, id: string, baseUrl?: string): Promise<StremioMetaDetail> {
  const url = baseUrl || HDHUB_DEFAULT_URL;
  const metaUrl = `${url}/meta/${type}/${encodeURIComponent(id)}.json`;
  try {
    const response = await fetchWithRetry<{ meta: StremioMetaDetail }>(metaUrl, { timeout: 10000, retries: 1 });
    if (!response.meta) throw new HDHubError("No meta", { isParseError: true });
    return response.meta;
  } catch {
    // Addon has no meta endpoint — build basic metadata from what we know
    return {
      id,
      type: type as "movie" | "series",
      name: id.startsWith("tt") ? `Movie (${id})` : id,
      description: "Stream this title",
    };
  }
}

export async function fetchStreams(type: string, id: string, baseUrl?: string): Promise<StremioStreamResponse> {
  const url = baseUrl || HDHUB_DEFAULT_URL;
  const streamUrl = `${url}/stream/${type}/${encodeURIComponent(id)}.json`;
  const response = await fetchWithRetry<StremioStreamResponse>(streamUrl, { timeout: 15000, retries: 2, cache: "no-cache" });
  if (!response.streams || !Array.isArray(response.streams)) throw new HDHubError("Invalid stream response", { isParseError: true });
  return response;
}

/**
 * Search for movies & series using the server-side API route.
 */
export async function searchAll(query: string): Promise<MediaItem[]> {
  // If query looks like an IMDB ID, use it directly
  const trimmed = query.trim();
  if (/^tt\d+$/.test(trimmed)) {
    return [{
      id: trimmed,
      type: "movie" as const,
      title: `IMDB ${trimmed}`,
      description: "Click to stream",
    }];
  }

  // Use the server-side search API
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.results && Array.isArray(data.results)) return data.results;
    }
  } catch {
    // Search API failed, continue to fallback
  }

  // Fallback: show the search query as a direct stream lookup entry
  return [{
    id: `search:${encodeURIComponent(query)}`,
    type: "movie" as const,
    title: `Search: ${query}`,
    description: "Click to try streaming this title",
  }];
}

export function isImdbId(value: string): boolean {
  return /^tt\d+$/.test(value.trim());
}

export function getCatalogCacheKey(type: string, extra: StremioCatalogExtraParams = {}): string {
  return `catalog:${type}:${JSON.stringify(extra)}`;
}
export function getMetaCacheKey(type: string, id: string): string { return `meta:${type}:${id}`; }
export function getStreamCacheKey(type: string, id: string): string { return `stream:${type}:${id}`; }
export function isStreamStale(cachedAt: string): boolean { return Date.now() - new Date(cachedAt).getTime() > STREAM_CACHE_TTL * 1000; }
