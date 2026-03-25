export type RecentActivityItem = {
  id: string
  time: string
  title: string
  content: string
  action: string
  entityType?: string
  entityId?: string
  actorId?: string
}

export type RecentActivitiesPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type RecentActivitiesQuery = {
  page?: number
  limit?: number
}

export type RecentActivitiesResponse = {
  data?: RecentActivityItem[]
  activities?: RecentActivityItem[]
  pagination: RecentActivitiesPagination
}
