import { getDurationMonths, addMonths } from "@/data/contactMockData"

export type ExistingOrderItem = {
  packageName: string
  pricingName: string
  startDate: string
  pricingId?: string
}

export type NewOrderItem = {
  packageName: string
  pricingName: string
  startDate: string
  endDate: string
  pricingId?: string
}

function normalizedSlotKey(packageName: string, pricingName: string): string {
  return `${String(packageName).trim().toLowerCase()}|${String(pricingName).trim().toLowerCase()}`
}

function getEndDateFromPricingName(startDate: string, pricingName: string): string {
  const months = getDurationMonths(pricingName)
  return months > 0 ? addMonths(startDate, months) : startDate
}

function toMs(dateStr: string): number {
  const ms = Date.parse(dateStr)
  return Number.isNaN(ms) ? 0 : ms
}

function rangesOverlap(startA: number, endA: number, startB: number, endB: number): boolean {
  return startA < endB && endA > startB
}

function isSameSlot(newItem: NewOrderItem, existing: ExistingOrderItem): boolean {
  if (
    newItem.pricingId != null &&
    newItem.pricingId !== "" &&
    existing.pricingId != null &&
    existing.pricingId !== ""
  ) {
    return newItem.pricingId === existing.pricingId
  }
  return (
    normalizedSlotKey(newItem.packageName, newItem.pricingName) ===
    normalizedSlotKey(existing.packageName, existing.pricingName)
  )
}

export function hasOverlapWithExistingOrders(
  existingItems: ExistingOrderItem[],
  newItems: NewOrderItem[]
): boolean {
  for (const newItem of newItems) {
    if (!newItem.startDate?.trim()) continue
    const newStart = toMs(newItem.startDate)
    const newEnd = toMs(newItem.endDate?.trim() ? newItem.endDate : newItem.startDate)
    if (newStart === 0) continue

    for (const existing of existingItems) {
      if (!existing.startDate?.trim()) continue
      if (!isSameSlot(newItem, existing)) continue

      const existingStart = toMs(existing.startDate)
      const existingEnd = toMs(getEndDateFromPricingName(existing.startDate, existing.pricingName))
      if (existingStart === 0) continue

      if (rangesOverlap(newStart, newEnd, existingStart, existingEnd)) return true
    }
  }
  return false
}
