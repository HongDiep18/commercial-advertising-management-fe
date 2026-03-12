import type { PublicAdPackageCategoryItem, PublicAdPackagePricingItem } from "./types"

export type PlatformCatalogItem = {
  id: string
  name: string
  duration: string
  price: string
  packageId: string
  pricingId: string
  categoryId: string
  categoryName: string
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

export function flattenPlatformCatalog(
  categories: PublicAdPackageCategoryItem[]
): PlatformCatalogItem[] {
  const rows: PlatformCatalogItem[] = []

  for (const category of categories) {
    if (!category.isActive) continue
    const categoryName = category.nameZh ?? category.name

    for (const pkg of category.packages ?? []) {
      if (!pkg.isActive) continue
      const packageName = pkg.nameZh ?? pkg.name

      for (const pricing of pkg.pricing ?? []) {
        if (!pricing.isActive) continue
        rows.push({
          id: pricing.id,
          name: packageName,
          duration: formatDuration(pricing),
          price: formatPriceVnd(pricing.finalPrice),
          packageId: pkg.id,
          pricingId: pricing.id,
          categoryId: category.id,
          categoryName,
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
