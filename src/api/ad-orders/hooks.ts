import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { getAdOrderPreview, getMyAdOrders, type AdOrderPreviewResponse, type MyAdOrdersResponse } from "./service"

export type MyAdOrdersQuery = {
  status?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: string
}

export const myAdOrdersKeys = {
  all: ["ad-orders", "my-orders"] as const,
  list: (query: MyAdOrdersQuery) => [...myAdOrdersKeys.all, "list", query] as const,
  preview: (orderId: string) => ["ad-orders", "preview", orderId] as const,
}

export function useAdOrderPreview(orderId: string): {
  data?: AdOrderPreviewResponse
  isLoading: boolean
  isError: boolean
} {
  const { data, isLoading, isError } = useQuery({
    queryKey: myAdOrdersKeys.preview(orderId),
    queryFn: () => getAdOrderPreview(orderId),
    enabled: Boolean(orderId),
    retry: false,
  })

  return { data, isLoading, isError }
}

export function useMyAdOrders(
  query: MyAdOrdersQuery = {},
  enabled: boolean = true
): {
  data?: MyAdOrdersResponse
  isLoading: boolean
  isError: boolean
} {
  const { t } = useTranslation()

  const { data, isLoading, isError } = useQuery({
    queryKey: myAdOrdersKeys.list(query),
    queryFn: () => getMyAdOrders(query),
    enabled,
    meta: {
      errorMessage: t("error.failedToLoadOrders"),
    },
  })

  return { data, isLoading, isError }
}
