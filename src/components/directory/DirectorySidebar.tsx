"use client"

import { useCompanyCategories } from "@/api/companies/hooks"
import { useTranslation } from "react-i18next"

export const categories = [
  "textile",
  "shoes",
  "vehicle",
  "furniture",
  "construction",
  "electronics",
  "machinery",
  "plastic",
  "agriculture",
  "metal",
  "paper",
  "logistics",
  "finance",
  "gifts",
  "tourism",
  "food",
  "education",
  "other",
]

interface DirectorySidebarProps {
  selectedCategory: string | null
  setSelectedCategory: (category: string | null) => void
}

export function DirectorySidebar({ selectedCategory, setSelectedCategory }: DirectorySidebarProps) {
  const { t } = useTranslation()
  const { data } = useCompanyCategories()
  const countsById =
    data?.categories.reduce<Record<string, number>>((acc, category) => {
      acc[category.industry] = (acc[category.industry] ?? 0) + category.count
      return acc
    }, {}) ?? {}
  return (
    <aside className="border-border bg-card/30 sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 border-r lg:block">
      <div className="bg-body-bg-dark pr-4 font-medium">
        <div>
          <h3 className="text-foreground mb-4 text-sm font-semibold">
            {t("directory.industryCategory")}
          </h3>
          <div className="max-h-[calc(100vh-10rem)] space-y-0.5 overflow-y-auto">
            {categories.map((category) => {
              const isSelected = selectedCategory === category

              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`group flex w-full items-center justify-between px-3 py-2.5 text-left transition-all duration-200 ${
                    isSelected
                      ? "bg-primary/10 text-primary border-primary border-l-2 font-medium"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <span className="line-clamp-1 text-sm">
                    {t(`directory.categories.${category}`)}
                  </span>
                  <span
                    className={`ml-2 shrink-0 text-xs ${isSelected ? "text-primary" : "text-muted-foreground/60"}`}
                  >
                    {(countsById[category] ?? 0).toLocaleString()}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </aside>
  )
}
