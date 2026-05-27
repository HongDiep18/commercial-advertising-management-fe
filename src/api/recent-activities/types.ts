export type RecentActivityItem = {
  id: string
  time: string
  title: string
  content: string
}

export type RecentActivitiesSortOrder = "asc" | "desc"

export type RecentActivitiesPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type RecentActivitiesQuery = {
  page?: number
  limit?: number
  sortOrder?: RecentActivitiesSortOrder
  search?: string
}

export type RecentActivitiesResponse = {
  activities: RecentActivityItem[]
  pagination: RecentActivitiesPagination
}

export const RECENT_ACTIVITIES_DEFAULT_PAGE = 1
export const RECENT_ACTIVITIES_DEFAULT_LIMIT = 15
export const RECENT_ACTIVITIES_MAX_LIMIT = 100
export const RECENT_ACTIVITIES_DEFAULT_SORT_ORDER: RecentActivitiesSortOrder = "desc"
