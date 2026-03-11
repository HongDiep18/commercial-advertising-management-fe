import { useQuery } from "@tanstack/react-query"
import type { AdminListOrdersQuery, AdminListOrdersResponse } from "./types"
import { listAdminOrders } from "./service"

const adminOrdersKeys = {
  all: ["admin", "ad-orders"] as const,
  list: (query: AdminListOrdersQuery) =>
    [...adminOrdersKeys.all, "list", query] as const,
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

