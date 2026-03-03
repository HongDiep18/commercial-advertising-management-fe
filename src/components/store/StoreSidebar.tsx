"use client"

import { useTranslation } from "react-i18next"

export const storeCategories = [
  { id: "all", count: 6 },
  { id: "procurement", count: 2 },
  { id: "taiwanTea", count: 2 },
  { id: "teaGift", count: 2 },
]

// Map category Chinese name to translation key
export const categoryNameToKey: Record<string, string> = {
  "全部商品": "all",
  "越南華商採購名錄": "procurement",
  "台灣茶葉": "taiwanTea",
  "茶葉禮品": "teaGift",
}

// Map category ID to Chinese name
export const categoryIdToName: Record<string, string> = {
  "all": "全部商品",
  "procurement": "越南華商採購名錄",
  "taiwanTea": "台灣茶葉",
  "teaGift": "茶葉禮品",
}

interface StoreSidebarProps {
  selectedCategory: string
  setSelectedCategory: (category: string) => void
}

export function StoreSidebar({
  selectedCategory,
  setSelectedCategory
}: StoreSidebarProps) {
  const { t } = useTranslation()

  const handleCategoryClick = (categoryId: string) => {
    const categoryName = categoryIdToName[categoryId]
    setSelectedCategory(categoryName)
  }

  return (
    <aside className="hidden lg:block w-72 border-r border-border bg-body-bg-dark sticky top-14 h-[calc(100vh-3.5rem)]">
      <div className="p-5">
        {/* Categories */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-4">{t('store.sidebar.title')}</h3>
          <div className="space-y-0.5 max-h-[calc(100vh-10rem)] overflow-y-auto">
            {storeCategories.map((category) => {
              const categoryName = categoryIdToName[category.id]
              const isSelected = selectedCategory === categoryName

              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`w-full text-left px-3 py-2.5 transition-all duration-200 flex items-center justify-between group ${
                    isSelected
                      ? "bg-primary/10 text-primary border-l-2 border-primary font-medium"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <span className="text-sm line-clamp-1">{t(`store.sidebar.categories.${category.id}`)}</span>
                  <span className={`text-xs ml-2 flex-shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground/60"}`}>
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
