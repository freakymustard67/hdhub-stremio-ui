"use client";
import { useEffect, useRef, useCallback } from "react";

interface UseInfiniteScrollOptions {
  enabled?: boolean;
  rootMargin?: string;
  threshold?: number;
  onLoadMore: () => void;
}

export function useInfiniteScroll({ enabled = true, rootMargin = "400px", threshold = 0, onLoadMore }: UseInfiniteScrollOptions): React.RefObject<HTMLDivElement | null> {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const stableFn = useCallback(onLoadMore, [onLoadMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !enabled) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) stableFn(); },
      { rootMargin, threshold },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [enabled, rootMargin, threshold, stableFn]);

  return sentinelRef;
}
