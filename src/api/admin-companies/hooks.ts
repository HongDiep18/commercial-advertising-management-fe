import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo } from "react"
import {
  getAdminCompaniesStats,
  getAdminCompanyDetail,
  updateAdminCompany,
  updateAdminCompanyWithLogo,
} from "./service"
import type {
  AdminCompaniesStatsResponse,
  AdminCompanyDetail,
  AdminCompanyUpdatePayload,
} from "./types"

export const adminCompaniesKeys = {
  all: ["admin", "companies"] as const,
  stats: () => [...adminCompaniesKeys.all, "stats"] as const,
  detail: (id: string) => [...adminCompaniesKeys.all, "detail", id] as const,
}

export function useAdminCompaniesStats(enabled: boolean = true): {
  data?: AdminCompaniesStatsResponse
  isLoading: boolean
  isError: boolean
} {
  const { data, isLoading, isError } = useQuery({
    queryKey: adminCompaniesKeys.stats(),
    queryFn: getAdminCompaniesStats,
    enabled,
  })

  return { data, isLoading, isError }
}

export function useAdminCompanyDetailsByIds(companyIds: string[]): {
  sortedUniqueIds: string[]
  detailsById: Record<string, AdminCompanyDetail>
} {
  const sortedUniqueIds = useMemo(
    () => [...new Set(companyIds.map((id) => id.trim()).filter(Boolean))].sort(),
    [companyIds]
  )

  const queries = useQueries({
    queries: sortedUniqueIds.map((id) => ({
      queryKey: adminCompaniesKeys.detail(id),
      queryFn: () => getAdminCompanyDetail(id),
      enabled: Boolean(id),
      retry: false,
      staleTime: 5 * 60 * 1000,
    })),
  })

  const detailsById = useMemo(() => {
    const out: Record<string, AdminCompanyDetail> = {}
    sortedUniqueIds.forEach((id, i) => {
      const data = queries[i]?.data
      if (data) out[id] = data
    })
    return out
  }, [sortedUniqueIds, queries])

  return { sortedUniqueIds, detailsById }
}

/** Loads a single company for the admin edit dialog; refetch when opening (staleTime 0). */
export function useAdminCompanyDetail(companyId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: adminCompaniesKeys.detail(companyId ?? ""),
    queryFn: () => getAdminCompanyDetail(companyId!),
    enabled: Boolean(enabled && companyId),
    staleTime: 0,
    retry: false,
  })
}

export type UpdateAdminCompanyMutationVariables = {
  companyId: string
  payload: AdminCompanyUpdatePayload
  logoChanged: boolean
  logoFile: File | null
}

export function useUpdateAdminCompanyMutation() {
  const queryClient = useQueryClient()

  return useMutation<
    AdminCompanyDetail,
    Error & { status?: number; message?: string },
    UpdateAdminCompanyMutationVariables
  >({
    mutationFn: async ({ companyId, payload, logoChanged, logoFile }) => {
      if (logoChanged && logoFile) {
        await updateAdminCompany(companyId, payload)
        return updateAdminCompanyWithLogo(companyId, {}, logoFile)
      }
      return updateAdminCompany(companyId, payload)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminCompaniesKeys.detail(variables.companyId) })
      queryClient.invalidateQueries({ queryKey: adminCompaniesKeys.stats() })
    },
  })
}
