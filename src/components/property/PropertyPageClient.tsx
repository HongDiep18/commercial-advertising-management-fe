"use client"

import { useMemo, useState } from "react"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"

import PropertyHero from "@/components/property/PropertyHero"
import PropertyFilter from "@/components/property/PropertyFilter"
import PropertyGrid, {
  mockProperties,
  getTypeName,
  getTypeColor,
} from "@/components/property/PropertyGrid"
import PropertyModals from "@/components/property/PropertyModals"

export default function PropertyPage() {
  const [selectedType, setSelectedType] = useState("all")
  const [selectedProvince, setSelectedProvince] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const [contactId, setContactId] = useState<string | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)

  const filteredProperties = useMemo(() => {
    return mockProperties.filter((p) => {
      const matchType = selectedType === "all" || p.type === selectedType
      const matchProvince = selectedProvince === "all" || p.province === selectedProvince
      const matchSearch =
        !searchTerm ||
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.provinceName.includes(searchTerm)

      return matchType && matchProvince && matchSearch
    })
  }, [selectedType, selectedProvince, searchTerm])

  const contactProperty = useMemo(
    () => mockProperties.find((p) => p.id === contactId) || null,
    [contactId]
  )

  const detailProperty = useMemo(
    () => mockProperties.find((p) => p.id === detailId) || null,
    [detailId]
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
          properties={filteredProperties}
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
