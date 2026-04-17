import {
  getAllProfileRequests,
  mapProfileRequestToCompanyRequest,
  type AdminListProfileRequestsQuery,
  type AdminListProfileRequestsResponse,
} from "@/api/admin"
import type { ProfileRequestRow } from "@/types/admin"
import { useQuery } from "@tanstack/react-query"

export const adminCompanyRequestsKeys = {
  all: ["admin", "company-requests"] as const,
  list: (q: AdminListProfileRequestsQuery & { page: number; limit: number }) =>
    [...adminCompanyRequestsKeys.all, "list", q] as const,
}

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
