import { QueryClient } from '@tanstack/react-query'

// New features (related content, and anything added after this point) use
// React Query instead of the older useAsync hook — it gives caching,
// dedup, and background refetch for free. Existing pages keep useAsync for
// now (no need to churn working code); this client is the foundation for
// gradually migrating the rest over time.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
