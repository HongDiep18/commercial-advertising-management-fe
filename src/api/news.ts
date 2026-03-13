import { api } from "@/lib/api"
import type { NewsCategory, NewsListParams, NewsListResponse } from "@/types/news"

export type {
  NewsItem,
  NewsCategory,
  NewsSubcategory,
  NewsListParams,
  NewsListResponse,
} from "@/types/news"

const DEFAULT_LIMIT = 6

export async function getNewsCategories(): Promise<NewsCategory[]> {
  return api.request<NewsCategory[]>("/news/categories", { method: "GET" })
}

export async function getNewsList(
  page = 1,
  limit = DEFAULT_LIMIT,
  params?: Pick<NewsListParams, "categorySlug" | "subcategoryId">,
  signal?: AbortSignal
): Promise<NewsListResponse> {
  const search = new URLSearchParams()
  search.set("page", String(page))
  search.set("limit", String(limit))
  if (params?.categorySlug) search.set("categorySlug", params.categorySlug)
  if (params?.subcategoryId) search.set("subcategoryId", params.subcategoryId)
  const path = `/news?${search.toString()}`
  const res = await api.request<NewsListResponse>(path, { method: "GET", signal })
  const total = res.total ?? res.meta?.total ?? res.totalCount ?? undefined
  const limitRes = res.limit ?? res.meta?.limit ?? limit
  const totalPages =
    res.meta?.totalPages ??
    res.totalPages ??
    (total != null && limitRes ? Math.ceil(total / limitRes) : 1)
  return {
    data: res.data ?? [],
    total,
    page: res.page ?? res.meta?.page ?? page,
    limit: limitRes,
    totalPages,
  }
}
