import { api } from "@/lib/api"
import type {
  AdminNotificationReadAllResponse,
  AdminNotificationReadResponse,
  AdminNotificationsListQuery,
  AdminNotificationsListResponse,
  AdminNotificationsUnreadCountResponse,
} from "./types"

function buildQuery(query: AdminNotificationsListQuery): string {
  const params = new URLSearchParams()
  if (typeof query.page === "number") params.set("page", String(query.page))
  if (typeof query.limit === "number") params.set("limit", String(query.limit))
  if (typeof query.unreadOnly === "boolean") params.set("unreadOnly", String(query.unreadOnly))
  if (query.eventType) params.set("eventType", query.eventType)

  const qs = params.toString()
  return qs ? `?${qs}` : ""
}

export async function getAdminNotifications(
  query: AdminNotificationsListQuery = {}
): Promise<AdminNotificationsListResponse> {
  const qs = buildQuery(query)
  return api.request<AdminNotificationsListResponse>(`/admin/notifications${qs}`, {
    method: "GET",
  })
}

export async function getAdminNotificationsUnreadCount(): Promise<AdminNotificationsUnreadCountResponse> {
  return api.request<AdminNotificationsUnreadCountResponse>("/admin/notifications/unread-count", {
    method: "GET",
  })
}

export async function markAdminNotificationAsRead(
  id: string
): Promise<AdminNotificationReadResponse> {
  return api.request<AdminNotificationReadResponse>(`/admin/notifications/${id}/read`, {
    method: "PATCH",
  })
}

export async function markAllAdminNotificationsAsRead(): Promise<AdminNotificationReadAllResponse> {
  return api.request<AdminNotificationReadAllResponse>("/admin/notifications/read-all", {
    method: "PATCH",
  })
}
