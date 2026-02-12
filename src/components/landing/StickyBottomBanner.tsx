'use client'

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

  // Check if banner was closed today
  useEffect(() => {
    const hiddenDate = localStorage.getItem(STORAGE_KEY)
    const today = new Date().toDateString()

    if (hiddenDate !== today) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  // Auto-carousel
  useEffect(() => {
    if (!isPaused && isExpanded && isVisible) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % bannerItems.length)
      }, 7000) // 7 seconds
      return () => clearInterval(interval)
    }
  }, [isPaused, isExpanded, isVisible, bannerItems.length])

  const handleToggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev)
  }, [])

  if (!isVisible) return null

  const currentItem = bannerItems[currentIndex]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-4">
      {/* Collapsed State */}
      {!isExpanded && (
        <button
          onClick={handleToggleExpand}
          className="group flex items-center gap-2 rounded-full bg-primary px-6 py-2 text-primary-foreground shadow-lg transition-all duration-300 hover:bg-primary/90"
        >
          <span className="text-sm font-medium">{t("stickyBanner.expandText")}</span>
          <ChevronUp className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
        </button>
      )}

      {/* Expanded State */}
      {isExpanded && (
        <div
          className="w-full max-w-4xl overflow-hidden rounded-lg border border-border bg-card shadow-2xl animate-in slide-in-from-bottom-4 duration-300"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Collapse Button */}
          <button
            onClick={handleToggleExpand}
            className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-card p-1.5 shadow-md transition-colors hover:bg-secondary"
            aria-label={t("stickyBanner.collapseLabel")}
          >
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* Content */}
          <div className="relative p-4 pt-6">
            <div className="flex items-center gap-4">
              {/* Image/Icon */}
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
                  <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-primary/10">
                    {currentItem.type === "company" ? (
                      <Building2 className="w-8 h-8 text-primary" />
                    ) : (
                      <Newspaper className="w-8 h-8 text-primary" />
                    )}
                  </div>
                )}
              </div>

              {/* Text Content */}
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="inline-flex items-center rounded bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                    {currentItem.tag}
                  </span>
                </div>
                <h3 className="truncate text-lg font-semibold text-foreground">
                  {currentItem.title}
                </h3>
                <p className="truncate text-sm text-muted-foreground">{currentItem.subtitle}</p>
              </div>

              {/* CTA Button */}
              <div className="flex-shrink-0 ">
                <Button asChild size="sm" variant="primary" className="gap-1 text-white hover:bg-header-red-light/100">
                  <a href={currentItem.link}>
                    {t("stickyBanner.viewDetails")}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </Button>
              </div>
            </div>

            {/* Progress Indicators */}
            <div className="mt-4 flex items-center justify-center gap-1.5">
              {bannerItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 bg- ${index === currentIndex
                    ? "w-6 bg-header-red-dark"
                    : "w-1.5 bg-border hover:bg-muted-foreground"
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
