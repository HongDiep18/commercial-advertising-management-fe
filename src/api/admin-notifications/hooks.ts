import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getAdminNotifications,
  getAdminNotificationsUnreadCount,
  markAdminNotificationAsRead,
  markAllAdminNotificationsAsRead,
} from "./service"
import type {
  AdminNotificationReadAllResponse,
  AdminNotificationReadResponse,
  AdminNotificationsListQuery,
  AdminNotificationsListResponse,
  AdminNotificationsUnreadCountResponse,
} from "./types"

export const adminNotificationsKeys = {
  all: ["admin", "notifications"] as const,
  list: (query: AdminNotificationsListQuery) => {
    const normalizedQuery: AdminNotificationsListQuery = {
      ...query,
      eventType: query.eventType?.trim() || undefined,
    }
    return [...adminNotificationsKeys.all, "list", normalizedQuery] as const
  },
  unreadCount: () => [...adminNotificationsKeys.all, "unread-count"] as const,
}

export function useAdminNotifications(
  query: AdminNotificationsListQuery,
  enabled: boolean = true
): {
  data?: AdminNotificationsListResponse
  isLoading: boolean
  isError: boolean
} {
  const { data, isLoading, isError } = useQuery({
    queryKey: adminNotificationsKeys.list(query),
    queryFn: () => getAdminNotifications(query),
    enabled,
  })

  return { data, isLoading, isError }
}

export function useAdminNotificationsUnreadCount(
  enabled: boolean = true
): {
  data?: AdminNotificationsUnreadCountResponse
  isLoading: boolean
  isError: boolean
} {
  const { data, isLoading, isError } = useQuery({
    queryKey: adminNotificationsKeys.unreadCount(),
    queryFn: getAdminNotificationsUnreadCount,
    enabled,
  })

  return { data, isLoading, isError }
}

export function useMarkAdminNotificationAsRead(): {
  markAsRead: (id: string) => Promise<AdminNotificationReadResponse>
  isPending: boolean
} {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (id: string) => markAdminNotificationAsRead(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminNotificationsKeys.all }),
        queryClient.invalidateQueries({ queryKey: adminNotificationsKeys.unreadCount() }),
      ])
    },
  })

  return { markAsRead: mutation.mutateAsync, isPending: mutation.isPending }
}

export function useMarkAllAdminNotificationsAsRead(): {
  markAllAsRead: () => Promise<AdminNotificationReadAllResponse>
  isPending: boolean
} {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: markAllAdminNotificationsAsRead,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminNotificationsKeys.all }),
        queryClient.invalidateQueries({ queryKey: adminNotificationsKeys.unreadCount() }),
      ])
    },
  })

  return { markAllAsRead: mutation.mutateAsync, isPending: mutation.isPending }
}
