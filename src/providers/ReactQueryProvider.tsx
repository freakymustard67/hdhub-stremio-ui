"use client";
import { type ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DEFAULT_CACHE_TTL } from "@/lib/constants";

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: DEFAULT_CACHE_TTL * 1000,
        gcTime: DEFAULT_CACHE_TTL * 1000 * 2,
        retry: 2,
        retryDelay: (i) => Math.min(1000 * 2 ** i, 10000),
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
    },
  });
}

export function ReactQueryProvider({ children }: { children: ReactNode }): React.ReactElement {
  const [queryClient] = useState(() => createQueryClient());
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
