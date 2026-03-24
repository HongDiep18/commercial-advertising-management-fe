"use client"

import { useMemo, useState } from "react"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { useDebounce } from "@/hooks/useDebounce"
import { usePublishedProperties, usePublishedPropertyDetail } from "@/api/properties/hooks"
import type { PropertiesListQuery, PropertyResponse, PropertyType } from "@/api/properties/types"

import PropertyHero from "@/components/property/PropertyHero"
import PropertyFilter from "@/components/property/PropertyFilter"
import PropertyGrid, {
  getTypeName,
  getTypeColor,
} from "@/components/property/PropertyGrid"
import PropertyModals from "@/components/property/PropertyModals"

const EMPTY_PROPERTIES: PropertyResponse[] = []

function mapSelectedTypeToApiType(selectedType: string): PropertyType | undefined {
  switch (selectedType) {
    case "land":
      return "LAND"
    case "factory":
      return "FACTORY"
    case "warehouse":
      return "WAREHOUSE"
    case "house":
      return "HOUSE"
    case "office":
      return "OFFICE"
    default:
      return undefined
  }
}

export default function PropertyPage() {
  const [selectedType, setSelectedType] = useState("all")
  const [selectedProvince, setSelectedProvince] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const [contactId, setContactId] = useState<string | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const query = useMemo<PropertiesListQuery>(
    () => ({
      page: 1,
      limit: 100,
      search: debouncedSearchTerm.trim() || undefined,
      type: mapSelectedTypeToApiType(selectedType),
      province: selectedProvince === "all" ? undefined : selectedProvince,
      sortBy: "createdAt",
      sortOrder: "desc",
    }),
    [debouncedSearchTerm, selectedProvince, selectedType]
  )

  const {
    data: propertiesData,
    isLoading: isLoadingProperties,
    isError: isPropertiesError,
    refetch: refetchProperties,
  } = usePublishedProperties(query)

  const properties = propertiesData?.properties ?? EMPTY_PROPERTIES

  const { data: detailPropertyData } = usePublishedPropertyDetail(detailId ?? "", Boolean(detailId))

  const contactProperty = useMemo(
    () =>
      (contactId &&
        (properties.find((p) => p.id === contactId) ||
          (detailPropertyData?.id === contactId ? detailPropertyData : null))) ||
      null,
    [contactId, detailPropertyData, properties]
  )

  const detailProperty = useMemo(
    () => detailPropertyData || properties.find((p) => p.id === detailId) || null,
    [detailId, detailPropertyData, properties]
  )

  return (
    <main className="bg-body-bg-dark min-h-screen">
      <Header />

      <div className="pt-14">
        <PropertyHero />

        <PropertyFilter
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          selectedProvince={selectedProvince}
          setSelectedProvince={setSelectedProvince}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        <PropertyGrid
          properties={properties}
          isLoading={isLoadingProperties}
          isError={isPropertiesError}
          onRetry={() => {
            void refetchProperties()
          }}
          onContact={(id) => setContactId(id)}
          onDetail={(id) => setDetailId(id)}
          onClearFilter={() => {
            setSelectedType("all")
            setSelectedProvince("all")
            setSearchTerm("")
          }}
        />
      </div>

      <Footer />

      <PropertyModals
        contactProperty={contactProperty}
        detailProperty={detailProperty}
        getTypeName={getTypeName}
        getTypeColor={getTypeColor}
        onCloseContact={() => setContactId(null)}
        onCloseDetail={() => setDetailId(null)}
        onOpenContact={(id) => setContactId(id)}
      />
    </main>
  )
}
