"use client"

import { usePopupRotationalCompanies } from "@/api/active-ads/hooks"
import type { PopupCompanyItem } from "@/api/active-ads/types"
import { getFirstActiveAdAssetImageUrl } from "@/lib/ad-assets"
import { ArrowRight, Building2, ChevronDown, ChevronUp } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import Button from "../ui/Button"

interface BannerItem {
  id: string
  type: "company"
  title: string
  subtitle: string
  image?: string
  link: string
  tag: string
  showDetailsButton: boolean
}

const STORAGE_KEY = "sticky-banner-hidden-date"

type Props = {
  overrideData?: PopupCompanyItem[]
  forceVisible?: boolean
}

export default function StickyBottomBanner({ overrideData, forceVisible }: Props = {}) {
  const { t } = useTranslation()
  const { data: popupCompanies } = usePopupRotationalCompanies()
  const [isVisible, setIsVisible] = useState(forceVisible ?? false)
  const [isExpanded, setIsExpanded] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const bannerItems = useMemo<BannerItem[]>(() => {
    const companies = (overrideData ?? popupCompanies ?? []).slice(0, 4)
    return companies.map((company) => ({
      id: company.id,
      type: "company",
      title: company.name,
      subtitle: company.description,
      image: getFirstActiveAdAssetImageUrl(company, company.logoUrl || "/placeholder.svg"),
      link: company.adLinkUrl || `/directory/${company.id}`,
      tag: "",
      showDetailsButton: Boolean(company.showDetailsButton),
    }))
  }, [popupCompanies])

  useEffect(() => {
    if (forceVisible) return
    const hiddenDate = localStorage.getItem(STORAGE_KEY)
    const today = new Date().toDateString()

    if (hiddenDate !== today) {
      const timer = setTimeout(() => setIsVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [forceVisible])

  useEffect(() => {
    if (!isPaused && isExpanded && isVisible) {
      if (bannerItems.length === 0) return
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % bannerItems.length)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [isPaused, isExpanded, isVisible, bannerItems.length])

  const handleToggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev)
  }, [])

  if (!isVisible || bannerItems.length === 0) return null

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

          <div className="relative p-5 pt-7">
            <div className="flex items-center gap-4">
              <div className="shrink-0">
                {currentItem.image ? (
                  <div className="relative h-28 w-40 overflow-hidden rounded-lg">
                    <img
                      src={currentItem.image || "/placeholder.svg"}
                      alt={currentItem.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="bg-primary/10 flex h-28 w-40 items-center justify-center rounded-lg">
                    <Building2 className="text-primary h-11 w-11" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-foreground truncate text-xl font-semibold">
                  {currentItem.title}
                </h3>
                <p className="text-muted-foreground truncate text-base">{currentItem.subtitle}</p>
              </div>

              {currentItem.showDetailsButton ? (
                <div className="shrink-0">
                  <Button
                    asChild
                    size="sm"
                    variant="primary"
                    className="hover:bg-header-red-light gap-1 text-base text-white"
                  >
                    <a href={currentItem.link}>
                      {t("stickyBanner.viewDetails")}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              ) : null}
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
