export type NewsCategory = {
  id: string
  slug: string
  nameVi: string
  nameZhTw: string
  nameEn: string
  subcategories?: NewsSubcategory[]
}

export type NewsSubcategory = {
  id: string
  slug: string
  nameVi: string
  nameZhTw: string
  nameEn: string
}

export type NewsItem = {
  id: string
  sourceSite: string
  url: string
  title: string
  titleZhTw: string | null
  titleEn: string | null
  publishedAt: string
  thumbnailUrl: string
  status: "DRAFT" | "PUBLISHED"
  category: NewsCategory | null
  subcategory: NewsSubcategory | null
  summaryVi: string | null
  summaryZhTw: string | null
  summaryEn: string | null
}

export type NewsListResponse = {
  data: NewsItem[]
  total?: number
  page?: number
  limit?: number
  totalPages?: number
  meta?: { total?: number; page?: number; limit?: number; totalPages?: number }
  totalCount?: number
}

export type NewsListParams = {
  page?: number
  limit?: number
  categorySlug?: string
  subcategoryId?: string
}
