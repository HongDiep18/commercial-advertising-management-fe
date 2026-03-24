import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { getMyAdOrders, type MyAdOrdersResponse } from "./service"

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
