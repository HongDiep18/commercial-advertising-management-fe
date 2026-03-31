"use client"

import { useTranslation } from "react-i18next"
import Checkbox from "@/components/ui/Checkbox"
import Card, { CardContent } from "@/components/ui/Card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

function normalizePackageTypeKey(type: string): string {
  const withUnderscores = type.replace(/-/g, "_").replace(/\s+/g, "_")
  if (/^[A-Z0-9_]+$/.test(withUnderscores)) return withUnderscores
  return withUnderscores
    .replace(/([A-Z])/g, (_, c: string) => `_${c}`)
    .replace(/^_/, "")
    .toUpperCase()
}

interface PricingItem {
  id: string
  name?: string
  position?: string
  item?: string
  description?: string
  duration?: string
  price: string
  discount?: string
  packageType?: string
  placementKey?: string
  durationValue?: number | null
  durationUnit?: string | null
  hint?: string
}

function PackageHint({ text }: { text: string }) {
  return (
    <span className="ml-2 inline-flex items-center align-middle" onClick={(e) => e.stopPropagation()}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex h-5 w-5 cursor-default items-center justify-center rounded-full bg-primary text-[11px] font-black text-white shadow-sm ring-2 ring-primary/30">
              !
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-64 whitespace-normal">
            {text}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </span>
  )
}

interface PricingTableProps {
  title: string
  items: PricingItem[]
  selectedItems: string[]
  onItemToggle: (itemId: string) => void
  columns: {
    select: boolean
    item: boolean
    description?: boolean
    duration: boolean
    price: boolean
  }
}

export default function PricingTable({
  title,
  items,
  selectedItems,
  onItemToggle,
  columns,
}: PricingTableProps) {
  const { t, i18n } = useTranslation()

  return (
    <Card className="border-border/50">
      <CardContent className="p-6 pt-9">
        <div className="mb-4 flex items-center justify-between">
          <h3 key={i18n.language} className="text-foreground text-lg font-bold">
            {title}
          </h3>
          <span className="text-muted-foreground text-xs">{t("adContact.unit")}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-body-bg-dark border-border bg-muted/50 border-b">
                {columns.select && (
                  <th className="w-10 px-3 py-3 text-left font-semibold whitespace-nowrap">
                    {t("adContact.select")}
                  </th>
                )}
                {columns.item && (
                  <th className="px-3 py-3 text-left font-semibold whitespace-nowrap">
                    {columns.description ? t("adContact.item") : t("adContact.adItem")}
                  </th>
                )}
                {columns.description && (
                  <th className="px-3 py-3 text-left font-semibold whitespace-nowrap">
                    {t("adContact.description")}
                  </th>
                )}
                {columns.duration && (
                  <th className="px-3 py-3 text-left font-semibold whitespace-nowrap">
                    {t("adContact.duration")}
                  </th>
                )}
                {columns.price && (
                  <th className="px-3 py-3 text-right font-semibold whitespace-nowrap">
                    {t("adContact.price")}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className={`border-border/90 hover:bg-body-bg-dark cursor-pointer border-b transition-colors ${
                    selectedItems.includes(item.id) ? "bg-primary/5" : ""
                  }`}
                  onClick={() => onItemToggle(item.id)}
                >
                  {columns.select && (
                    <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={() => onItemToggle(item.id)}
                      />
                    </td>
                  )}
                  {columns.item && (
                    <td className="px-3 py-3 font-medium">
                      <span className="inline-flex items-center">
                        {(() => {
                          const baseName = item.name || item.position || item.item
                          const isVietnamese =
                            i18n.language === "vi-VN" || i18n.language?.startsWith("vi")
                          if (isVietnamese && item.packageType) {
                            const typeKey = normalizePackageTypeKey(item.packageType)
                            if (typeKey === "PRINT_PLACEMENT" && item.placementKey) {
                              const placementKey = `adContact.pricing.platformItems.PRINT_PLACEMENT.${item.placementKey}`
                              const translated = t(placementKey)
                              if (translated !== placementKey) return translated
                            }
                            const key = `adContact.pricing.platformItems.${typeKey}.name`
                            const translated = t(key)
                            return translated !== key ? translated : baseName
                          }
                          return baseName
                        })()}
                        {item.hint && <PackageHint text={item.hint} />}
                      </span>
                    </td>
                  )}
                  {columns.description && (
                    <td className="text-muted-foreground px-3 py-3">{item.description}</td>
                  )}
                  {columns.duration && (
                    <td className="px-3 py-3">
                      {(() => {
                        if (item.durationValue != null && item.durationUnit) {
                          const unitKey = `adContact.durationUnit.${item.durationUnit}`
                          const unitLabel = t(unitKey)
                          if (unitLabel !== unitKey) {
                            return `${item.durationValue} ${unitLabel}`
                          }
                        }
                        return item.duration
                      })()}
                      {item.discount && (
                        <span className="bg-primary/10 text-primary ml-2 rounded px-2 py-0.5 text-xs">
                          {t("adContact.discount")} {item.discount}
                        </span>
                      )}
                    </td>
                  )}
                  {columns.price && (
                    <td className="px-3 py-3 text-right font-medium">{item.price}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
