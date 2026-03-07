"use client"

import { useState, useRef, useEffect } from "react"
import { Search, X, ChevronDown } from "lucide-react"
import { Building2, Factory, Warehouse, Home, Landmark, TreePine } from "lucide-react"
import { useTranslation } from "react-i18next"

type PropertyFilterProps = {
  selectedType: string
  setSelectedType: (value: string) => void
  selectedProvince: string
  setSelectedProvince: (value: string) => void
  searchTerm: string
  setSearchTerm: (value: string) => void
}

const propertyTypes = [
  { id: "all", icon: Building2 },
  { id: "land", icon: TreePine },
  { id: "factory", icon: Factory },
  { id: "warehouse", icon: Warehouse },
  { id: "house", icon: Home },
  { id: "office", icon: Landmark },
]

const provinces = [
  { id: "all" },
  { id: "hcm" },
  { id: "hanoi" },
  { id: "binh-duong" },
  { id: "dong-nai" },
  { id: "long-an" },
  { id: "ba-ria" }
]

export default function PropertyFilter({
  selectedType,
  setSelectedType,
  selectedProvince,
  setSelectedProvince,
  searchTerm,
  setSearchTerm,
}: PropertyFilterProps) {
  const { t } = useTranslation()
  const [openProvince, setOpenProvince] = useState(false)

  const selectedProvinceName = t(
    `property.provinces.${selectedProvince || "all"}`
  )

  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenProvince(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <section className="border-b border-border sticky top-14 bg-body-bg-dark z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Search + Province */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("property.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-body-bg-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Custom Province Dropdown */}
          <div ref={dropdownRef} className="relative w-32">
            <button
              onClick={() => setOpenProvince(!openProvince)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-body-bg-dark flex items-center justify-between text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {selectedProvinceName}
              <ChevronDown className="w-4 h-4" />
            </button>

            {openProvince && (
              <ul className="absolute left-0 mt-1 w-full bg-body-bg-dark border border-gray-300 shadow-md z-50">

                {provinces.map((p) => {
                  const selected = selectedProvince === p.id

                  return (
                    <li
                      key={p.id}
                      onClick={() => {
                        setSelectedProvince(p.id)
                        setOpenProvince(false)
                      }}
                      className={`px-4 py-2 text-sm cursor-pointer
                        ${selected ? "bg-[#727272] text-white" : ""}
                        hover:bg-[#727272] hover:text-white`}
                    >
                      {t(`property.provinces.${p.id}`)}
                    </li>
                  )
                })}

              </ul>
            )}
          </div>
        </div>

        {/* Type Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {propertyTypes.map((type) => {
            const Icon = type.icon
            const isSelected = selectedType === type.id

            return (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-[#E8E6E1] text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                {t(`property.types.${type.id}`)}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}