import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronDown, Search, X } from "lucide-react"
import Button from "../ui/Button"

interface FilterTag {
  id: string
  label: string
}

const categories = [
  { id: "semi", name: "半導體" },
  { id: "elec", name: "電子製造" },
  { id: "textile", name: "紡織成衣" },
  { id: "food", name: "食品加工" },
  { id: "machine", name: "機械設備" },
  { id: "plastic", name: "塑膠製品" },
]

const allLocations = ["胡志明市", "河內", "平陽", "同奈", "峴港", "海防"]

export default function SearchSection() {
  const [searchMode, setSearchMode] = useState<"company" | "product" | "all">("company")
  const [activeFilters, setActiveFilters] = useState<FilterTag[]>([])
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])

  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false)
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [locationSearch, setLocationSearch] = useState("")
  const [searchValue, setSearchValue] = useState("")

  const industryDropdownRef = useRef<HTMLDivElement | null>(null)
  const locationDropdownRef = useRef<HTMLDivElement | null>(null)

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
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredLocations = useMemo(() => {
    if (!locationSearch.trim()) return allLocations
    const term = locationSearch.trim().toLowerCase()
    return allLocations.filter((loc) => loc.toLowerCase().includes(term))
  }, [locationSearch])

  const updateFiltersFromSelection = (industries: string[], locations: string[]) => {
    const tags: FilterTag[] = []
    industries.forEach((name) => tags.push({ id: `ind-${name}`, label: name }))
    locations.forEach((name) => tags.push({ id: `loc-${name}`, label: name }))
    setActiveFilters(tags)
  }

  const toggleIndustry = (name: string) => {
    const exists = selectedIndustries.includes(name)
    const next = exists ? selectedIndustries.filter((i) => i !== name) : [...selectedIndustries, name]
    setSelectedIndustries(next)
    updateFiltersFromSelection(next, selectedLocations)
  }

  const toggleLocation = (name: string) => {
    const exists = selectedLocations.includes(name)
    const next = exists ? selectedLocations.filter((l) => l !== name) : [...selectedLocations, name]
    setSelectedLocations(next)
    updateFiltersFromSelection(selectedIndustries, next)
  }

  const isIndustrySelected = (name: string) => selectedIndustries.includes(name)
  const isLocationSelected = (name: string) => selectedLocations.includes(name)

  const removeFilter = (id: string) => {
    if (id.startsWith("ind-")) {
      const name = id.replace("ind-", "")
      const next = selectedIndustries.filter((i) => i !== name)
      setSelectedIndustries(next)
      updateFiltersFromSelection(next, selectedLocations)
    } else if (id.startsWith("loc-")) {
      const name = id.replace("loc-", "")
      const next = selectedLocations.filter((l) => l !== name)
      setSelectedLocations(next)
      updateFiltersFromSelection(selectedIndustries, next)
    }
  }

  const clearAllFilters = () => {
    setSelectedIndustries([])
    setSelectedLocations([])
    setActiveFilters([])
  }

  const getPlaceholder = () => {
    if (searchMode === "company") return "輸入公司名稱、品牌或關鍵字..."
    if (searchMode === "product") return "輸入產品、服務或關鍵字..."
    return "輸入公司或產品關鍵字..."
  }

  const handlePopularTagClick = (tag: string) => {
    setSearchValue(tag)
  }

  return (
    <section id="directory" className="bg-body-bg-dark py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="mb-4 text-3xl font-bold">搜尋企業</h2>
            <p className="text-base text-muted-foreground">
              輸入關鍵字、產業類別或地區，立即找到適合您的商業夥伴
            </p>
          </div>

          <div className="rounded-lg border border-border/50 bg-card p-6 shadow-sm">
            {activeFilters.length > 0 && (
              <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-border/50 pb-6">
                <span className="text-sm font-medium">篩選條件 ({activeFilters.length})</span>
                {activeFilters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => removeFilter(filter.id)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {filter.label}
                    <X className="h-3 w-3" />
                  </button>
                ))}
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-muted-foreground underline hover:text-foreground"
                >
                  清除全部
                </button>
              </div>
            )}

            <div className="mb-6 flex flex-wrap gap-2">
              <div className="flex gap-1 rounded-md bg-secondary/30 p-0.5">
                <button
                  onClick={() => setSearchMode("company")}
                  className={`rounded px-4 py-1.5 text-sm font-medium transition-all ${searchMode === "company"
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  依公司
                </button>
                <button
                  onClick={() => setSearchMode("product")}
                  className={`rounded px-4 py-1.5 text-sm font-medium transition-all ${searchMode === "product"
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  依產品
                </button>
                <button
                  onClick={() => setSearchMode("all")}
                  className={`rounded px-4 py-1.5 text-sm font-medium transition-all ${searchMode === "all"
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  全選
                </button>
              </div>

              <div className="relative" ref={industryDropdownRef}>
                <button
                  onClick={() => {
                    setShowLocationDropdown(false)
                    setShowIndustryDropdown(!showIndustryDropdown)
                  }}
                  className="inline-flex items-center gap-2 rounded-md border border-border/50 bg-background px-4 py-1.5 text-sm font-medium transition-colors hover:bg-secondary/30"
                >
                  產業類別
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>

                {showIndustryDropdown && (
                  <div className="absolute top-full left-0 z-10 mt-2 max-h-96 w-72 overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
                    <div className="p-3">
                      <input
                        placeholder="搜尋類別..."
                        className="mb-3 h-9 w-full rounded-md border border-border/60 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                      />
                      <div className="space-y-1">
                        {categories.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => toggleIndustry(category.name)}
                            className={`w-full rounded px-3 py-2 text-left text-sm transition-colors ${isIndustrySelected(category.name)
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
                  className="inline-flex items-center gap-2 rounded-md border border-border/50 bg-background px-4 py-1.5 text-sm font-medium transition-colors hover:bg-secondary/30"
                >
                  地區
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>

                {showLocationDropdown && (
                  <div className="absolute top-full left-0 z-10 mt-2 w-56 rounded-lg border border-border bg-card shadow-lg">
                    <div className="p-3">
                      <input
                        placeholder="搜尋地區..."
                        value={locationSearch}
                        onChange={(e) => setLocationSearch(e.target.value)}
                        className="mb-3 h-9 w-full rounded-md border border-border/60 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                      />
                      <div className="space-y-1">
                        {filteredLocations.map((location) => (
                          <button
                            key={location}
                            onClick={() => toggleLocation(location)}
                            className={`w-full rounded px-3 py-2 text-left text-sm transition-colors ${isLocationSelected(location)
                              ? "bg-primary/10 text-primary font-medium"
                              : "hover:bg-secondary/50"
                              }`}
                          >
                            {location}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="relative mb-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder={getPlaceholder()}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="h-11 w-full rounded-md border border-border/60 px-3 pl-10 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <Button
              variant="primary"
              className="flex h-10 w-full items-center justify-center text-sm font-medium"
            >
              <Search className="mr-2 h-4 w-4" />
              搜尋
            </Button>
          </div>

          <div className="mt-6 text-center">
            <span className="mr-3 text-sm text-muted-foreground">熱門搜尋：</span>
            <div className="mt-2 inline-flex flex-wrap gap-2">
              {["半導體", "電子製造", "紡織成衣", "食品加工", "機械設備", "塑膠製品"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => handlePopularTagClick(tag)}
                  className="rounded-md border border-border bg-white px-3 py-1 text-xs font-normal text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}