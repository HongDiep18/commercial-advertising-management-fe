import type { NewsItem } from "@/api/news"

export function formatNewsDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  } catch {
    return iso
  }
}

export function getTitleByLang(item: NewsItem, lang: string): string {
  if (lang === "zh-TW" && item.titleZhTw) return item.titleZhTw
  if (lang === "en-US" && item.titleEn) return item.titleEn
  if (lang === "vi-VN" && item.title) return item.title
  return item.titleZhTw || item.titleEn || item.title || ""
}

export function getSummaryByLang(item: NewsItem, lang: string): string {
  if (lang === "zh-TW" && item.summaryZhTw) return item.summaryZhTw
  if (lang === "en-US" && item.summaryEn) return item.summaryEn
  if (lang === "vi-VN" && item.summaryVi) return item.summaryVi
  return item.summaryZhTw || item.summaryEn || item.summaryVi || ""
}

export function getCategoryNameByLang(item: NewsItem, lang: string): string {
  const cat = item.category
  if (!cat) return ""
  if (lang === "zh-TW") return cat.nameZhTw || cat.slug
  if (lang === "en-US") return cat.nameEn || cat.slug
  return cat.nameVi || cat.slug
}

export type NewsLabelItem = {
  slug: string
  nameVi: string
  nameZhTw: string
  nameEn: string
}

export function getLabelByLang(item: NewsLabelItem, lang: string): string {
  if (!item) return ""
  if (lang === "zh-TW") return item.nameZhTw || item.slug
  if (lang === "en-US") return item.nameEn || item.slug
  return item.nameVi || item.slug
}
