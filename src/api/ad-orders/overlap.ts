import { addDuration } from "@/data/contactMockData"

export type ExistingOrderItem = {
  packageName: string
  pricingName: string
  startDate: string
  pricingId?: string
  durationValue?: number | null
  durationUnit?: string | null
}

export type NewOrderItem = {
  packageName: string
  pricingName: string
  startDate: string
  endDate: string
  pricingId?: string
}


function toMs(dateStr: string): number {
  const ms = Date.parse(dateStr)
  return Number.isNaN(ms) ? 0 : ms
}

function rangesOverlap(startA: number, endA: number, startB: number, endB: number): boolean {
  return startA < endB && endA > startB
}

function isSameSlot(newItem: NewOrderItem, existing: ExistingOrderItem): boolean {
  return String(newItem.packageName).trim().toLowerCase() === String(existing.packageName).trim().toLowerCase()
}

export function hasOverlapWithExistingOrders(
  existingItems: ExistingOrderItem[],
  newItems: NewOrderItem[]
): { overlap: boolean; suggestedDate?: Date } {
  let latestConflictEnd = 0

  for (const newItem of newItems) {
    if (!newItem.startDate?.trim()) continue
    const newStart = toMs(newItem.startDate)
    const newEnd = toMs(newItem.endDate?.trim() ? newItem.endDate : newItem.startDate)
    if (newStart === 0) continue

    for (const existing of existingItems) {
      if (!existing.startDate?.trim()) continue
      if (!isSameSlot(newItem, existing)) continue

      const existingStart = toMs(existing.startDate)
      const existingEnd =
        existing.durationValue && existing.durationUnit
          ? addDuration(new Date(existing.startDate), existing.durationValue, existing.durationUnit).getTime()
          : existingStart
      if (existingStart === 0) continue

      if (rangesOverlap(newStart, newEnd, existingStart, existingEnd)) {
        if (existingEnd > latestConflictEnd) latestConflictEnd = existingEnd
      }
    }
  }

  if (latestConflictEnd > 0) {
    return { overlap: true, suggestedDate: new Date(latestConflictEnd) }
  }
  return { overlap: false }
}
