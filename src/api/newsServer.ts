import type { NewsCategory, NewsListResponse } from "@/types/news"

const backendBase = () =>
  (process.env.API_BASE_URL ?? "").replace(/\/$/, "") +
  (process.env.API_BASE_PATH ?? "/api/v1")

export async function getServerNewsList(
  page = 1,
  limit = 6,
  params?: { categorySlug?: string; subcategoryId?: string }
): Promise<NewsListResponse> {
  try {
    const search = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (params?.categorySlug) search.set("categorySlug", params.categorySlug)
    if (params?.subcategoryId) search.set("subcategoryId", params.subcategoryId)
    const url = `${backendBase()}/news?${search.toString()}`
    const res = await fetch(url, { next: { revalidate: 60 } })
    if (!res.ok) return { data: [], total: 0, page: 1, limit, totalPages: 1 }
    const json = await res.json()
    const total = json.total ?? json.meta?.total ?? json.totalCount ?? 0
    const limitRes = json.limit ?? json.meta?.limit ?? limit
    const totalPages =
      json.meta?.totalPages ?? json.totalPages ?? (total ? Math.ceil(total / limitRes) : 1)
    return {
      data: json.data ?? [],
      total,
      page: json.page ?? json.meta?.page ?? page,
      limit: limitRes,
      totalPages,
    }
  } catch {
    return { data: [], total: 0, page: 1, limit, totalPages: 1 }
  }
}

export async function getServerNewsCategories(): Promise<NewsCategory[]> {
  try {
    const url = `${backendBase()}/news/categories`
    const res = await fetch(url, { next: { revalidate: 300 } })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}
