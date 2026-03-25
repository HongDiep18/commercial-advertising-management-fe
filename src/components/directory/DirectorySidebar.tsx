"use client"

import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import type { DirectoryCategoryRow } from "./useDirectoryCategories"
import { useUser } from "@/contexts/user-context"
import { MembershipTier, UserRole } from "@/types"

export const ALL_CATEGORY_ID = "all"

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
  selectedCategories: string[]
  setSelectedCategories: (categories: string[]) => void
  categories: DirectoryCategoryRow[]
  hasAllAccess: boolean
}

export function DirectorySidebar({
  selectedCategories,
  setSelectedCategories,
  categories,
  hasAllAccess,
}: DirectorySidebarProps) {
  const { t } = useTranslation()
  const { user } = useUser()

  const isGuest = !user
  const isDiamondOrAdmin =
    user &&
    (user.membershipTier === MembershipTier.DIAMOND ||
      user.role === UserRole.Admin ||
      user.role === UserRole.SuperAdmin)

  // Render logic based on hasAllAccess flag and user type
  const shouldShowAllCategory = hasAllAccess // All users with hasAllAccess=true see 'ALL'
  const shouldShowIndividualCategories = hasAllAccess ? isDiamondOrAdmin : true // Diamond/Admin see both, others see based on hasAllAccess

  // Auto-select accessible industries on mount (Bronze/Silver/Gold only)
  useEffect(() => {
    if (!hasAllAccess && categories.length > 0 && selectedCategories.length === 0) {
      // Auto-select all accessible industries returned from API (Bronze/Silver/Gold)
      const industryNames = categories.map((cat) => cat.id)
      setSelectedCategories(industryNames)
    }
  }, [hasAllAccess, categories, selectedCategories.length, setSelectedCategories])

  const isAllSelected = selectedCategories.length === 0
  const toggleCategory = (id: string) => {
    if (selectedCategories.includes(id)) {
      setSelectedCategories(selectedCategories.filter((x) => x !== id))
      return
    }
    setSelectedCategories([...selectedCategories, id])
  }

  return (
    <aside className="border-border bg-card/30 sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 border-r lg:block">
      <div className="bg-body-bg-dark pr-4 font-medium">
        <div>
          <h3 className="text-foreground mb-4 text-sm font-semibold">
            {t("directory.industryCategory")}
          </h3>
          <div className="max-h-[calc(100vh-10rem)] space-y-0.5 overflow-y-auto">
            {shouldShowAllCategory && (
              <button
                onClick={() => setSelectedCategories([])}
                className={`group flex w-full items-center justify-between px-3 py-2.5 text-left transition-all duration-200 ${isAllSelected
                  ? "bg-primary/10 text-primary border-primary border-l-2 font-medium"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
              >
                <span className="line-clamp-1 text-sm">
                  {t("directory.allCategories", { defaultValue: "All" })}
                </span>
              </button>
            )}
            {shouldShowIndividualCategories &&
              categories.map((category) => {
                const isSelected = selectedCategories.includes(category.id)

                return (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`group flex w-full items-center justify-between px-3 py-2.5 text-left transition-all duration-200 ${isSelected
                      ? "bg-primary/10 text-primary border-primary border-l-2 font-medium"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }`}
                  >
                    <span className="line-clamp-1 text-sm">
                      {t(`directory.categories.${category.id}`, { defaultValue: category.id })}
                    </span>
                    <span
                      className={`ml-2 shrink-0 text-xs ${isSelected ? "text-primary" : "text-muted-foreground/60"}`}
                    >
                      {(category.count ?? 0).toLocaleString()}
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
