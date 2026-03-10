export type NewsCategory = {
  id: string
  slug: string
  nameVi: string
  nameZhTw: string
  nameEn: string
}

export type NewsSubcategory = {
  id: string
  slug: string
  nameVi: string
  nameZhTw: string
  nameEn: string
  categoryId: string
}

export type NewsItem = {
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
  subcategorySlug?: string
}
