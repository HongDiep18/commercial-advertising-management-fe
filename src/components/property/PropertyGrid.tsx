"use client"

import { MapPin, Ruler, Building2, Phone, Factory, Warehouse, Home, Landmark, TreePine } from "lucide-react"
import Button from "@/components/ui/Button"
import { useTranslation } from "react-i18next"

export const propertyTypes = [
  { id: "all", name: "全部類型" },
  { id: "land", name: "土地" },
  { id: "factory", name: "廠房" },
  { id: "warehouse", name: "倉庫" },
  { id: "house", name: "住宅" },
  { id: "office", name: "辦公室" },
]

export const provinces = [
  { id: "all", name: "全部地區" },
  { id: "hcm", name: "胡志明市" },
  { id: "hanoi", name: "河內" },
  { id: "binh-duong", name: "平陽省" },
  { id: "dong-nai", name: "同奈省" },
  { id: "long-an", name: "隆安省" },
  { id: "ba-ria", name: "巴地頭頓省" },
]

export const mockProperties = [
  {
    id: "prop-1",
    title: "property.mock.prop1.title",
    type: "factory",
    province: "binh-duong",
    provinceName: "property.province.binhDuong",
    area: "5,000",
    areaUnit: "m²",
    description: "property.mock.prop1.description",
    images: ["assets/images/sticky-bottom/modern-manufacturing-facility.png"],
    features: [
      "property.mock.prop1.features.fire",
      "property.mock.prop1.features.water",
      "property.mock.prop1.features.security",
      "property.mock.prop1.features.dorm",
    ],
  },
  {
    id: "prop-2",
    title: "property.mock.prop2.title",
    type: "land",
    province: "dong-nai",
    provinceName: "property.province.dongNai",
    area: "20,000",
    areaUnit: "m²",
    description: "property.mock.prop2.description",
    images: ["assets/images/sticky-bottom/solar-panels-green-energy.jpg"],
    features: [
      "property.mock.prop2.features.infrastructure",
      "property.mock.prop2.features.usage",
      "property.mock.prop2.features.license",
      "property.mock.prop2.features.transport",
    ],
  },
]

export function getTypeName(type: string, t: any) {
  return t(`property.types.${type}`)
}

export function getTypeColor(type: string) {
  switch (type) {
    case "land":
      return "bg-green-100 text-green-700"
    case "factory":
      return "bg-blue-100 text-blue-700"
    case "warehouse":
      return "bg-amber-100 text-amber-700"
    case "house":
      return "bg-rose-100 text-rose-700"
    case "office":
      return "bg-indigo-100 text-indigo-700"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export function getTypeIcon(type: string) {
  switch (type) {
    case "land":
      return TreePine
    case "factory":
      return Factory
    case "warehouse":
      return Warehouse
    case "house":
      return Home
    case "office":
      return Landmark
    default:
      return Building2
  }
}

type PropertyGridProps = {
  properties: typeof mockProperties
  onContact: (id: string) => void
  onDetail: (id: string) => void
  onClearFilter: () => void
}

export default function PropertyGrid({
  properties,
  onContact,
  onDetail,
  onClearFilter,
}: PropertyGridProps) {
  const { t } = useTranslation()
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          {t("property.grid.total", { count: properties.length })}
        </p>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-[#E8E6E1] flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-2">
            {t("property.grid.emptyTitle")}
          </p>
          <Button 
            variant="outline" size="sm" onClick={onClearFilter}
            className="!border-gray-300 hover:!bg-header-red-dark hover:!text-white"
          >
            {t("property.grid.clearFilter")}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => {
            const TypeIcon = getTypeIcon(property.type)

            return (
              <div
                key={property.id}
                className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  <img
                    src={property.images[0] || "/placeholder.svg"}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${getTypeColor(
                        property.type
                      )}`}
                    >
                      <TypeIcon className="w-3 h-3" />
                      {getTypeName(property.type, t)}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-foreground mb-2 line-clamp-2">
                    {t(property.title)}
                  </h3>

                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{t(property.provinceName)}</span>
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Ruler className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="font-medium text-foreground">
                        {property.area} {t("property.grid.areaUnit")}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {t(property.description)}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {property.features.map((f) => (
                      <span
                        key={f}
                        className="px-2 py-0.5 text-xs bg-[#E8E6E1] text-muted-foreground rounded"
                      >
                        {t(f)}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 !bg-header-red-dark !text-white hover:!bg-header-red-dark/90"
                      onClick={() => onContact(property.id)}
                    >
                      <Phone className="w-3.5 h-3.5 mr-1.5" />
                      {t("property.grid.contactSeller")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 !bg-body-bg-dark !text-foreground hover:!bg-header-red-dark hover:!text-white"
                      onClick={() => onDetail(property.id)}
                    >
                      {t("property.grid.detail")}
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}