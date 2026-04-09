import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
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

const companiesKeys = {
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
): { data?: CompanyDetail; isLoading: boolean; isError: boolean; error: any } {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: companiesKeys.detail(id),
    queryFn: () => getCompanyDetail(id),
    enabled: enabled && Boolean(id),
    retry: false,
  })

  return { data, isLoading, isError, error }
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
    mutationFn: ({ companyId, payload }: { companyId: string; payload: AddAdminCompanyContactsPayload }) =>
      addAdminCompanyContacts(companyId, payload),
    onSuccess: (_res, vars) => {
      queryClient.invalidateQueries({ queryKey: companiesKeys.detail(vars.companyId) })
    },
  })

  return { mutateAsync, isPending }
}
