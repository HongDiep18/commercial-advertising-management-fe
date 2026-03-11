import { api } from "@/lib/api"
import type {
  AdminListOrdersQuery,
  AdminListOrdersResponse,
  AdminOrdersMetricsResponse,
} from "./types"

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return
    searchParams.append(key, String(value))
  })
  const qs = searchParams.toString()
  return qs ? `?${qs}` : ""
}

export async function listAdminOrders(
  query: AdminListOrdersQuery
): Promise<AdminListOrdersResponse> {
  const qs = buildQuery(query)
  const res = await api.request<AdminListOrdersResponse>(`/admin/ad-orders${qs}`, {
    method: "GET",
  })
  return res
}

export async function getAdminOrdersMetrics(): Promise<AdminOrdersMetricsResponse> {
  const res = await api.request<AdminOrdersMetricsResponse>("/admin/ad-orders/metrics", {
    method: "GET",
  })
  return res
}
