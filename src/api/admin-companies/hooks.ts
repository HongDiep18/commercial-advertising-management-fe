import {
  keepPreviousData,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { useMemo } from "react"
import {
  exportAdminCompanies,
  getAdminCompaniesStats,
  getAdminCompanyDetail,
  listAdminCompanies,
  updateAdminCompany,
  updateAdminCompanyWithLogo,
} from "./service"
import type {
  AdminCompaniesStatsResponse,
  AdminCompanyDetail,
  AdminCompanyExportQuery,
  AdminCompanyExportResult,
  AdminCompanyListItem,
  AdminCompanyListQuery,
  AdminCompanyListResponse,
  AdminCompanyUpdatePayload,
} from "./types"
import { industryFromUnknown } from "@/api/companies/adminCompany.mapper"
import type { ProfileRequestRow, ProfileRequestStatusCounts } from "@/types/admin"
import { ProfileRequestStatus } from "@/types/admin"

export const adminCompaniesKeys = {
  all: ["admin", "companies"] as const,
  stats: () => [...adminCompaniesKeys.all, "stats"] as const,
  detail: (id: string) => [...adminCompaniesKeys.all, "detail", id] as const,
  list: (q: AdminCompanyListQuery) => [...adminCompaniesKeys.all, "list", q] as const,
}

function cleanString(v: unknown): string {
  return typeof v === "string" ? v.trim() : ""
}

function mapListItemToRow(item: AdminCompanyListItem): ProfileRequestRow {
  const companyId = cleanString(item.id)
  const companyName =
    cleanString(item.companyNameVi) ||
    cleanString(item.companyNameEn) ||
    cleanString(item.companyNameZh)
  const email = cleanString(item.primaryEmail)
  const phone = cleanString(item.primaryPhone)

  return {
    id: companyId,
    companyId,
    userId: cleanString(item.userId) || undefined,
    companyName,
    email,
    registeredEmail: email,
    companyEmail: email,
    contactName: "",
    status: cleanString(item.status),
    submittedAt: cleanString(item.createdAt) || cleanString(item.updatedAt),
    industry: industryFromUnknown(item.industry).join(", "),
    country: "",
    phone: phone || undefined,
    isActive: item.isActive === true,
  }
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

export function useAdminCompaniesList(query: AdminCompanyListQuery): {
  rows: ProfileRequestRow[]
  pagination: AdminCompanyListResponse["pagination"] | undefined
  isLoading: boolean
  isError: boolean
  error: Error | null
} {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: adminCompaniesKeys.list(query),
    queryFn: () => listAdminCompanies(query),
    placeholderData: keepPreviousData,
  })

  const rows = useMemo(() => (data?.companies ?? []).map(mapListItemToRow), [data?.companies])

  return {
    rows,
    pagination: data?.pagination,
    isLoading,
    isError,
    error: error as Error | null,
  }
}

const TAB_COUNT_BASE: AdminCompanyListQuery = {
  page: 1,
  limit: 1,
  sortBy: "createdAt",
  sortOrder: "desc",
}

const ADMIN_COMPANIES_TAB_COUNT_QUERIES: Array<{
  segment: "all" | ProfileRequestStatus
  query: AdminCompanyListQuery
}> = [
  { segment: "all", query: { ...TAB_COUNT_BASE } },
  {
    segment: ProfileRequestStatus.PENDING,
    query: { ...TAB_COUNT_BASE, status: ProfileRequestStatus.PENDING },
  },
  {
    segment: ProfileRequestStatus.APPROVED,
    query: { ...TAB_COUNT_BASE, status: ProfileRequestStatus.APPROVED },
  },
  {
    segment: ProfileRequestStatus.REJECTED,
    query: { ...TAB_COUNT_BASE, status: ProfileRequestStatus.REJECTED },
  },
]

export function useAdminCompaniesTabCounts(): {
  statusCounts: ProfileRequestStatusCounts
  isLoading: boolean
} {
  const results = useQueries({
    queries: ADMIN_COMPANIES_TAB_COUNT_QUERIES.map(({ segment, query }) => ({
      queryKey: [...adminCompaniesKeys.all, "tabCount", segment] as const,
      queryFn: () => listAdminCompanies(query),
      select: (res: AdminCompanyListResponse) => res.pagination?.total ?? 0,
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

export function useExportAdminCompanies() {
  return useMutation<AdminCompanyExportResult, Error & { status?: number }, AdminCompanyExportQuery>(
    {
      mutationFn: exportAdminCompanies,
    }
  )
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
      queryClient.invalidateQueries({ queryKey: adminCompaniesKeys.all })
    },
  })
}
