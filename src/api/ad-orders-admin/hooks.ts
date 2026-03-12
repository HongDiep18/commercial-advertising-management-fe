import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { getAdminOrdersMetrics, listAdminOrders } from "./service"
import type {
  AdminListOrdersQuery,
  AdminListOrdersResponse,
  AdminOrdersMetricsResponse,
} from "./types"

const adminOrdersKeys = {
  all: ["admin", "ad-orders"] as const,
  list: (query: AdminListOrdersQuery) => [...adminOrdersKeys.all, "list", query] as const,
  metrics: () => [...adminOrdersKeys.all, "metrics"] as const,
}

export function useAdminOrders(query: AdminListOrdersQuery): {
  data?: AdminListOrdersResponse
  isLoading: boolean
  isError: boolean
} {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useQuery({
    queryKey: adminOrdersKeys.list(query),
    queryFn: () => listAdminOrders(query),
    meta: {
      errorMessage: t("error.failedToLoadOrders"),
    },
  })

  return { data, isLoading, isError }
}

export function useAdminOrdersMetrics(): {
  data?: AdminOrdersMetricsResponse
  isLoading: boolean
  isError: boolean
} {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useQuery({
    queryKey: adminOrdersKeys.metrics(),
    queryFn: getAdminOrdersMetrics,
    meta: {
      errorMessage: t("error.failedToLoadOrdersMetrics"),
    },
  })

  return { data, isLoading, isError }
}
