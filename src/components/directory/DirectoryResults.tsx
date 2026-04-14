"use client"

import { useCompanyDirectory } from "@/api/companies/hooks"
import type { CompanyDirectoryQuery } from "@/api/companies/types"
import { useDebounce } from "@/hooks/useDebounce"
import { isDemoUser } from "@/components/login/demo"
import { mockCompanies } from "@/data/mockCompanies"
import { directoryCompanyMatchesSelectedCategories } from "@/utils/directoryIndustry"
import {
  companyDirectoryRowMatchesSearch,
  getDirectorySearchAndRegionParams,
  translateRegionLabel,
} from "@/utils/regionSearch"
import { Search, X } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { MembershipTier, UserRole, useUser } from "../../contexts/user-context"
import { Pagination } from "../ui/Pagination"

interface DirectoryResultsProps {
  selectedCategories: string[]
  selectedRegions: string[]
  searchTerm: string
  setSearchTerm: (term: string) => void
  onClearRegions: () => void
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
          className="bg-body-bg-dark focus:ring-primary/20 focus:border-primary/50 w-full rounded-lg border border-gray-400 py-3 pr-12 pl-12 text-sm transition-all focus:ring-2 focus:outline-none"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            className="text-muted-foreground hover:text-foreground hover:bg-muted/60 focus-visible:ring-ring absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 transition-colors focus-visible:ring-2 focus-visible:outline-none"
            aria-label={t("directory.clear")}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export function DirectoryResults({
  selectedCategories,
  selectedRegions,
  searchTerm,
  setSearchTerm,
  onClearRegions,
}: DirectoryResultsProps) {
  const { t, i18n } = useTranslation()
  const { user, isLoggedIn, getMemberTier } = useUser()
  const isDemo = isLoggedIn && !!user && isDemoUser(user)
  const serverDirectoryQueryEnabled = !isDemo
  const isAdmin = !!user && user.role === UserRole.Admin

  const userTier = getMemberTier()
  const shouldBlurLogo =
    !isAdmin && (userTier === MembershipTier.GUEST || userTier === MembershipTier.BRONZE)

  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [currentPage, setCurrentPage] = useState(1)

  const industryParam = selectedCategories.length > 0 ? selectedCategories : undefined
  const trimmedSearch = debouncedSearchTerm?.trim() ?? ""
  const { search: searchParam, region: regionParam } = useMemo(
    () => getDirectorySearchAndRegionParams(trimmedSearch, selectedRegions, i18n),
    [trimmedSearch, selectedRegions, i18n]
  )

  const directoryQuery: CompanyDirectoryQuery = isDemo
    ? {
        page: 1,
        limit: ITEMS_PER_PAGE,
        sortBy: "name" as const,
        sortOrder: "asc" as const,
      }
    : {
        search: searchParam,
        industry: industryParam,
        region: regionParam,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        sortBy: "name" as const,
        sortOrder: "asc" as const,
      }

  const { data, isLoading, isError } = useCompanyDirectory(
    directoryQuery,
    serverDirectoryQueryEnabled
  )

  const industryFilteredByServer =
    !isDemo && serverDirectoryQueryEnabled && industryParam != null && industryParam.length > 0

  const rawCompanies = isDemo
    ? Object.values(mockCompanies).map((c) => ({
        id: c.id,
        name: c.nameEn || c.nameCn,
        logoUrl: c.logo,
        email: c.email,
        contactName: c.contactPerson,
        phone: c.phone,
        industry: c.id.split("-")[0] || "other",
        region: "",
        address: c.address,
        description: c.introduction,
        companyInfoHighlight: false,
        sortPriority: 0,
      }))
    : (data?.companies ?? [])
  const searchValue = debouncedSearchTerm?.trim() ?? ""
  const isSearching = searchValue.length > 0

  const displayedCompanies = rawCompanies.filter((c) => {
    if (
      selectedCategories.length > 0 &&
      !industryFilteredByServer &&
      !directoryCompanyMatchesSelectedCategories(selectedCategories, c.industry)
    ) {
      return false
    }
    if (!isSearching) return true
    if (serverDirectoryQueryEnabled) return true

    return companyDirectoryRowMatchesSearch(
      {
        name: c.name,
        industry: c.industry,
        region: c.region,
        address: c.address,
        description: c.description,
        contactName: c.contactName,
        email: c.email,
        phone: c.phone,
      },
      searchValue,
      i18n
    )
  })

  const usesClientFiltering =
    (isDemo && (isSearching || selectedCategories.length > 0)) ||
    (!isDemo && !isSearching && selectedCategories.length > 0 && !industryFilteredByServer)
  const totalPages = isDemo || usesClientFiltering ? 1 : (data?.pagination.totalPages ?? 1)
  const displayTotalResults =
    isDemo || usesClientFiltering ? displayedCompanies.length : (data?.pagination.total ?? 0)
  const selectedRegionLabels = selectedRegions.map((key) => translateRegionLabel(key, t, i18n))
  const backToDirectoryQuery = useMemo(() => {
    const params = new URLSearchParams()
    selectedCategories.forEach((id) => params.append("industry", id))
    selectedRegions.forEach((id) => params.append("region", id))
    const q = searchTerm.trim()
    if (q) params.set("q", q)
    if (currentPage > 1) params.set("page", String(currentPage))
    const qs = params.toString()
    return `/directory${qs ? `?${qs}` : ""}`
  }, [selectedCategories, selectedRegions, searchTerm, currentPage])
  const encodedBackToDirectory = encodeURIComponent(backToDirectoryQuery)

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
        <div className="flex items-end gap-3">
          {selectedRegionLabels.length > 0 && (
            <div className="text-muted-foreground text-right text-sm">
              <span className="font-medium">
                {t("companyDetail.region", { defaultValue: "Region" })}:
              </span>{" "}
              <span>{selectedRegionLabels.join(", ")}</span>
            </div>
          )}
          {selectedRegionLabels.length > 0 && (
            <button
              onClick={onClearRegions}
              className="text-primary !bg-header-red-light hover:!bg-header-red-dark rounded-lg px-2 py-1 text-sm font-medium text-white"
            >
              {t("directory.clearRegion", { defaultValue: "Clear Region" })}
            </button>
          )}
          <span className="text-muted-foreground text-sm">
            {displayTotalResults.toLocaleString()} {t("directory.results")}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">{t("companyDetail.loading") || "Loading..."}</p>
        </div>
      ) : isError ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            {t("error.failedToLoadData") || "Failed to load data"}
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
                href={`/directory/${company.id}?back=${encodedBackToDirectory}`}
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
                    className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${shouldBlurLogo ? "blur-[3px]" : ""}`}
                  />
                </div>
                <h3 className="line-clamp-2 text-xs font-medium group-hover:underline">
                  <span>{company.name}</span>
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
