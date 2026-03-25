export type AdminNotificationItem = {
  id: string
  createdAt: string
  updatedAt: string
  eventType: string
  title: string
  content: string
  entityType: string
  entityId: string
  isRead: boolean
  readAt?: string | null
  metadata?: Record<string, unknown>
}

export type AdminNotificationsPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type AdminNotificationsListQuery = {
  page?: number
  limit?: number
  unreadOnly?: boolean
  eventType?: string
}

export type AdminNotificationsListResponse = {
  notifications: AdminNotificationItem[]
  pagination: AdminNotificationsPagination
}

export type AdminNotificationsUnreadCountResponse = {
  unreadCount: number
}

export type AdminNotificationReadResponse = {
  id: string
  isRead: boolean
  readAt?: string | null
}

export type AdminNotificationReadAllResponse = {
  updatedCount: number
}
