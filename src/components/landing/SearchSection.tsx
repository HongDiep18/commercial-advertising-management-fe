"use client"

import { useCompanyCategories } from "@/api/companies/hooks"
import { INDUSTRY_CATEGORIES } from "@/constants/categories"
import { ChevronDown, Search, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import Button from "../ui/Button"

interface FilterTag {
  id: string
  label: string
}

const locationIds = ["hcm", "hanoi", "binhduong", "dongnai", "danang", "haiphong"]

export default function SearchSection() {
  const { t } = useTranslation()
  const router = useRouter()
  const [searchMode, setSearchMode] = useState<"company" | "product" | "all">("company")
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])

  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false)
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [industrySearch, setIndustrySearch] = useState("")
  const [locationSearch, setLocationSearch] = useState("")
  const [searchValue, setSearchValue] = useState("")

  const industryDropdownRef = useRef<HTMLDivElement | null>(null)
  const locationDropdownRef = useRef<HTMLDivElement | null>(null)

  const { data: companyCategoriesData } = useCompanyCategories(true)
  const categories = useMemo(() => {
    const apiIndustries =
      companyCategoriesData?.categories
        ?.map((c) => String(c.industry ?? "").trim())
        .filter((s) => s !== "") ?? []

    const uniqueApiIndustries = Array.from(new Set(apiIndustries))
    if (uniqueApiIndustries.length > 0) {
      return uniqueApiIndustries.map((id) => ({
        id,
        name: t(`directory.categories.${id}`, { defaultValue: id }),
      }))
    }

    return INDUSTRY_CATEGORIES.map((cat) => ({
      id: cat.id,
      name: t(cat.i18nKey) || cat.fallback,
    }))
  }, [companyCategoriesData, t])

  const allLocations = useMemo(() => {
    return locationIds.map((id) => ({
      id,
      name: t(`search.locations.${id}`),
    }))
  }, [t])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        industryDropdownRef.current &&
        !industryDropdownRef.current.contains(target) &&
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(target)
      ) {
        setShowIndustryDropdown(false)
        setShowLocationDropdown(false)
        setIndustrySearch("")
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredCategories = useMemo(() => {
    if (!industrySearch.trim()) return categories
    const term = industrySearch.trim().toLowerCase()
    return categories.filter((cat) => cat.name.toLowerCase().includes(term))
  }, [industrySearch, categories])

  const filteredLocations = useMemo(() => {
    if (!locationSearch.trim()) return allLocations
    const term = locationSearch.trim().toLowerCase()
    return allLocations.filter((loc) => loc.name.toLowerCase().includes(term))
  }, [locationSearch, allLocations])

  const activeFilters = useMemo(() => {
    const tags: FilterTag[] = []
    selectedIndustries.forEach((id) => {
      const category = categories.find((c) => c.id === id)
      tags.push({ id: `ind-${id}`, label: category?.name ?? id })
    })
    selectedLocations.forEach((id) => {
      const location = allLocations.find((l) => l.id === id)
      if (location) tags.push({ id: `loc-${id}`, label: location.name })
    })
    return tags
  }, [selectedIndustries, selectedLocations, categories, allLocations])

  const toggleIndustry = (id: string) => {
    const exists = selectedIndustries.includes(id)
    const next = exists ? selectedIndustries.filter((i) => i !== id) : [...selectedIndustries, id]
    setSelectedIndustries(next)
  }

  const toggleLocation = (id: string) => {
    const exists = selectedLocations.includes(id)
    const next = exists ? selectedLocations.filter((l) => l !== id) : [...selectedLocations, id]
    setSelectedLocations(next)
  }

  const isIndustrySelected = (id: string) => selectedIndustries.includes(id)
  const isLocationSelected = (id: string) => selectedLocations.includes(id)

  const removeFilter = (filterId: string) => {
    if (filterId.startsWith("ind-")) {
      const id = filterId.replace("ind-", "")
      setSelectedIndustries((prev) => prev.filter((i) => i !== id))
    } else if (filterId.startsWith("loc-")) {
      const id = filterId.replace("loc-", "")
      setSelectedLocations((prev) => prev.filter((l) => l !== id))
    }
  }

  const clearAllFilters = () => {
    setSelectedIndustries([])
    setSelectedLocations([])
  }

  const getPlaceholder = () => {
    if (searchMode === "company") return t("search.placeholders.company")
    if (searchMode === "product") return t("search.placeholders.product")
    return t("search.placeholders.all")
  }

  const handlePopularTagClick = (tag: string) => {
    setSearchValue(tag)
  }

  const handleSearchSubmit = () => {
    const params = new URLSearchParams()
    if (searchValue.trim()) params.set("q", searchValue.trim())
    selectedIndustries.forEach((id) => params.append("industry", id))
    router.push(`/directory${params.toString() ? `?${params.toString()}` : ""}`)
  }

  return (
    <section id="directory" className="bg-body-bg-dark py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="mb-4 text-3xl font-bold">{t("search.title")}</h2>
            <p className="text-muted-foreground text-base">{t("search.subtitle")}</p>
          </div>

          <div className="border-border/50 bg-card rounded-lg border p-6 shadow-sm">
            {activeFilters.length > 0 && (
              <div className="border-border/50 mb-6 flex flex-wrap items-center gap-2 border-b pb-6">
                <span className="text-sm font-medium">
                  {t("search.filterConditions")} ({activeFilters.length})
                </span>
                {activeFilters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => removeFilter(filter.id)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm transition-colors"
                  >
                    {filter.label}
                    <X className="h-3 w-3" />
                  </button>
                ))}
                <button
                  onClick={clearAllFilters}
                  className="text-muted-foreground hover:text-foreground text-sm underline"
                >
                  {t("search.clearAll")}
                </button>
              </div>
            )}

            <div className="mb-6 flex flex-wrap gap-2">
              <div className="bg-secondary/30 flex gap-1 rounded-md p-0.5">
                <button
                  onClick={() => setSearchMode("company")}
                  className={`rounded px-4 py-1.5 text-sm font-medium transition-all ${
                    searchMode === "company"
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t("search.byCompany")}
                </button>
                {/* <button
                  onClick={() => setSearchMode("product")}
                  className={`rounded px-4 py-1.5 text-sm font-medium transition-all ${
                    searchMode === "product"
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t("search.byProduct")}
                </button> */}
              </div>

              <div className="relative" ref={industryDropdownRef}>
                <button
                  onClick={() => {
                    setShowLocationDropdown(false)
                    setShowIndustryDropdown((open) => {
                      if (!open) setIndustrySearch("")
                      return !open
                    })
                  }}
                  className="border-border/50 bg-background hover:bg-secondary/30 inline-flex items-center gap-2 rounded-md border px-4 py-1.5 text-sm font-medium transition-colors"
                >
                  {t("search.industryCategory")}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>

                {showIndustryDropdown && (
                  <div className="border-border bg-card absolute top-full left-0 z-10 mt-2 max-h-96 w-72 overflow-y-auto rounded-lg border shadow-lg">
                    <div className="p-3">
                      <input
                        type="text"
                        value={industrySearch}
                        onChange={(e) => setIndustrySearch(e.target.value)}
                        placeholder={t("search.searchCategory")}
                        className="border-border/60 focus:ring-primary/40 mb-3 h-9 w-full rounded-md border px-3 text-sm outline-none focus:ring-2"
                      />
                      <div className="space-y-1">
                        {filteredCategories.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => toggleIndustry(category.id)}
                            className={`w-full rounded px-3 py-2 text-left text-sm transition-colors ${
                              isIndustrySelected(category.id)
                                ? "bg-primary/10 text-primary font-medium"
                                : "hover:bg-secondary/50"
                            }`}
                          >
                            {category.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative" ref={locationDropdownRef}>
                <button
                  onClick={() => {
                    setShowIndustryDropdown(false)
                    setShowLocationDropdown(!showLocationDropdown)
                  }}
                  className="border-border/50 bg-background hover:bg-secondary/30 inline-flex items-center gap-2 rounded-md border px-4 py-1.5 text-sm font-medium transition-colors"
                >
                  {t("search.location")}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>

                {showLocationDropdown && (
                  <div className="border-border bg-card absolute top-full left-0 z-10 mt-2 w-56 rounded-lg border shadow-lg">
                    <div className="p-3">
                      <input
                        placeholder={t("search.searchLocation")}
                        value={locationSearch}
                        onChange={(e) => setLocationSearch(e.target.value)}
                        className="border-border/60 focus:ring-primary/40 mb-3 h-9 w-full rounded-md border px-3 text-sm outline-none focus:ring-2"
                      />
                      <div className="space-y-1">
                        {filteredLocations.map((location) => (
                          <button
                            key={location.id}
                            onClick={() => toggleLocation(location.id)}
                            className={`w-full rounded px-3 py-2 text-left text-sm transition-colors ${
                              isLocationSelected(location.id)
                                ? "bg-primary/10 text-primary font-medium"
                                : "hover:bg-secondary/50"
                            }`}
                          >
                            {location.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="relative mb-4">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <input
                placeholder={getPlaceholder()}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="border-border/60 focus:ring-primary/40 h-11 w-full rounded-md border px-3 pl-10 text-sm outline-none focus:ring-2"
              />
            </div>

            <Button
              variant="primary"
              type="button"
              onClick={handleSearchSubmit}
              className="flex h-10 w-full items-center justify-center text-sm font-medium"
            >
              <Search className="mr-2 h-4 w-4" />
              {t("search.searchButton")}
            </Button>
          </div>

          {/* <div className="mt-6 text-center">
            <span className="text-muted-foreground mr-3 text-sm">
              {t("search.popularSearches")}
            </span>
            <div className="mt-2 inline-flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handlePopularTagClick(category.name)}
                  className="border-border text-foreground hover:border-primary hover:text-primary rounded-md border bg-white px-3 py-1 text-xs font-normal transition-colors"
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div> */}
        </div>
      </div>
    </section>
  )
}
