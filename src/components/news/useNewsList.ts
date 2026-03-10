"use client"

import { useState, useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { getNewsList, type NewsItem } from "@/api/news"

const PAGE_SIZE = 6

export type CategoryOption = {
  slug: string
  nameVi: string
  nameZhTw: string
  nameEn: string
}

export function useNewsList() {
  const { t } = useTranslation()
  const [news, setNews] = useState<NewsItem[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategorySlugs, setSelectedCategorySlugs] = useState<string[]>([])
  const [selectedSubcategorySlugs, setSelectedSubcategorySlugs] = useState<string[]>([])
  const [showSubcategoryFilter, setShowSubcategoryFilter] = useState(false)

  const categorySlug = selectedCategorySlugs[0]
  const subcategorySlug = selectedSubcategorySlugs[0]

  useEffect(() => {
    let cancelled = false
    const tid = requestAnimationFrame(() => {
      if (!cancelled) {
        setLoading(true)
        setError(null)
      }
    })
    getNewsList(currentPage, PAGE_SIZE, {
      categorySlug: categorySlug || undefined,
      subcategorySlug: subcategorySlug || undefined,
    })
      .then((res) => {
        if (cancelled) return
        setNews(res.data ?? [])
        setTotal(res.total ?? 0)
        setTotalPages(res.totalPages ?? 1)
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || t("news.errorLoad") || "無法載入最新消息")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
      cancelAnimationFrame(tid)
    }
  }, [currentPage, categorySlug, subcategorySlug, t])

  const categoryList = useMemo(() => {
    const bySlug = new Map<string, CategoryOption>()
    news.forEach((item) => {
      const cat = item.category
      if (cat?.slug && !bySlug.has(cat.slug)) {
        bySlug.set(cat.slug, {
          slug: cat.slug,
          nameVi: cat.nameVi ?? "",
          nameZhTw: cat.nameZhTw ?? "",
          nameEn: cat.nameEn ?? "",
        })
      }
    })
    return Array.from(bySlug.values())
  }, [news])

  const subcategoryList = useMemo((): CategoryOption[] => {
    const bySlug = new Map<string, CategoryOption>()
    news.forEach((item) => {
      const sub = item.subcategory
      if (sub?.slug && !bySlug.has(sub.slug)) {
        bySlug.set(sub.slug, {
          slug: sub.slug,
          nameVi: sub.nameVi ?? "",
          nameZhTw: sub.nameZhTw ?? "",
          nameEn: sub.nameEn ?? "",
        })
      }
    })
    return Array.from(bySlug.values())
  }, [news])

  const safePage = Math.min(Math.max(1, currentPage), totalPages)

  const setPage = (page: number) => setCurrentPage(page)

  const toggleSubcategory = (slug: string) => {
    setSelectedSubcategorySlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    )
    setCurrentPage(1)
  }

  const setSelectedCategorySlugsAndResetPage = (slugs: string[]) => {
    setSelectedCategorySlugs(slugs)
    setCurrentPage(1)
  }

  return {
    news,
    total,
    totalPages,
    currentPage: safePage,
    setPage,
    loading,
    error,
    categoryList,
    subcategoryList,
    selectedCategorySlugs,
    selectedSubcategorySlugs,
    showSubcategoryFilter,
    setSelectedCategorySlugs: setSelectedCategorySlugsAndResetPage,
    setShowSubcategoryFilter,
    toggleSubcategory,
    clearSubcategories: () => {
      setSelectedSubcategorySlugs([])
      setCurrentPage(1)
    },
  }
}
