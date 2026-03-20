import { useMutation, useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import {
  approveAdminOrder,
  getAdminOrdersMetrics,
  listAdminOrders,
  rejectAdminOrder,
} from "./service"

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

export function useApproveAdminOrder(): {
  approve: (args: { id: string; note: string }) => Promise<void>
  isPending: boolean
} {
  const mutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => approveAdminOrder(id, note),
  })
  return { approve: mutation.mutateAsync, isPending: mutation.isPending }
}

export function useRejectAdminOrder(): {
  reject: (args: { id: string; reason: string }) => Promise<void>
  isPending: boolean
} {
  const mutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectAdminOrder(id, reason),
  })
  return { reject: mutation.mutateAsync, isPending: mutation.isPending }
}
