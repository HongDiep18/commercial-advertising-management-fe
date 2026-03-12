import { useQuery } from "@tanstack/react-query"
import type {
  CompanyCategoriesResponse,
  CompanyDirectoryQuery,
  CompanyDirectoryResponse,
} from "./types"
import { getCompanyCategories, getCompanyDirectory } from "./service"

const companiesKeys = {
  all: ["companies"] as const,
  directory: (query: CompanyDirectoryQuery) => [...companiesKeys.all, "directory", query] as const,
  categories: () => [...companiesKeys.all, "categories"] as const,
}

export function useCompanyDirectory(
  query: CompanyDirectoryQuery
): {
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

export function useCompanyCategories(): {
  data?: CompanyCategoriesResponse
  isLoading: boolean
  isError: boolean
} {
  const { data, isLoading, isError } = useQuery({
    queryKey: companiesKeys.categories(),
    queryFn: () => getCompanyCategories(),
  })

  return { data, isLoading, isError }
}


