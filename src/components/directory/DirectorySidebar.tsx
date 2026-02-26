"use client"

import { useTranslation } from "react-i18next"

export const categories = [
  { id: "textile", name: "紡織、成衣及配件", count: 238 },
  { id: "shoes", name: "鞋業、鞋材、皮革類、行李袋", count: 188 },
  { id: "vehicle", name: "汽、機、自行車及零配件", count: 182 },
  { id: "furniture", name: "木、竹、藤、家具及工具", count: 211 },
  { id: "construction", name: "建築工程及建材（含環保）", count: 433 },
  { id: "electronics", name: "電子、電器及通訊器材", count: 223 },
  { id: "machinery", name: "機械、機電及工業用相關產品", count: 350 },
  { id: "plastic", name: "塑膠、橡膠加工製品及化工業", count: 453 },
  { id: "agriculture", name: "農、林、漁、牧業", count: 55 },
  { id: "metal", name: "金屬、五金製品、電鍍及模具", count: 424 },
  { id: "paper", name: "紙器包裝、印刷及相關製品", count: 247 },
  { id: "logistics", name: "海、空、貨運運輸類及報關行", count: 102 },
  { id: "finance", name: "金融、保險、證券業", count: 60 },
  { id: "gifts", name: "禮品、飾品、工藝品、日用品", count: 79 },
  { id: "tourism", name: "旅遊、餐廳、娛樂、運動休閒及器材", count: 123 },
  { id: "food", name: "食品、飲料及加工產品", count: 70 },
  { id: "education", name: "教育、醫療、顧問", count: 123 },
  { id: "other", name: "其他服務業", count: 249 },
]

interface DirectorySidebarProps {
  selectedCategory: string | null
  setSelectedCategory: (category: string | null) => void
}

export function DirectorySidebar({ selectedCategory, setSelectedCategory }: DirectorySidebarProps) {
  const { t } = useTranslation()
  return (
    <aside className="border-border bg-card/30 sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 border-r lg:block">
      <div className="bg-body-bg-dark pr-4 font-medium">
        <div>
          <h3 className="text-foreground mb-4 text-sm font-semibold">
            {t("directory.industryCategory")}
          </h3>
          <div className="max-h-[calc(100vh-10rem)] space-y-0.5 overflow-y-auto">
            {categories.map((category) => {
              const isSelected = selectedCategory === category.id

              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`group flex w-full items-center justify-between px-3 py-2.5 text-left transition-all duration-200 ${
                    isSelected
                      ? "bg-primary/10 text-primary border-primary border-l-2 font-medium"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <span className="line-clamp-1 text-sm">
                    {t(`directory.categories.${category.id}`)}
                  </span>
                  <span
                    className={`ml-2 flex-shrink-0 text-xs ${isSelected ? "text-primary" : "text-muted-foreground/60"}`}
                  >
                    {category.count.toLocaleString()}
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
