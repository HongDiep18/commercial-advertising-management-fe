"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useTranslation } from "react-i18next"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { getNewsList, getNewsCategories, type NewsItem, type NewsCategory } from "@/api/news"

const PAGE_SIZE = 6

export type CategoryOption = {
  id: string
  slug: string
  nameVi: string
  nameZhTw: string
  nameEn: string
}

export type NewsListInitialData = {
  news: NewsItem[]
  categories: NewsCategory[]
  total: number
  totalPages: number
}

export function useNewsList(initialData?: NewsListInitialData) {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Derive filter state from URL — stable string primitives as effect deps
  const pageParam = Math.max(1, Number(searchParams.get("page") ?? "1") || 1)
  const categoryParam = searchParams.get("category") ?? ""
  const subcategoryParam = searchParams.get("subcategory") ?? ""

  const selectedCategorySlugs = useMemo(
    () => categoryParam.split(",").filter(Boolean),
    [categoryParam]
  )
  const selectedSubcategoryIds = useMemo(
    () => subcategoryParam.split(",").filter(Boolean),
    [subcategoryParam]
  )

  const [news, setNews] = useState<NewsItem[]>(initialData?.news ?? [])
  const [categories, setCategories] = useState<NewsCategory[]>(initialData?.categories ?? [])
  const [total, setTotal] = useState(initialData?.total ?? 0)
  const [totalPages, setTotalPages] = useState(initialData?.totalPages ?? 1)
  const [loading, setLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)
  const [showSubcategoryFilter, setShowSubcategoryFilter] = useState(false)

  // Stores the params the SSR initial data was fetched for.
  // While current params still match, skip the fetch entirely — including on
  // StrictMode's second mount. Cleared when params change away from initial values.
  const ssrParams = useRef(
    initialData ? { page: pageParam, category: categoryParam, subcategory: subcategoryParam } : null
  )

  const errorFallback = t("news.errorLoad") || "無法載入最新消息"

  const updateUrl = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) params.delete(key)
      else params.set(key, value)
    })
    if (params.get("page") === "1") params.delete("page")
    const query = params.toString()
    router.push(`${pathname}${query ? `?${query}` : ""}`)
  }

  useEffect(() => {
    if (initialData?.categories?.length) return
    getNewsCategories().then((res) => setCategories(Array.isArray(res) ? res : [])).catch(() => setCategories([]))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const controller = new AbortController()

    if (
      ssrParams.current &&
      ssrParams.current.page === pageParam &&
      ssrParams.current.category === categoryParam &&
      ssrParams.current.subcategory === subcategoryParam
    ) {
      // Params still match SSR data — skip fetch entirely (safe across StrictMode remounts)
      return () => controller.abort()
    }
    ssrParams.current = null

    setLoading(true)
    setError(null)
    getNewsList(
      pageParam,
      PAGE_SIZE,
      {
        categorySlug: categoryParam || undefined,
        subcategoryId: subcategoryParam || undefined,
      },
      controller.signal
    )
      .then((res) => {
        const resolvedTotalPages = res.totalPages ?? 1
        setNews(res.data ?? [])
        setTotal(res.total ?? 0)
        setTotalPages(resolvedTotalPages)
        if (pageParam > resolvedTotalPages) {
          const params = new URLSearchParams(searchParams.toString())
          params.set("page", String(resolvedTotalPages))
          if (params.get("page") === "1") params.delete("page")
          const query = params.toString()
          router.replace(`${pathname}${query ? `?${query}` : ""}`)
        }
      })
      .catch((err) => {
        if (err?.name !== "AbortError") setError(err?.message || errorFallback)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [pageParam, categoryParam, subcategoryParam])

  const categoryList = useMemo((): CategoryOption[] => {
    return categories.map((cat) => ({
      id: cat.id,
      slug: cat.slug,
      nameVi: cat.nameVi ?? "",
      nameZhTw: cat.nameZhTw ?? "",
      nameEn: cat.nameEn ?? "",
    }))
  }, [categories])

  const subcategoryList = useMemo((): CategoryOption[] => {
    const selectedCats =
      selectedCategorySlugs.length > 0
        ? categories.filter((cat) => selectedCategorySlugs.includes(cat.slug))
        : categories
    return selectedCats.flatMap((cat) =>
      (cat.subcategories ?? []).map((sub) => ({
        id: sub.id,
        slug: sub.slug,
        nameVi: sub.nameVi ?? "",
        nameZhTw: sub.nameZhTw ?? "",
        nameEn: sub.nameEn ?? "",
      }))
    )
  }, [categories, selectedCategorySlugs])

  const safePage = Math.min(Math.max(1, pageParam), totalPages)

  return {
    news,
    total,
    totalPages,
    currentPage: safePage,
    setPage: (page: number) => updateUrl({ page: String(page) }),
    loading,
    error,
    categoryList,
    subcategoryList,
    selectedCategorySlugs,
    selectedSubcategoryIds,
    showSubcategoryFilter,
    setShowSubcategoryFilter,
    setSelectedCategorySlugs: (slugs: string[]) =>
      updateUrl({ category: slugs.join(",") || null, subcategory: null, page: null }),
    toggleSubcategory: (id: string) => {
      const next = selectedSubcategoryIds.includes(id)
        ? selectedSubcategoryIds.filter((s) => s !== id)
        : [...selectedSubcategoryIds, id]
      updateUrl({ subcategory: next.join(",") || null, page: null })
    },
    clearSubcategories: () => updateUrl({ subcategory: null, page: null }),
  }
}
