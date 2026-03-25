import { useQuery } from "@tanstack/react-query"
import { getRecentActivities } from "./service"
import type { RecentActivitiesQuery, RecentActivitiesResponse } from "./types"

const recentActivitiesKeys = {
  all: ["admin", "recent-activities"] as const,
  list: (query: RecentActivitiesQuery) => [...recentActivitiesKeys.all, query] as const,
}

export function useRecentActivities(
  query: RecentActivitiesQuery = { page: 1, limit: 20 }
): {
  data?: RecentActivitiesResponse
  isLoading: boolean
  isError: boolean
} {
  const { data, isLoading, isError } = useQuery({
    queryKey: recentActivitiesKeys.list(query),
    queryFn: () => getRecentActivities(query),
  })
  return { data, isLoading, isError }
}
