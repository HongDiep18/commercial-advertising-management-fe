import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo } from "react"
import type {
  AddAdminCompanyContactsPayload,
  AddAdminCompanyContactsResponse,
  CompanyCategoriesResponse,
  CompanyDetail,
  CompanyDirectoryQuery,
  CompanyDirectoryResponse,
  FeaturedCompaniesResponse,
} from "./types"
import {
  addAdminCompanyContacts,
  getCompanyCategories,
  getCompanyDetail,
  getCompanyDirectory,
  getFeaturedCompanies,
} from "./service"

export const companiesKeys = {
  all: ["companies"] as const,
  directory: (query: CompanyDirectoryQuery) => {
    const normalized: CompanyDirectoryQuery = {
      ...query,
      industry: Array.isArray(query.industry) ? [...query.industry].sort() : query.industry,
    }
    return [...companiesKeys.all, "directory", normalized] as const
  },
  categories: () => [...companiesKeys.all, "categories"] as const,
  detail: (id: string) => [...companiesKeys.all, "detail", id] as const,
  featured: () => [...companiesKeys.all, "featured"] as const,
}

export function useCompanyDirectory(
  query: CompanyDirectoryQuery,
  enabled: boolean = true
): {
  data?: CompanyDirectoryResponse
  isLoading: boolean
  isError: boolean
} {
  const { data, isLoading, isError } = useQuery({
    queryKey: companiesKeys.directory(query),
    queryFn: () => getCompanyDirectory(query),
    enabled,
  })

  return { data, isLoading, isError }
}

export function useCompanyCategories(enabled: boolean = true): {
  data?: CompanyCategoriesResponse
  isLoading: boolean
  isError: boolean
} {
  const { data, isLoading, isError } = useQuery({
    queryKey: companiesKeys.categories(),
    queryFn: () => getCompanyCategories(),
    enabled,
  })

  return { data, isLoading, isError }
}

export function useCompanyDetail(
  id: string,
  enabled: boolean = true
): { data?: CompanyDetail; isLoading: boolean; isError: boolean; error: unknown } {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: companiesKeys.detail(id),
    queryFn: () => getCompanyDetail(id),
    enabled: enabled && Boolean(id),
    retry: false,
  })

  return { data, isLoading, isError, error }
}

export type CompanyDetailEnrichment = {
  companyName: string
  email: string
  contactName: string
  industry: string
}

type CompanyRowFallback = {
  companyName?: string
  email?: string
  contactName?: string
  industry?: string
}

function industryToEnrichmentString(
  detailIndustry: CompanyDetail["industry"] | undefined,
  fallbackIndustry: CompanyRowFallback["industry"] | undefined
): string {
  const raw = detailIndustry ?? fallbackIndustry
  if (raw == null || raw === "") return ""
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean).join(", ")
  return String(raw)
}

export function useCompanyDetailEnrichmentMap(
  companyIds: string[],
  fallbackById: Record<string, CompanyRowFallback | undefined>
): Record<string, CompanyDetailEnrichment> {
  const sortedUniqueIds = useMemo(
    () => [...new Set(companyIds.map((id) => id.trim()).filter(Boolean))].sort(),
    [companyIds]
  )

  const queries = useQueries({
    queries: sortedUniqueIds.map((id) => ({
      queryKey: companiesKeys.detail(id),
      queryFn: () => getCompanyDetail(id),
      enabled: Boolean(id),
      retry: false,
      staleTime: 5 * 60 * 1000,
    })),
  })

  return useMemo(() => {
    const out: Record<string, CompanyDetailEnrichment> = {}
    sortedUniqueIds.forEach((id, i) => {
      const detail = queries[i]?.data
      const fallback = fallbackById[id]
      if (!detail) return
      const companyName =
        detail.companyNameVi || detail.companyNameCn || fallback?.companyName || ""
      const email =
        typeof detail.email === "string" && detail.email.trim()
          ? detail.email.trim()
          : fallback?.email || ""
      const contactName = detail.contactName || fallback?.contactName || ""
      const industry = industryToEnrichmentString(detail.industry, fallback?.industry)
      out[id] = { companyName, email, contactName, industry }
    })
    return out
  }, [sortedUniqueIds, fallbackById, queries])
}

export function useFeaturedCompanies(): {
  data?: FeaturedCompaniesResponse
  isLoading: boolean
  isError: boolean
} {
  const { data, isLoading, isError } = useQuery({
    queryKey: companiesKeys.featured(),
    queryFn: () => getFeaturedCompanies(),
  })

  return { data, isLoading, isError }
}

export function useAddAdminCompanyContacts(): {
  mutateAsync: (args: {
    companyId: string
    payload: AddAdminCompanyContactsPayload
  }) => Promise<AddAdminCompanyContactsResponse>
  isPending: boolean
} {
  const queryClient = useQueryClient()

  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({
      companyId,
      payload,
    }: {
      companyId: string
      payload: AddAdminCompanyContactsPayload
    }) => addAdminCompanyContacts(companyId, payload),
    onSuccess: (_res, vars) => {
      queryClient.invalidateQueries({ queryKey: companiesKeys.detail(vars.companyId) })
    },
  })

  return { mutateAsync, isPending }
}
