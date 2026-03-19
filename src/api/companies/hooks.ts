import { useQuery } from "@tanstack/react-query"
import type {
  CompanyCategoriesResponse,
  CompanyDetail,
  CompanyDirectoryQuery,
  CompanyDirectoryResponse,
  FeaturedCompaniesResponse,
} from "./types"
import {
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

export function useCompanyDirectory(query: CompanyDirectoryQuery): {
  data?: CompanyDirectoryResponse
  isLoading: boolean
  isError: boolean
} {
  const { data, isLoading, isError } = useQuery({
    queryKey: companiesKeys.directory(query),
    queryFn: () => getCompanyDirectory(query),
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
): { data?: CompanyDetail; isLoading: boolean; isError: boolean } {
  const { data, isLoading, isError } = useQuery({
    queryKey: companiesKeys.detail(id),
    queryFn: () => getCompanyDetail(id),
    enabled: enabled && Boolean(id),
  })

  return { data, isLoading, isError }
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
