"use client"

import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { UserProvider } from "../src/contexts/user-context"
import "../src/i18n/config"

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.errorMessage)
        toast.error(
          (query.meta.errorMessage as string) || error.message || "An unknown error occurred"
        )
    },
  }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})

export function Providers({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation()
  const [langReady, setLangReady] = useState(false)

  useEffect(() => {
    const markReady = () => queueMicrotask(() => setLangReady(true))

    if (typeof window === "undefined") {
      markReady()
      return
    }
    markReady()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>{langReady ? <div key={i18n.language}>{children}</div> : null}</UserProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
