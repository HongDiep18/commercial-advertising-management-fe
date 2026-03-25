import { useMemo } from "react"
import { useCompanyCategories } from "@/api/companies/hooks"
import { categories as fallbackCategoryIds } from "./DirectorySidebar"

export type DirectoryCategoryRow = {
  id: string
  count: number
}

export type DirectoryCategoryMode = "guest" | "real" | "demo"

export function useDirectoryCategories(mode: DirectoryCategoryMode): {
  categories: DirectoryCategoryRow[]
  hasAllAccess: boolean
  isLoading: boolean
  isError: boolean
} {
  const useApi = mode !== "demo"
  const { data, isLoading, isError } = useCompanyCategories(useApi)

  const categories = useMemo<DirectoryCategoryRow[]>(() => {
    if (!useApi) {
      return fallbackCategoryIds.map((id) => ({ id, count: 0 }))
    }

    const api = data?.categories ?? []
    if (api.length === 0) {
      return []
    }

    const countsByIndustry = api.reduce<Record<string, number>>((acc, c) => {
      const id = String(c.industry ?? "").trim()
      if (!id) return acc
      acc[id] = (acc[id] ?? 0) + c.count
      return acc
    }, {})

    return api
      .map((c) => String(c.industry ?? "").trim())
      .filter((id) => id !== "")
      .filter((id, idx, arr) => arr.indexOf(id) === idx)
      .map((id) => ({ id, count: countsByIndustry[id] ?? 0 }))
  }, [data, useApi])

  const hasAllAccess = useMemo(() => {
    if (!useApi) return true // Demo mode shows all
    return data?.hasAllAccess ?? true // Default to true if API hasn't loaded
  }, [data, useApi])

  return { categories, hasAllAccess, isLoading, isError }
}
