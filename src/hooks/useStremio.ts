"use client";
import { useQuery, useInfiniteQuery, type UseQueryResult, type UseInfiniteQueryResult, type InfiniteData } from "@tanstack/react-query";
import { fetchCatalog, fetchMetaDetail, fetchStreams, searchAll, getAddonConfig, type HDHubError } from "@/services/hdhub";
import { resolveStream } from "@/services/streamProxy";
import type { StremioCatalogResponse, StremioMetaDetail, StremioStreamResponse, StremioCatalogExtraParams, AddonConfig, MediaItem } from "@/types/stremio";
import type { PlayerStream } from "@/types/stremio";
import { CATALOG_PAGE_SIZE, HDHUB_DEFAULT_URL } from "@/lib/constants";

export const stremioKeys = {
  config: ["hdhub", "config"] as const,
  catalog: (type: string, extra: StremioCatalogExtraParams) => ["hdhub", "catalog", type, extra] as const,
  catalogInfinite: (type: string, extra: StremioCatalogExtraParams) => ["hdhub", "catalog", "infinite", type, extra] as const,
  meta: (type: string, id: string) => ["hdhub", "meta", type, id] as const,
  streams: (type: string, id: string) => ["hdhub", "streams", type, id] as const,
  playerStream: (type: string, id: string, quality: string) => ["hdhub", "playerStream", type, id, quality] as const,
  search: (query: string) => ["hdhub", "search", query] as const,
};

export function useAddonConfig(): UseQueryResult<AddonConfig, HDHubError> {
  return useQuery<AddonConfig, HDHubError>({
    queryKey: stremioKeys.config, queryFn: async () => {
      // Use the API proxy to avoid CORS
      const res = await fetch("/api/stremio/manifest");
      const data = await res.json();
      if (!res.ok) return { baseUrl: HDHUB_DEFAULT_URL, manifest: null, isReachable: false, error: data.error };
      return { baseUrl: HDHUB_DEFAULT_URL, manifest: data, isReachable: true };
    },
    staleTime: 1000 * 60 * 60, gcTime: 1000 * 60 * 60 * 24, retry: 3,
  });
}

export function useCatalog(type: string, extra: StremioCatalogExtraParams = {}, enabled: boolean = true): UseQueryResult<StremioCatalogResponse, HDHubError> {
  return useQuery<StremioCatalogResponse, HDHubError>({
    queryKey: stremioKeys.catalog(type, extra),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (extra.search) params.set("search", String(extra.search));
      if (extra.genre) params.set("genre", String(extra.genre));
      if (extra.skip) params.set("skip", String(extra.skip));
      const res = await fetch(`/api/stremio/catalog/${type}?${params.toString()}`);
      return res.json();
    },
    enabled, staleTime: 1000 * 60 * 30,
  });
}

export function useInfiniteCatalog(type: string, extra: Omit<StremioCatalogExtraParams, "skip"> = {}): UseInfiniteQueryResult<InfiniteData<StremioCatalogResponse>, HDHubError> {
  return useInfiniteQuery<StremioCatalogResponse, HDHubError>({
    queryKey: stremioKeys.catalogInfinite(type, extra),
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      if (extra.search) params.set("search", String(extra.search));
      if (extra.genre) params.set("genre", String(extra.genre));
      params.set("skip", String((pageParam as number) * CATALOG_PAGE_SIZE));
      const res = await fetch(`/api/stremio/catalog/${type}?${params.toString()}`);
      return res.json();
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => lastPage.metas.length < CATALOG_PAGE_SIZE ? undefined : allPages.length,
    staleTime: 1000 * 60 * 15,
  });
}

export function useMetaDetail(type: string, id: string, enabled: boolean = true): UseQueryResult<StremioMetaDetail, HDHubError> {
  return useQuery<StremioMetaDetail, HDHubError>({
    queryKey: stremioKeys.meta(type, id),
    queryFn: async () => {
      const res = await fetch(`/api/stremio/meta/${type}/${id}`);
      if (!res.ok) {
        // No meta endpoint — return fallback
        return { id, type: type as "movie" | "series", name: id.startsWith("tt") ? `Movie (${id})` : id, description: "" } as StremioMetaDetail;
      }
      const data = await res.json();
      return data.meta || data;
    },
    enabled: enabled && !!id, staleTime: 1000 * 60 * 60,
  });
}

export function useStreams(type: string, id: string, enabled: boolean = true): UseQueryResult<StremioStreamResponse, HDHubError> {
  return useQuery<StremioStreamResponse, HDHubError>({
    queryKey: stremioKeys.streams(type, id),
    queryFn: async () => {
      const res = await fetch(`/api/stremio/streams/${type}/${id}`);
      const data = await res.json();
      console.log("[useStreams] Response:", data); // Debug log
      return data;
    },
    enabled: enabled && !!id, staleTime: 1000 * 60 * 5, refetchOnMount: "always",
  });
}

export function useResolvedStream(type: string, id: string, preferredQuality: string = "1080p", enabled: boolean = true): UseQueryResult<PlayerStream | null, HDHubError> {
  return useQuery<PlayerStream | null, HDHubError>({
    queryKey: stremioKeys.playerStream(type, id, preferredQuality),
    queryFn: () => resolveStream(type, id, preferredQuality),
    enabled: enabled && !!id, staleTime: 1000 * 60 * 5, retry: 1,
  });
}

export function useSearch(query: string, enabled: boolean = true): UseQueryResult<MediaItem[], HDHubError> {
  return useQuery<MediaItem[], HDHubError>({
    queryKey: stremioKeys.search(query), queryFn: () => searchAll(query),
    enabled: enabled && query.length >= 2, staleTime: 1000 * 60 * 5, retry: 1,
  });
}
