"use client"

import { useEffect, useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import "../src/i18n/config"
import { useTranslation } from "react-i18next"
import { UserProvider } from "../src/contexts/user-context"

const queryClient = new QueryClient()

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

