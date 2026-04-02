import type { AdPackageFormConfig, PublicAdPackageCategoryItem, PublicAdPackagePricingItem } from "./types"

export type PlatformCatalogItem = {
  id: string
  name: string
  duration: string
  price: string
  packageId: string
  pricingId: string
  categoryId: string
  categoryName: string
  packageType?: string
  categoryType?: string
  placementKey?: string
  durationValue?: number | null
  durationUnit?: string | null
  formConfig?: AdPackageFormConfig
}

const DURATION_PLURALS: Record<string, string> = {
  day: "days",
  week: "weeks",
  month: "months",
  year: "years",
}

function formatDuration(pricing: PublicAdPackagePricingItem): string {
  const v = pricing.durationValue
  const u = pricing.durationUnit?.toLowerCase() ?? ""
  if (v == null || v === 0) return "—"
  const unit =
    u in DURATION_PLURALS
      ? v === 1
        ? u
        : DURATION_PLURALS[u]
      : `${u || "unit"}${v === 1 ? "" : "s"}`
  return `${v} ${unit}`
}

function formatPriceVnd(finalPrice: number): string {
  return finalPrice.toLocaleString("en-US")
}

function isChineseLocale(locale: string): boolean {
  return locale.startsWith("zh")
}

function pickName(
  nameEn: string | null | undefined,
  nameZh: string | null | undefined,
  locale: string
): string {
  const useChinese = isChineseLocale(locale)
  if (useChinese && nameZh) return nameZh
  if (nameEn) return nameEn
  return nameZh ?? ""
}

function buildPrintPlacementKey(metadata: Record<string, unknown> | null): string | undefined {
  if (!metadata) return undefined
  const pos = metadata.page_position as string | undefined
  if (!pos) return undefined
  const side = metadata.page_side as string | undefined
  const size = metadata.page_size as string | undefined
  const color = metadata.color_type as string | undefined
  const parts: string[] = [pos]
  if (side) parts.push(side)
  if (size && (pos === "next_to_toc" || pos === "inner_page" || size !== "full")) parts.push(size)
  if (color) parts.push(color)
  return parts.join("_").replace(/-/g, "_")
}

export function flattenPlatformCatalog(
  categories: PublicAdPackageCategoryItem[],
  locale: string
): PlatformCatalogItem[] {
  const rows: PlatformCatalogItem[] = []

  for (const category of categories) {
    if (!category.isActive) continue
    const categoryName = pickName(category.name, category.nameZh, locale)

    for (const pkg of category.packages ?? []) {
      if (!pkg.isActive) continue
      const packageName = pickName(pkg.name, pkg.nameZh, locale)

      for (const pricing of pkg.pricing ?? []) {
        if (!pricing.isActive) continue
        const placementKey =
          pkg.type === "PRINT_PLACEMENT" ? buildPrintPlacementKey(pkg.metadata ?? null) : undefined
        rows.push({
          id: pricing.id,
          name: packageName,
          duration: formatDuration(pricing),
          price: formatPriceVnd(pricing.finalPrice),
          packageId: pkg.id,
          pricingId: pricing.id,
          categoryId: category.id,
          categoryName,
          packageType: pkg.type,
          categoryType: category.type,
          placementKey,
          durationValue: pricing.durationValue,
          durationUnit: pricing.durationUnit,
          formConfig: pkg.formConfig,
        })
      }
    }
  }

  return rows
}

export function groupPlatformByCategory(
  items: PlatformCatalogItem[]
): { categoryKey: string; categoryName: string; items: PlatformCatalogItem[] }[] {
  const byCategory = new Map<string, PlatformCatalogItem[]>()
  const order: string[] = []

  for (const item of items) {
    if (!byCategory.has(item.categoryId)) {
      byCategory.set(item.categoryId, [])
      order.push(item.categoryId)
    }
    byCategory.get(item.categoryId)!.push(item)
  }

  return order.map((categoryId) => ({
    categoryKey: categoryId,
    categoryName: byCategory.get(categoryId)![0].categoryName,
    items: byCategory.get(categoryId)!,
  }))
}
