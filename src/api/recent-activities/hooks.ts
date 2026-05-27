import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { getRecentActivities } from "./service"
import type { RecentActivitiesQuery, RecentActivitiesResponse } from "./types"
import {
  RECENT_ACTIVITIES_DEFAULT_LIMIT,
  RECENT_ACTIVITIES_DEFAULT_PAGE,
  RECENT_ACTIVITIES_DEFAULT_SORT_ORDER,
} from "./types"

const recentActivitiesKeys = {
  all: ["admin", "recent-activities"] as const,
  list: (query: RecentActivitiesQuery) => [...recentActivitiesKeys.all, query] as const,
}

export const defaultRecentActivitiesQuery: RecentActivitiesQuery = {
  page: RECENT_ACTIVITIES_DEFAULT_PAGE,
  limit: RECENT_ACTIVITIES_DEFAULT_LIMIT,
  sortOrder: RECENT_ACTIVITIES_DEFAULT_SORT_ORDER,
}

export function useRecentActivities(query: RecentActivitiesQuery = defaultRecentActivitiesQuery) {
  return useQuery({
    queryKey: recentActivitiesKeys.list(query),
    queryFn: () => getRecentActivities(query),
    placeholderData: keepPreviousData,
  })
}

export type { RecentActivitiesQuery, RecentActivitiesResponse }
