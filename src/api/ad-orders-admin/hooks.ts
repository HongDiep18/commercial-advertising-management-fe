import { useQuery } from "@tanstack/react-query"
import type {
  AdminListOrdersQuery,
  AdminListOrdersResponse,
  AdminOrdersMetricsResponse,
} from "./types"
import { getAdminOrdersMetrics, listAdminOrders } from "./service"

const adminOrdersKeys = {
  all: ["admin", "ad-orders"] as const,
  list: (query: AdminListOrdersQuery) =>
    [...adminOrdersKeys.all, "list", query] as const,
  metrics: () => [...adminOrdersKeys.all, "metrics"] as const,
}

export function useAdminOrders(
  query: AdminListOrdersQuery
): {
  data?: AdminListOrdersResponse
  isLoading: boolean
  isError: boolean
} {
  const { data, isLoading, isError } = useQuery({
    queryKey: adminOrdersKeys.list(query),
    queryFn: () => listAdminOrders(query),
  })

  return { data, isLoading, isError }
}

export function useAdminOrdersMetrics(): {
  data?: AdminOrdersMetricsResponse
  isLoading: boolean
  isError: boolean
} {
  const { data, isLoading, isError } = useQuery({
    queryKey: adminOrdersKeys.metrics(),
    queryFn: getAdminOrdersMetrics,
  })

  return { data, isLoading, isError }
}

