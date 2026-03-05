"use client"

import { useTranslation } from "react-i18next"

export const storeCategories = [
  { id: "all", count: 6 },
  { id: "procurement", count: 2 },
  { id: "taiwanTea", count: 2 },
  { id: "teaGift", count: 2 },
]

export const categoryNameToKey: Record<string, string> = {
  全部商品: "all",
  越南華商採購名錄: "procurement",
  台灣茶葉: "taiwanTea",
  茶葉禮品: "teaGift",
}

export const categoryIdToName: Record<string, string> = {
  all: "全部商品",
  procurement: "越南華商採購名錄",
  taiwanTea: "台灣茶葉",
  teaGift: "茶葉禮品",
}

interface StoreSidebarProps {
  selectedCategory: string
  setSelectedCategory: (category: string) => void
}

export function StoreSidebar({ selectedCategory, setSelectedCategory }: StoreSidebarProps) {
  const { t } = useTranslation()

  const handleCategoryClick = (categoryId: string) => {
    const categoryName = categoryIdToName[categoryId]
    setSelectedCategory(categoryName)
  }

  return (
    <aside className="border-border bg-body-bg-dark sticky top-14 hidden h-[calc(100vh-3.5rem)] w-72 border-r lg:block">
      <div className="p-5">
        {/* Categories */}
        <div>
          <h3 className="text-foreground mb-4 text-sm font-semibold">{t("store.sidebar.title")}</h3>
          <div className="max-h-[calc(100vh-10rem)] space-y-0.5 overflow-y-auto">
            {storeCategories.map((category) => {
              const categoryName = categoryIdToName[category.id]
              const isSelected = selectedCategory === categoryName

              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`group flex w-full items-center justify-between px-3 py-2.5 text-left transition-all duration-200 ${
                    isSelected
                      ? "bg-primary/10 text-primary border-primary border-l-2 font-medium"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <span className="line-clamp-1 text-sm">
                    {t(`store.sidebar.categories.${category.id}`)}
                  </span>
                  <span
                    className={`ml-2 flex-shrink-0 text-xs ${isSelected ? "text-primary" : "text-muted-foreground/60"}`}
                  >
                    {category.count}
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
