import type { NewsItem } from "@/api/news"

const localeMap: Record<string, string> = {
  "zh-TW": "zh-TW",
  "en-US": "en-US",
  "vi-VN": "vi-VN",
}

export function formatNewsDate(iso: string, lang = "vi-VN"): string {
  try {
    return new Date(iso).toLocaleDateString(localeMap[lang] ?? "vi-VN", {
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
  return item.title || item.titleZhTw || item.titleEn || ""
}

export function getSummaryByLang(item: NewsItem, lang: string): string {
  if (lang === "zh-TW" && item.summaryZhTw) return item.summaryZhTw
  if (lang === "en-US" && item.summaryEn) return item.summaryEn
  if (lang === "vi-VN" && item.summaryVi) return item.summaryVi
  return item.summaryVi || item.summaryZhTw || item.summaryEn || ""
}

function getNameByLang(obj: Record<string, unknown> | null | undefined, lang: string): string {
  if (!obj || typeof obj !== "object") return ""
  const slug = (obj.slug as string) ?? ""
  if (lang === "zh-TW") {
    return (obj.nameZhTw as string) ?? (obj.name_zh_tw as string) ?? slug
  }
  if (lang === "en-US") {
    return (obj.nameEn as string) ?? (obj.name_en as string) ?? slug
  }
  return (obj.nameVi as string) ?? (obj.name_vi as string) ?? slug
}

export function getCategoryNameByLang(item: NewsItem, lang: string): string {
  const cat = item.category as Record<string, unknown> | null | undefined
  if (!cat) return ""
  return getNameByLang(cat, lang) || (cat.slug as string) || ""
}

export type NewsLabelItem = {
  slug: string
  nameVi?: string
  nameZhTw?: string
  nameEn?: string
  name_vi?: string
  name_zh_tw?: string
  name_en?: string
}

export function getLabelByLang(
  item: NewsLabelItem | Record<string, unknown> | null | undefined,
  lang: string
): string {
  if (!item || typeof item !== "object") return ""
  const slug = (item as { slug?: string }).slug ?? ""
  return getNameByLang(item as Record<string, unknown>, lang) || slug
}
