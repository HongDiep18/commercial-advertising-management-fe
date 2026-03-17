"use client"

import Image from "next/image"
import { Calendar, ChevronRight } from "lucide-react"
import { useTranslation } from "react-i18next"
import type { NewsItem } from "@/api/news"
import {
  formatNewsDate,
  getTitleByLang,
  getSummaryByLang,
  getCategoryNameByLang,
  getLabelByLang,
} from "@/utils/newsHelpers"
import { Pagination } from "./Pagination"

export function NewsCard({ item, lang }: { item: NewsItem; lang: string }) {
  const { t } = useTranslation()
  const title = getTitleByLang(item, lang)
  const excerpt = getSummaryByLang(item, lang)
  const categoryTag = getCategoryNameByLang(item, lang)
  const sub = item.subcategory

  const href = item.url || "#"

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${title} (opens in new tab)`}
      className="group border-border bg-card block overflow-hidden rounded-lg border transition-shadow hover:shadow-lg"
    >
      <div className="bg-muted relative aspect-[16/9] overflow-hidden">
        <Image
          src={
            item.thumbnailUrl
              ? `/api/image-proxy?url=${encodeURIComponent(item.thumbnailUrl)}&w=800&q=75`
              : "/placeholder.svg"
          }
          alt={title}
          fill
          unoptimized
          className="object-cover transition-transform duration-300 group-hover:scale-105"
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
          <span>{formatNewsDate(item.publishedAt, lang)}</span>
          <span className="mx-1">|</span>
          <span>{item.sourceSite}</span>
        </div>

        <h3 className="text-foreground group-hover:text-primary mb-2 line-clamp-2 font-bold transition-colors">
          {title}
        </h3>

        <p className="text-muted-foreground mb-3 line-clamp-3 text-sm">{excerpt}</p>

        <div className="flex flex-wrap gap-1.5">
          {sub && (
            <span
              className="bg-body-bg-dark-foreground text-muted-foreground rounded px-2 py-0.5 text-xs"
            >
              {getLabelByLang(sub, lang)}
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

export interface NewsCardListProps {
  items: NewsItem[]
  lang: string
  totalPages: number
  currentPage: number
  onPageChange: (page: number) => void
}

export function NewsCardList({
  items,
  lang,
  totalPages,
  currentPage,
  onPageChange,
}: NewsCardListProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <NewsCard key={item.id} item={item} lang={lang} />
        ))}
      </div>

      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={onPageChange}
        scrollOnChange={true}
      />
    </>
  )
}
