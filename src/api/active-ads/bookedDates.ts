import { api } from "@/lib/api"

export type BookedDateRange = {
  startDate: string
  endDate: string | null
}

export type BookedDatesResponse = {
  packageType: string
  capacity: number
  fullyBookedRanges: BookedDateRange[]
}

export const SLOT_PACKAGE_TYPES = ["POPUP_PRIORITY_SLOT", "POPUP_ROTATION_SLOT"] as const

export function isSlotPackageType(packageType: string | undefined): boolean {
  return !!packageType && (SLOT_PACKAGE_TYPES as readonly string[]).includes(packageType)
}

export async function getBookedDates(packageType: string): Promise<BookedDatesResponse> {
  const qs = new URLSearchParams({ packageType })
  return api.request<BookedDatesResponse>(`/ads/booked-dates?${qs}`)
}
