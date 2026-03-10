"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import { categories } from "./DirectorySidebar"
import { useUser, MEMBERSHIP_THRESHOLDS, MembershipTier } from "../../contexts/user-context"
import { Pagination } from "../ui/Pagination"
import { maskCompanyName } from "../../utils/companyHelpers"
import { useTranslation } from "react-i18next"

const generateCompaniesForCategory = (
  categoryId: string,
  categoryName: string,
  count: number,
  t: (key: string, options?: { defaultValue?: string }) => string
) => {
  const companyPrefixes: Record<string, string> = {
    textile: "紡織",
    shoes: "鞋業",
    vehicle: "汽車零件",
    furniture: "家具",
    construction: "建材",
    electronics: "電子",
    machinery: "機械",
    plastic: "塑膠",
    agriculture: "農業",
    metal: "金屬",
    paper: "紙器包裝",
    logistics: "物流",
    finance: "金融",
    gifts: "禮品",
    tourism: "旅遊",
    food: "食品",
    education: "教育",
    other: "服務",
  }

  const prefix = companyPrefixes[categoryId] || "公司"

  return Array.from({ length: count }, (_, i) => {
    const companyId = `${categoryId}-${i + 1}`

    if (companyId === "textile-1") {
      return {
        id: companyId,
        name: t(`companyDetail.companies.${companyId}.nameCn`, {
          defaultValue: "力鑫工業責任有限公司",
        }),
        category: categoryName,
        image: "/assets/images/companies/TNHH-LI-SHIN.png",
      }
    }

    if (companyId === "textile-2") {
      return {
        id: companyId,
        name: t(`companyDetail.companies.${companyId}.nameCn`, {
          defaultValue: "越南立春責任有限公司",
        }),
        category: categoryName,
        image: "/assets/images/companies/CTY-FASWELL-VN.png",
      }
    }

    if (companyId === "finance-1") {
      return {
        id: companyId,
        name: t(`companyDetail.companies.${companyId}.nameCn`, {
          defaultValue: "星展銀行（越南）有限公司",
        }),
        category: categoryName,
        image: "/assets/images/companies/DBS.jpg",
      }
    }

    if (companyId === "machinery-1") {
      return {
        id: companyId,
        name: t(`companyDetail.companies.${companyId}.nameCn`, {
          defaultValue: "蔡雄商業有限公司",
        }),
        category: categoryName,
        image: "/assets/images/companies/tsaihsiung-construction.jpg",
      }
    }

    return {
      id: companyId,
      name: t(`companyDetail.companies.${companyId}.nameCn`, {
        defaultValue: `${prefix}公司 ${i + 1}`,
      }),
      category: categoryName,
      image: "/assets/images/companies/product-design-concept.png",
    }
  })
}

interface DirectoryResultsProps {
  selectedCategory: string | null
  searchTerm: string
  setSearchTerm: (term: string) => void
}

const ITEMS_PER_PAGE = 20

function SearchBar({
  searchTerm,
  setSearchTerm,
}: {
  searchTerm: string
  setSearchTerm: (term: string) => void
}) {
  const { t } = useTranslation()
  return (
    <div className="mb-6">
      <div className="relative max-w-xl">
        <Search className="text-muted-foreground absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
        <input
          type="text"
          placeholder={t("directory.searchPlaceholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-body-bg-dark focus:ring-primary/20 focus:border-primary/50 w-full rounded-lg border border-gray-400 py-3 pr-4 pl-12 text-sm transition-all focus:ring-2 focus:outline-none"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-4 -translate-y-1/2 text-sm"
          >
            {t("directory.clear")}
          </button>
        )}
      </div>
    </div>
  )
}

export function DirectoryResults({
  selectedCategory,
  searchTerm,
  setSearchTerm,
}: DirectoryResultsProps) {
  const { t, i18n } = useTranslation()
  const { user, isLoggedIn, getTotalPoints } = useUser()

  const totalPoints = getTotalPoints()
  const isGuest = !isLoggedIn || !user || totalPoints < MEMBERSHIP_THRESHOLDS[MembershipTier.BRONZE]

  const companiesByCategory = useMemo(() => {
    const result: Record<string, ReturnType<typeof generateCompaniesForCategory>> = {}
    categories.forEach((cat) => {
      const translatedName = t(`directory.categories.${cat.id}`, { defaultValue: cat.name })
      const count = Math.min(cat.count, 200)
      result[cat.id] = generateCompaniesForCategory(cat.id, translatedName, count, t)
    })
    return result
  }, [t])

  const filterKey = `${selectedCategory || ""}-${searchTerm}`
  const [pageState, setPageState] = useState<{ key: string; page: number }>({
    key: filterKey,
    page: 1,
  })

  if (pageState.key !== filterKey) {
    setPageState({ key: filterKey, page: 1 })
  }

  const currentPage = pageState.page
  const setCurrentPage = (page: number) => setPageState((prev) => ({ ...prev, page }))

  const currentCompanies = selectedCategory ? companiesByCategory[selectedCategory] || [] : []

  const filteredCompanies = searchTerm
    ? currentCompanies.filter(
        (company) =>
          company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : currentCompanies

  const currentCategory = selectedCategory
    ? categories.find((c) => c.id === selectedCategory)
    : null

  const displayTotalResults = searchTerm ? filteredCompanies.length : currentCategory?.count || 0

  const totalResults = filteredCompanies.length
  const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE)

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const displayedCompanies = filteredCompanies.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (!selectedCategory) {
    return (
      <section>
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
          <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <Search className="text-muted-foreground h-8 w-8" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">{t("directory.selectCategory")}</h2>
          <p className="text-muted-foreground max-w-md">
            {t("directory.selectCategoryDescription")}
          </p>
        </div>
      </section>
    )
  }

  return (
    <section>
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <div className="border-border mb-6 flex items-center justify-between border-b pb-4">
        <h2 key={i18n.language} className="text-xl font-semibold">
          {currentCategory
            ? t(`directory.categories.${currentCategory.id}`, {
                defaultValue: currentCategory.name,
              })
            : ""}
        </h2>
        <span className="text-muted-foreground text-sm">
          {displayTotalResults.toLocaleString()} {t("directory.results")}
        </span>
      </div>

      {filteredCompanies.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">{t("directory.noResults")}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {displayedCompanies.map((company) => (
              <Link
                key={company.id}
                href={`/directory/${company.id}${selectedCategory ? `?fromCategory=${encodeURIComponent(selectedCategory)}` : ""}`}
                className="group"
              >
                <div className="bg-muted relative mb-2 aspect-[4/3] overflow-hidden rounded-sm">
                  <img
                    src={company.image || "/placeholder.svg"}
                    alt={company.name}
                    className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${isGuest ? "blur-[3px]" : ""}`}
                  />
                </div>
                <h3 className="line-clamp-2 text-xs font-medium group-hover:underline">
                  {isGuest ? maskCompanyName(company.name) : company.name}
                </h3>
              </Link>
            ))}
          </div>

          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            scrollOnChange
          />
        </>
      )}
    </section>
  )
}
