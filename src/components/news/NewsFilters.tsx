"use client"

import { Filter } from "lucide-react"
import { useTranslation } from "react-i18next"
import Button from "@/components/ui/Button"
import { getLabelByLang } from "@/utils/newsHelpers"
import type { CategoryOption } from "./useNewsList"

type Props = {
  categoryList: CategoryOption[]
  subcategoryList: CategoryOption[]
  selectedCategorySlug: string | null
  selectedSubcategorySlugs: string[]
  showSubcategoryFilter: boolean
  lang: string
  onCategoryChange: (slug: string | null) => void
  onSubcategoryToggle: (slug: string) => void
  onToggleFilterPanel: () => void
  onClearSubcategories: () => void
}

export function NewsFilters({
  categoryList,
  subcategoryList,
  selectedCategorySlug,
  selectedSubcategorySlugs,
  showSubcategoryFilter,
  lang,
  onCategoryChange,
  onSubcategoryToggle,
  onToggleFilterPanel,
  onClearSubcategories,
}: Props) {
  const { t } = useTranslation()

  return (
    <section className="bg-body-bg-dark border-border sticky top-14 z-40 border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <div className="bg-body-bg-dark-button flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => onCategoryChange(null)}
              className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategorySlug === null
                  ? "bg-primary text-primary-foreground"
                  : "text-black hover:opacity-80"
              }`}
              style={
                selectedCategorySlug !== null
                  ? { backgroundColor: "var(--color-body-bg-dark-button)" }
                  : undefined
              }
            >
              {t("news.categories.all", { defaultValue: "全部" })}
            </button>
            {categoryList.map((cat) => {
              const isSelected = selectedCategorySlug === cat.slug
              return (
                <button
                  key={cat.slug}
                  onClick={() => onCategoryChange(cat.slug)}
                  className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "text-black hover:opacity-80"
                  }`}
                  style={
                    !isSelected
                      ? { backgroundColor: "var(--color-body-bg-dark-button)" }
                      : undefined
                  }
                >
                  {getLabelByLang(cat, lang)}
                </button>
              )
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onToggleFilterPanel}
            className={`!border-header-red-dark hover:!bg-header-red-dark/80 hover:!text-white ${
              showSubcategoryFilter ? "!border-header-red-dark text-primary" : ""
            }`}
          >
            <Filter className="mr-2 h-4 w-4" />
            {t("news.industryFilter")}
            {selectedSubcategorySlugs.length > 0 && (
              <span className="bg-primary text-primary-foreground ml-2 rounded px-1.5 py-0.5 text-xs">
                {selectedSubcategorySlugs.length}
              </span>
            )}
          </Button>
        </div>

        {showSubcategoryFilter && (
          <div className="border-border border-t pt-4 pb-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-muted-foreground text-sm">{t("news.subcategoryFilter")}</span>
              {selectedSubcategorySlugs.length > 0 && (
                <button
                  onClick={onClearSubcategories}
                  className="text-primary text-xs hover:underline"
                >
                  {t("news.clearAll")}（{selectedSubcategorySlugs.length}）
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {subcategoryList.map((sub) => {
                const isSelected = selectedSubcategorySlugs.includes(sub.slug)
                return (
                  <button
                    key={sub.slug}
                    onClick={() => onSubcategoryToggle(sub.slug)}
                    className={`bg-body-bg-dark rounded-full border border-gray-300 px-3 py-1.5 text-xs transition-colors ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-primary hover:text-primary"
                    }`}
                  >
                    {getLabelByLang(sub, lang)}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
