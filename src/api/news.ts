import { api } from "@/lib/api"

export interface NewsCategory {
  id: string
  slug: string
  nameVi: string
  nameZhTw: string
  nameEn: string
}

export interface NewsSubcategory {
  id: string
  slug: string
  nameVi: string
  nameZhTw: string
  nameEn: string
  categoryId: string
}

export interface NewsItem {
  id: string
  sourceSite: string
  url: string
  guid: string
  title: string
  titleZhTw: string
  titleEn: string
  publishedAt: string
  thumbnailUrl: string
  status: string
  category: NewsCategory
  subcategory: NewsSubcategory
  summaryVi: string
  summaryZhTw: string
  summaryEn: string
}

export interface NewsListResponse {
  data: NewsItem[]
  total?: number
  page?: number
  limit?: number
  meta?: { total?: number; page?: number; limit?: number }
  totalCount?: number
}

const DEFAULT_LIMIT = 6

export interface NewsListParams {
  page?: number
  limit?: number
  categorySlug?: string
  subcategorySlug?: string
}

export async function getNewsList(
  page = 1,
  limit = DEFAULT_LIMIT,
  params?: Pick<NewsListParams, "categorySlug" | "subcategorySlug">
): Promise<NewsListResponse> {
  const search = new URLSearchParams()
  search.set("page", String(page))
  search.set("limit", String(limit))
  if (params?.categorySlug) search.set("categorySlug", params.categorySlug)
  if (params?.subcategorySlug) search.set("subcategorySlug", params.subcategorySlug)
  const path = `/api/v1/news?${search.toString()}`
  const res = await api.request<NewsListResponse>(path, { method: "GET" })
  const total = res.total ?? res.meta?.total ?? res.totalCount ?? undefined
  return {
    data: res.data ?? [],
    total,
    page: res.page ?? res.meta?.page ?? page,
    limit: res.limit ?? res.meta?.limit ?? limit,
  }
}
