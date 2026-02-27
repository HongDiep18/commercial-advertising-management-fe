"use client"

import { useState } from "react"
import { Calendar, ChevronRight, ChevronLeft } from "lucide-react"
import { useTranslation } from "react-i18next"
import type { NewsItem } from "@/api/news"
import {
  formatNewsDate,
  getTitleByLang,
  getSummaryByLang,
  getCategoryNameByLang,
  getLabelByLang,
} from "@/utils/newsHelpers"
import Button from "@/components/ui/Button"

type SubLike = { id?: string; slug: string; nameVi: string; nameZhTw: string; nameEn: string }

function subList(item: NewsItem): SubLike[] {
  if (Array.isArray(item.subcategory)) return item.subcategory as SubLike[]
  if (item.subcategory) return [item.subcategory]
  return []
}

export function NewsCard({ item, lang }: { item: NewsItem; lang: string }) {
  const { t } = useTranslation()
  const title = getTitleByLang(item, lang)
  const excerpt = getSummaryByLang(item, lang)
  const categoryTag = getCategoryNameByLang(item, lang)
  const subs = subList(item)

  const href = item.url || item.guid || "#"

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group border-border bg-card block overflow-hidden rounded-lg border transition-shadow hover:shadow-lg"
    >
      <div className="bg-muted relative aspect-[16/9] overflow-hidden">
        <img
          src={item.thumbnailUrl || "/placeholder.svg"}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <span className="rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
            {categoryTag || item.category?.slug}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs">
          <Calendar className="h-3 w-3" />
          <span>{formatNewsDate(item.publishedAt)}</span>
          <span className="mx-1">|</span>
          <span>{item.sourceSite}</span>
        </div>

        <h3 className="text-foreground group-hover:text-primary mb-2 line-clamp-2 font-bold transition-colors">
          {title}
        </h3>

        <p className="text-muted-foreground mb-3 line-clamp-3 text-sm">{excerpt}</p>

        <div className="flex flex-wrap gap-1.5">
          {subs.slice(0, 3).map((sub) => (
            <span
              key={sub.id ?? sub.slug}
              className="bg-body-bg-dark-foreground text-muted-foreground rounded px-2 py-0.5 text-xs"
            >
              {getLabelByLang(sub, lang)}
            </span>
          ))}
          {subs.length > 3 && (
            <span className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs">
              +{subs.length - 3}
            </span>
          )}
        </div>

        <div className="text-primary mt-3 flex items-center text-sm group-hover:underline">
          {t("news.readMore")}
          <ChevronRight className="ml-1 h-4 w-4" />
        </div>
      </div>
    </a>
  )
}

const CARDS_PER_PAGE = 6

export interface NewsCardListProps {
  items: NewsItem[]
  lang: string
  filterKey?: string
}

export function NewsCardList({ items, lang, filterKey = "" }: NewsCardListProps) {
  const [pageState, setPageState] = useState<{ key: string; page: number }>({
    key: filterKey,
    page: 1,
  })

  if (pageState.key !== filterKey) {
    setPageState({ key: filterKey, page: 1 })
  }

  const currentPage = pageState.page
  const handlePageChange = (page: number) => {
    setPageState((prev) => ({ ...prev, page }))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const totalPages = Math.ceil(items.length / CARDS_PER_PAGE)
  const startIndex = (currentPage - 1) * CARDS_PER_PAGE
  const displayedItems = items.slice(startIndex, startIndex + CARDS_PER_PAGE)

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {displayedItems.map((item) => (
          <NewsCard key={item.id} item={item} lang={lang} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-end gap-2 border-t border-gray-300 pt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="bg-background h-9 w-9 border border-gray-500 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "primary" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  className={`h-9 w-9 p-0 ${currentPage === pageNum ? "bg-header-red-dark hover:bg-header-red-dark/100" : "bg-background hover:!bg-header-red-dark border border-gray-400 hover:!text-white"}`}
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-9 w-9 border border-gray-400 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <select
            value={currentPage}
            onChange={(e) => handlePageChange(Number(e.target.value))}
            className="bg-body-bg-dark focus:ring-primary/20 h-9 rounded-md border border-gray-400 px-2 text-sm focus:ring-2 focus:outline-none"
          >
            {Array.from({ length: totalPages }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>
      )}
    </>
  )
}
