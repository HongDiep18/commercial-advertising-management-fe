import { api } from "@/lib/api"
import type {
  AdminEditOrderPayload,
  AdminEditOrderResponse,
  AdminEditOrderItemPayload,
  AdminListOrdersQuery,
  AdminListOrdersResponse,
  AdminNewOrderItemPayload,
  AdminOrderDto,
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

function isValidHttpUrl(value: string | undefined): value is string {
  if (!value) return false
  const trimmed = value.trim()
  if (!trimmed) return false
  try {
    const url = new URL(trimmed)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

function sanitizeEditItem(item: AdminEditOrderItemPayload): AdminEditOrderItemPayload {
  if (!isValidHttpUrl(item.adLinkUrl)) {
    const sanitizedItem = { ...item }
    delete sanitizedItem.adLinkUrl
    return sanitizedItem
  }
  return { ...item, adLinkUrl: item.adLinkUrl.trim() }
}

function sanitizeNewItem(item: AdminNewOrderItemPayload): AdminNewOrderItemPayload {
  if (!isValidHttpUrl(item.adLinkUrl)) {
    const sanitizedItem = { ...item }
    delete sanitizedItem.adLinkUrl
    return sanitizedItem
  }
  return { ...item, adLinkUrl: item.adLinkUrl.trim() }
}

function sanitizeEditOrderPayload(payload: AdminEditOrderPayload): AdminEditOrderPayload {
  return {
    ...payload,
    items: payload.items?.map(sanitizeEditItem),
    newItems: payload.newItems?.map(sanitizeNewItem),
  }
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

export async function approveAdminOrder(id: string, reason: string): Promise<void> {
  await api.request(`/admin/ad-orders/${encodeURIComponent(id)}/approve`, {
    method: "POST",
    body: { reason },
  })
}

export async function rejectAdminOrder(id: string, reason: string): Promise<void> {
  await api.request(`/admin/ad-orders/${encodeURIComponent(id)}/reject`, {
    method: "POST",
    body: { reason },
  })
}

export async function getAdminOrder(id: string): Promise<AdminOrderDto> {
  return api.request<AdminOrderDto>(`/admin/ad-orders/${encodeURIComponent(id)}`, {
    method: "GET",
  })
}

export async function editAdminOrder(
  id: string,
  payload: AdminEditOrderPayload
): Promise<AdminEditOrderResponse> {
  const sanitizedPayload = sanitizeEditOrderPayload(payload)
  return api.request<AdminEditOrderResponse>(`/admin/ad-orders/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: sanitizedPayload,
  })
}
