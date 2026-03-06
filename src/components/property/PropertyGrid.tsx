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
    title: "平陽省工業區標準廠房出租",
    type: "factory",
    province: "binh-duong",
    provinceName: "平陽省",
    area: "5,000",
    areaUnit: "m²",
    description:
      "位於平陽省VSIP工業區內，全新標準廠房，配備完善消防及排水系統。適合電子組裝、輕工業製造等用途。園區提供24小時保全、餐廳及員工宿舍。",
    images: ["assets/images/sticky-bottom/modern-manufacturing-facility.png"],
    features: ["消防系統", "排水系統", "24小時保全", "員工宿舍"],
    contact: { name: "陳先生", phone: "+84-274-xxx-xxxx", email: "factory@vnbuyerguide.com" },
  },
  {
    id: "prop-2",
    title: "同奈省工業用地出售",
    type: "land",
    province: "dong-nai",
    provinceName: "同奈省",
    area: "20,000",
    areaUnit: "m²",
    description:
      "同奈省Nhon Trach工業區二期，已完成三通一平（水、電、路），地勢平坦，適合建設大型製造工廠。50年土地使用權，可辦理投資證書。",
    images: ["assets/images/sticky-bottom/solar-panels-green-energy.jpg"],
    features: ["三通一平", "50年使用權", "可辦投資證", "交通便利"],
    contact: { name: "黃小姐", phone: "+84-251-xxx-xxxx", email: "land@vnbuyerguide.com" },
  },
  {
    id: "prop-3",
    title: "胡志明市第七郡辦公室出租",
    type: "office",
    province: "hcm",
    provinceName: "胡志明市",
    area: "200",
    areaUnit: "m²",
    description:
      "富美興商業區A級辦公大樓，高樓層景觀佳。含管理費、基本裝潢，獨立空調。鄰近國際學校、醫院及購物中心，交通便利。",
    images: ["assets/images/sticky-bottom/modern-manufacturing-facility.png"],
    features: ["A級大樓", "含管理費", "獨立空調", "景觀佳"],
    contact: { name: "林小姐", phone: "+84-28-xxxx-xxxx", email: "office@vnbuyerguide.com" },
  },
  {
    id: "prop-4",
    title: "隆安省大型倉庫出租",
    type: "warehouse",
    province: "long-an",
    provinceName: "隆安省",
    area: "8,000",
    areaUnit: "m²",
    description:
      "位於隆安省工業區，鄰近胡志明市，交通便利可直達各港口。鋼結構建築，層高12米，配備裝卸碼頭及大型車輛停放區。適合物流、倉儲及輕加工。",
    images: ["assets/images/sticky-bottom/modern-manufacturing-facility.png"],
    features: ["層高12米", "裝卸碼頭", "停車場", "近港口"],
    contact: { name: "張先生", phone: "+84-272-xxx-xxxx", email: "warehouse@vnbuyerguide.com" },
  },
  {
    id: "prop-5",
    title: "胡志明市第二郡別墅出售",
    type: "house",
    province: "hcm",
    provinceName: "胡志明市",
    area: "350",
    areaUnit: "m²",
    description:
      "守德市高級別墅社區，4房3衛，附花園及私人泳池。社區管理完善，24小時保全，鄰近國際學校及高爾夫球場。適合台商家庭居住。",
    images: ["assets/images/sticky-bottom/solar-panels-green-energy.jpg"],
    features: ["4房3衛", "私人泳池", "花園", "24小時保全"],
    contact: { name: "王小姐", phone: "+84-28-xxxx-xxxx", email: "house@vnbuyerguide.com" },
  },
  {
    id: "prop-6",
    title: "巴地頭頓省海景廠房用地",
    type: "land",
    province: "ba-ria",
    provinceName: "巴地頭頓省",
    area: "50,000",
    areaUnit: "m²",
    description:
      "鄰近蓋梅深水港，已完成基礎設施建設。適合石化、鋼鐵、大型製造業。可申請進出口加工區優惠政策，享有稅務減免。",
    images: ["assets/images/sticky-bottom/solar-panels-green-energy.jpg"],
    features: ["近深水港", "稅務減免", "基礎設施完善", "大面積"],
    contact: { name: "劉先生", phone: "+84-254-xxx-xxxx", email: "port-land@vnbuyerguide.com" },
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
                    {property.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{property.provinceName}</span>
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
                    {property.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {property.features.map((f) => (
                      <span
                        key={f}
                        className="px-2 py-0.5 text-xs bg-[#E8E6E1] text-muted-foreground rounded"
                      >
                        {f}
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