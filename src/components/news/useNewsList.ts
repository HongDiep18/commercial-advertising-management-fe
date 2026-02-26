"use client"

import { useState, useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { getNewsList, type NewsItem } from "@/api/news"

const NEWS_PAGE_LIMIT = 6

export type CategoryOption = {
  slug: string
  nameVi: string
  nameZhTw: string
  nameEn: string
}

export function useNewsList() {
  const { t } = useTranslation()
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null)
  const [selectedSubcategorySlugs, setSelectedSubcategorySlugs] = useState<string[]>([])
  const [showSubcategoryFilter, setShowSubcategoryFilter] = useState(false)

  useEffect(() => {
    let cancelled = false
    const tid = setTimeout(() => {
      setLoading(true)
      if (page === 1) setError(null)
    }, 0)
    getNewsList(page, NEWS_PAGE_LIMIT)
      .then((res) => {
        if (cancelled) return
        setNews((prev) => (page === 1 ? res.data : [...prev, ...res.data]))
      })
      .catch((err) => {
        if (!cancelled)
          setError(err?.message || t("news.errorLoad") || "無法載入最新消息")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
      clearTimeout(tid)
    }
  }, [page, t])

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

  const filteredNews = useMemo(() => {
    let list = news
    if (selectedCategorySlug) {
      list = list.filter((item) => item.category?.slug === selectedCategorySlug)
    }
    if (selectedSubcategorySlugs.length > 0) {
      list = list.filter(
        (item) =>
          item.subcategory?.slug &&
          selectedSubcategorySlugs.includes(item.subcategory.slug)
      )
    }
    return list
  }, [news, selectedCategorySlug, selectedSubcategorySlugs])

  const toggleSubcategory = (slug: string) => {
    setSelectedSubcategorySlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    )
  }

  return {
    news: filteredNews,
    loading,
    error,
    categoryList,
    subcategoryList,
    selectedCategorySlug,
    selectedSubcategorySlugs,
    showSubcategoryFilter,
    setSelectedCategorySlug,
    setShowSubcategoryFilter,
    toggleSubcategory,
    loadMore: () => setPage((p) => p + 1),
    clearSubcategories: () => setSelectedSubcategorySlugs([]),
  }
}
