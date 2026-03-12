"use client"

import { useTranslation } from "react-i18next"
import { directoryPricing, platformPricing, productPricing } from "@/data/contactMockData"
import { TabType } from "@/utils/contactHelpers"
import Card, { CardContent } from "@/components/ui/Card"
import Checkbox from "@/components/ui/Checkbox"
import PricingTable from "./PricingTable"
import {
  groupPlatformByCategory,
  type PlatformCatalogItem,
} from "@/api/ads-pricing/contactPlatform"

interface PricingSectionProps {
  activeTab: TabType
  selectedItems: string[]
  onItemToggle: (itemId: string) => void
  platformCatalogItems?: PlatformCatalogItem[]
}

export default function PricingSection({
  activeTab,
  selectedItems,
  onItemToggle,
  platformCatalogItems = [],
}: PricingSectionProps) {
  const { t, i18n } = useTranslation()

  if (activeTab === "platform") {
    const useApiCatalog = platformCatalogItems.length > 0
    const categories = useApiCatalog
      ? groupPlatformByCategory(platformCatalogItems)
      : Object.entries(platformPricing).map(([categoryKey, category]) => ({
          categoryKey,
          categoryName: t(`adContact.pricing.${categoryKey}.title`),
          items: category.items.map((item) => ({
            id: item.id,
            name: t(`adContact.pricing.platformItems.${item.id}.name`) || item.name,
            duration: t(`adContact.pricing.platformItems.${item.id}.duration`) || item.duration,
            price: item.price,
          })),
        }))

    return (
      <div className="space-y-6">
        {categories.map((cat) => (
          <PricingTable
            key={cat.categoryKey}
            title={cat.categoryName}
            items={cat.items}
            selectedItems={selectedItems}
            onItemToggle={onItemToggle}
            columns={{
              select: true,
              item: true,
              duration: true,
              price: true,
            }}
          />
        ))}

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p key={i18n.language} className="font-700 text-sm text-amber-800">
            <p>{t("adContact.note")}</p>
          </p>
        </div>
      </div>
    )
  }

  if (activeTab === "directory") {
    return (
      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between pt-7">
            <h3 className="text-foreground text-lg font-bold">
              {t("adContact.pricing.directory.title")}
            </h3>
            <span className="text-muted-foreground text-xs">{t("adContact.unit")}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-gray-500">
                  <th className="w-10 px-3 py-3 text-left font-semibold whitespace-nowrap">
                    {t("adContact.select")}
                  </th>
                  <th className="px-3 py-3 text-left font-semibold whitespace-nowrap">
                    {t("adContact.pagePosition")}
                  </th>
                  <th className="px-3 py-3 text-right font-semibold whitespace-nowrap">
                    {t("adContact.price")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {directoryPricing.map((item) => (
                  <tr
                    key={item.id}
                    className={`border-border/50 hover:bg-body-bg-dark cursor-pointer border-b transition-colors ${
                      selectedItems.includes(item.id) ? "bg-primary/5" : ""
                    }`}
                    onClick={() => onItemToggle(item.id)}
                  >
                    <td className="px-3 py-3">
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={() => onItemToggle(item.id)}
                      />
                    </td>
                    <td className="px-3 py-3">
                      {t(`adContact.pricing.directoryPositions.${item.id}`) || item.position}
                    </td>
                    <td className="px-3 py-3 text-right font-medium">{item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-muted/50 text-muted-foreground mt-4 space-y-2 rounded-lg p-4 text-sm">
            <p key={i18n.language}>
              <strong>一、</strong>
              {t("adContact.directoryNotes.note1")}
            </p>
            <p key={`${i18n.language}-2`}>
              <strong>二、</strong>
              {t("adContact.directoryNotes.note2")}
            </p>
            <p key={`${i18n.language}-3`}>
              <strong>三、</strong>
              {t("adContact.directoryNotes.note3")}
            </p>
            <p key={`${i18n.language}-4`}>
              <strong>四、</strong>
              {t("adContact.directoryNotes.note4")}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between pt-7">
            <h3 key={i18n.language} className="text-foreground text-lg font-bold">
              {t("adContact.pricing.product.title")}
            </h3>
            <span className="text-muted-foreground text-xs">{t("adContact.unit")}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-border bg-muted/50 border-b">
                  <th className="w-10 px-3 py-3 text-left font-semibold whitespace-nowrap">
                    {t("adContact.select")}
                  </th>
                  <th className="px-3 py-3 text-left font-semibold whitespace-nowrap">
                    {t("adContact.item")}
                  </th>
                  <th className="px-3 py-3 text-left font-semibold whitespace-nowrap">
                    {t("adContact.description")}
                  </th>
                  <th className="px-3 py-3 text-left font-semibold whitespace-nowrap">
                    {t("adContact.duration")}
                  </th>
                  <th className="px-3 py-3 text-right font-semibold whitespace-nowrap">
                    {t("adContact.price")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {productPricing.map((item) => (
                  <tr
                    key={item.id}
                    className={`border-border/50 hover:bg-primary/5 cursor-pointer border-b transition-colors ${
                      selectedItems.includes(item.id) ? "bg-primary/5" : ""
                    }`}
                    onClick={() => onItemToggle(item.id)}
                  >
                    <td className="px-3 py-3">
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={() => onItemToggle(item.id)}
                      />
                    </td>
                    <td className="px-3 py-3 font-medium">
                      {t(`adContact.pricing.productItems.${item.id}.item`) || item.item}
                    </td>
                    <td className="text-muted-foreground px-3 py-3">
                      {t(`adContact.pricing.productItems.${item.id}.description`) ||
                        item.description}
                    </td>
                    <td className="px-3 py-3">
                      {t(`adContact.pricing.productItems.${item.id}.duration`) || item.duration}
                      {"discount" in item && item.discount && (
                        <span className="bg-primary/10 text-primary ml-2 rounded px-2 py-0.5 text-xs">
                          {t("adContact.discount")} {item.discount}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right font-medium">{item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
