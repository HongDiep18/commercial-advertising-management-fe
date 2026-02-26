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
}

const DEFAULT_LIMIT = 6

export async function getNewsList(page = 1, limit = DEFAULT_LIMIT): Promise<NewsListResponse> {
  const path = `/api/v1/news?page=${page}&limit=${limit}`
  const res = await api.request<NewsListResponse>(path, { method: "GET" })
  return {
    data: res.data ?? [],
    total: res.total,
    page: res.page ?? page,
    limit: res.limit ?? limit,
  }
}
