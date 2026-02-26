"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { ChevronDown, ChevronUp, Building2, Newspaper, ArrowRight } from "lucide-react"
import { useTranslation } from "react-i18next"
import Button from "../ui/Button"

interface BannerItem {
  id: number
  type: "company" | "news"
  title: string
  subtitle: string
  image?: string
  link: string
  tag: string
}

const bannerConfig = [
  {
    id: 1,
    type: "company" as const,
    image: "/assets/images/sticky-bottom/modern-manufacturing-facility.png",
    link: "/directory",
    tagKey: "featuredCompany",
    titleKey: "1",
  },
  {
    id: 2,
    type: "news" as const,
    link: "/about",
    tagKey: "latestNews",
    titleKey: "2",
  },
  {
    id: 3,
    type: "company" as const,
    image: "/assets/images/sticky-bottom/solar-panels-green-energy.jpg",
    link: "/directory",
    tagKey: "featuredCompany",
    titleKey: "3",
  },
  {
    id: 4,
    type: "news" as const,
    link: "/about",
    tagKey: "eventAnnouncement",
    titleKey: "4",
  },
]

const STORAGE_KEY = "sticky-banner-hidden-date"

export default function StickyBottomBanner() {
  const { t } = useTranslation()
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const bannerItems = useMemo<BannerItem[]>(() => {
    return bannerConfig.map((config) => ({
      id: config.id,
      type: config.type,
      title: t(`stickyBanner.items.${config.titleKey}.title`),
      subtitle: t(`stickyBanner.items.${config.titleKey}.subtitle`),
      image: config.image,
      link: config.link,
      tag: t(`stickyBanner.tags.${config.tagKey}`),
    }))
  }, [t])

  useEffect(() => {
    const hiddenDate = localStorage.getItem(STORAGE_KEY)
    const today = new Date().toDateString()

    if (hiddenDate !== today) {
      const timer = setTimeout(() => setIsVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (!isPaused && isExpanded && isVisible) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % bannerItems.length)
      }, 7000)
      return () => clearInterval(interval)
    }
  }, [isPaused, isExpanded, isVisible, bannerItems.length])

  const handleToggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev)
  }, [])

  if (!isVisible) return null

  const currentItem = bannerItems[currentIndex]

  return (
    <div className="fixed right-0 bottom-0 left-0 z-50 flex justify-center px-4 pb-4">
      {!isExpanded && (
        <button
          onClick={handleToggleExpand}
          className="group bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-full px-6 py-2 shadow-lg transition-all duration-300"
        >
          <span className="text-sm font-medium">{t("stickyBanner.expandText")}</span>
          <ChevronUp className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
        </button>
      )}

      {isExpanded && (
        <div
          className="border-border bg-card animate-in slide-in-from-bottom-4 w-full max-w-4xl overflow-hidden rounded-lg border shadow-2xl duration-300"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <button
            onClick={handleToggleExpand}
            className="border-border bg-card hover:bg-secondary absolute top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border p-1.5 shadow-md transition-colors"
            aria-label={t("stickyBanner.collapseLabel")}
          >
            <ChevronDown className="text-muted-foreground h-4 w-4" />
          </button>

          <div className="relative p-4 pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {currentItem.image ? (
                  <div className="relative h-20 w-20 overflow-hidden rounded-lg">
                    <img
                      src={currentItem.image || "/placeholder.svg"}
                      alt={currentItem.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="bg-primary/10 flex h-20 w-20 items-center justify-center rounded-lg">
                    {currentItem.type === "company" ? (
                      <Building2 className="text-primary h-8 w-8" />
                    ) : (
                      <Newspaper className="text-primary h-8 w-8" />
                    )}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground inline-flex items-center rounded px-2 py-0.5 text-xs font-medium">
                    {currentItem.tag}
                  </span>
                </div>
                <h3 className="text-foreground truncate text-lg font-semibold">
                  {currentItem.title}
                </h3>
                <p className="text-muted-foreground truncate text-sm">{currentItem.subtitle}</p>
              </div>

              <div className="flex-shrink-0">
                <Button
                  asChild
                  size="sm"
                  variant="primary"
                  className="hover:bg-header-red-light/100 gap-1 text-white"
                >
                  <a href={currentItem.link}>
                    {t("stickyBanner.viewDetails")}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-1.5">
              {bannerItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`bg- h-1.5 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-header-red-dark w-6"
                      : "bg-border hover:bg-muted-foreground w-1.5"
                  }`}
                  aria-label={t("stickyBanner.goToItem", { index: index + 1 })}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
