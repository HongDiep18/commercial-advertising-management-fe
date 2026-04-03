import {
  getAllProfileRequests,
  mapProfileRequestToCompanyRequest,
  type AdminListProfileRequestsQuery,
  type AdminListProfileRequestsResponse,
} from "@/api/admin"
import type { ProfileRequestRow, ProfileRequestStatusCounts } from "@/types/admin"
import { ProfileRequestStatus } from "@/types/admin"
import { useQuery, useQueries } from "@tanstack/react-query"

export const adminCompanyRequestsKeys = {
  all: ["admin", "company-requests"] as const,
  list: (q: AdminListProfileRequestsQuery & { page: number; limit: number }) =>
    [...adminCompanyRequestsKeys.all, "list", q] as const,
  count: (segment: "all" | ProfileRequestStatus) =>
    [...adminCompanyRequestsKeys.all, "count", segment] as const,
}

const TAB_COUNT_QUERIES: Array<{
  segment: "all" | ProfileRequestStatus
  query: AdminListProfileRequestsQuery
}> = [
  { segment: "all", query: { page: 1, limit: 1 } },
  {
    segment: ProfileRequestStatus.PENDING,
    query: { page: 1, limit: 1, status: ProfileRequestStatus.PENDING },
  },
  {
    segment: ProfileRequestStatus.APPROVED,
    query: { page: 1, limit: 1, status: ProfileRequestStatus.APPROVED },
  },
  {
    segment: ProfileRequestStatus.REJECTED,
    query: { page: 1, limit: 1, status: ProfileRequestStatus.REJECTED },
  },
]

export function useCompanyRequestsPage(
  query: AdminListProfileRequestsQuery & { page: number; limit: number }
): {
  rows: ProfileRequestRow[]
  pagination: AdminListProfileRequestsResponse["pagination"]
  isLoading: boolean
  isError: boolean
  error: Error | null
} {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: adminCompanyRequestsKeys.list(query),
    queryFn: async () => {
      const res = await getAllProfileRequests(query)
      return {
        rows: (res.data ?? []).map((p) => mapProfileRequestToCompanyRequest(p)),
        pagination: res.pagination,
      }
    },
  })

  return {
    rows: data?.rows ?? [],
    pagination: data?.pagination,
    isLoading,
    isError,
    error: error as Error | null,
  }
}

export function useCompanyRequestsTabCounts(): {
  statusCounts: ProfileRequestStatusCounts
  isLoading: boolean
} {
  const results = useQueries({
    queries: TAB_COUNT_QUERIES.map(({ segment, query }) => ({
      queryKey: adminCompanyRequestsKeys.count(segment),
      queryFn: () => getAllProfileRequests(query),
      select: (res: AdminListProfileRequestsResponse) => res.pagination?.total ?? 0,
    })),
  })

  const [all, pending, approved, rejected] = results.map((r) => r.data ?? 0)
  const statusCounts: ProfileRequestStatusCounts = {
    all,
    [ProfileRequestStatus.PENDING]: pending,
    [ProfileRequestStatus.APPROVED]: approved,
    [ProfileRequestStatus.REJECTED]: rejected,
  }

  const isLoading = results.some((r) => r.isLoading)

  return { statusCounts, isLoading }
}
