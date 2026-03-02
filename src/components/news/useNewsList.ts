"use client"

import { useState, useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { getNewsList, type NewsItem } from "@/api/news"

const NEWS_PAGE_SIZE = 6
const DEFAULT_LIMIT = 100

export type CategoryOption = {
  slug: string
  nameVi: string
  nameZhTw: string
  nameEn: string
}

export function useNewsList() {
  const { t } = useTranslation()
  const [news, setNews] = useState<NewsItem[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategorySlugs, setSelectedCategorySlugs] = useState<string[]>([])
  const [selectedSubcategorySlugs, setSelectedSubcategorySlugs] = useState<string[]>([])
  const [showSubcategoryFilter, setShowSubcategoryFilter] = useState(false)

  useEffect(() => {
    let cancelled = false
    const rafId = requestAnimationFrame(() => {
      setLoading(true)
      setError(null)
    })
    getNewsList(1, DEFAULT_LIMIT)
      .then((res) => {
        if (cancelled) return
        setNews(res.data ?? [])
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || t("news.errorLoad") || "無法載入最新消息")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
      cancelAnimationFrame(rafId)
    }
  }, [t])

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
    if (selectedCategorySlugs.length > 0) {
      list = list.filter(
        (item) => item.category?.slug && selectedCategorySlugs.includes(item.category.slug)
      )
    }
    if (selectedSubcategorySlugs.length > 0) {
      list = list.filter(
        (item) => item.subcategory?.slug && selectedSubcategorySlugs.includes(item.subcategory.slug)
      )
    }
    return list
  }, [news, selectedCategorySlugs, selectedSubcategorySlugs])

  const totalPages = Math.max(1, Math.ceil(filteredNews.length / NEWS_PAGE_SIZE))
  const safePage = Math.min(Math.max(1, currentPage), totalPages)

  const pagedNews = useMemo(() => {
    const start = (safePage - 1) * NEWS_PAGE_SIZE
    return filteredNews.slice(start, start + NEWS_PAGE_SIZE)
  }, [filteredNews, safePage])

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
    news: pagedNews,
    total: filteredNews.length,
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
