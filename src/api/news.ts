import { api } from "@/lib/api"
import type { NewsListParams, NewsListResponse } from "@/types/news"

export type {
  NewsItem,
  NewsCategory,
  NewsSubcategory,
  NewsListParams,
  NewsListResponse,
} from "@/types/news"

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
  const path = `/news?${search.toString()}`
  const res = await api.request<NewsListResponse>(path, { method: "GET" })
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
