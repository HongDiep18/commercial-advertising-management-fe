import { api } from "@/lib/api"
import type { NewsListParams, NewsListResponse } from "@/types/news"

export type { NewsItem, NewsCategory, NewsSubcategory, NewsListParams, NewsListResponse } from "@/types/news"

const DEFAULT_LIMIT = 6

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
