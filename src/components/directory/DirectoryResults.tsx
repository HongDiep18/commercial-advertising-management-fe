"use client"

import { useCompanyDirectory } from "@/api/companies/hooks"
import { useDebounce } from "@/hooks/useDebounce"
import { isDemoUser } from "@/components/login/demo"
import { mockCompanies } from "@/data/mockCompanies"
import { Search } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { MEMBERSHIP_THRESHOLDS, MembershipTier, UserRole, useUser } from "../../contexts/user-context"
import { maskCompanyName } from "../../utils/companyHelpers"
import { Pagination } from "../ui/Pagination"

interface DirectoryResultsProps {
  selectedCategories: string[]
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
  selectedCategories,
  searchTerm,
  setSearchTerm,
}: DirectoryResultsProps) {
  const { t, i18n } = useTranslation()
  const { user, isLoggedIn, getTotalPoints } = useUser()
  const isDemo = isLoggedIn && !!user && isDemoUser(user)
  const isAdmin = !!user && user.role === UserRole.Admin

  const totalPoints = getTotalPoints()
  const isGuest =
    !isAdmin && (!isLoggedIn || !user || totalPoints < MEMBERSHIP_THRESHOLDS[MembershipTier.BRONZE])

  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const filterKey = `${selectedCategories.join(",")}-${debouncedSearchTerm}`
  const [pageState, setPageState] = useState<{ key: string; page: number }>({
    key: filterKey,
    page: 1,
  })

  if (pageState.key !== filterKey) {
    setPageState({ key: filterKey, page: 1 })
  }

  const currentPage = pageState.page
  const setCurrentPage = (page: number) => setPageState((prev) => ({ ...prev, page }))

  const industryParam = selectedCategories.length > 0 ? selectedCategories : undefined
  const { data, isLoading, isError } = useCompanyDirectory(
    isDemo
      ? {
          page: 1,
          limit: ITEMS_PER_PAGE,
          sortBy: "name",
          sortOrder: "asc",
        }
      : {
          search: debouncedSearchTerm || undefined,
          industry: industryParam,
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          sortBy: "name",
          sortOrder: "asc",
        }
  )

  const rawCompanies = isDemo
    ? Object.values(mockCompanies).map((c) => ({
        id: c.id,
        name: c.nameEn || c.nameCn,
        logoUrl: c.logo,
        email: c.email,
        contactName: c.contactPerson,
        phone: c.phone,
        industry: c.id.split("-")[0] || "other",
        address: c.address,
        description: c.introduction,
        companyInfoHighlight: false,
        sortPriority: 0,
      }))
    : (data?.companies ?? [])
  const searchValue = debouncedSearchTerm?.trim() ?? ""
  const isSearching = searchValue.length > 0

  const displayedCompanies = rawCompanies.filter((c) => {
    if (selectedCategories.length > 0 && !selectedCategories.includes(c.industry)) return false
    if (!isSearching) return true

    const haystack = [c.name, c.industry, c.address, c.description, c.contactName, c.email, c.phone]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()

    return haystack.includes(searchValue.toLowerCase())
  })

  const usesClientFiltering = isSearching || selectedCategories.length > 0
  const totalPages = isDemo || usesClientFiltering ? 1 : (data?.pagination.totalPages ?? 1)
  const displayTotalResults =
    isDemo || usesClientFiltering ? displayedCompanies.length : (data?.pagination.total ?? 0)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <section>
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <div className="border-border mb-6 flex items-center justify-between border-b pb-4">
        <h2 key={i18n.language} className="text-xl font-semibold">
          {selectedCategories.length === 0
            ? t("directory.allCategories", { defaultValue: "All" })
            : selectedCategories.length === 1
              ? t(`directory.categories.${selectedCategories[0]}`, {
                  defaultValue: selectedCategories[0],
                })
              : `${selectedCategories.length} ${t("directory.industryCategory")}`}
        </h2>
        <span className="text-muted-foreground text-sm">
          {displayTotalResults.toLocaleString()} {t("directory.results")}
        </span>
      </div>

      {isLoading ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">{t("directory.loading") || "Loading..."}</p>
        </div>
      ) : isError ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            {t("error.failedToLoadOrders") || "Failed to load data"}
          </p>
        </div>
      ) : displayedCompanies.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">{t("directory.noResults")}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {displayedCompanies.map((company) => (
              <Link
                key={company.id}
                href={`/directory/${company.id}${
                  selectedCategories.length === 1
                    ? `?fromCategory=${encodeURIComponent(selectedCategories[0])}`
                    : ""
                }`}
                className="group"
              >
                <div
                  className={`bg-muted relative mb-2 aspect-4/3 overflow-hidden rounded-sm border ${
                    company.companyInfoHighlight
                      ? "border-3 border-yellow-400"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={company.logoUrl || "/placeholder.svg"}
                    alt={company.name}
                    className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${isGuest ? "blur-[3px]" : ""}`}
                  />
                </div>
                <h3 className="line-clamp-2 text-xs font-medium group-hover:underline">
                  <span>{isGuest ? maskCompanyName(company.name) : company.name}</span>
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
