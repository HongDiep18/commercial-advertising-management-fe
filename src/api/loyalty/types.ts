import { MembershipTier } from "@/types/membership"

export enum PointsSource {
  REGISTRATION = "REGISTRATION",
  LOGO_UPLOAD = "LOGO_UPLOAD",
  AD_PURCHASE = "AD_PURCHASE",
  STORE_PURCHASE = "STORE_PURCHASE",
  ADMIN_ADJUSTMENT = "ADMIN_ADJUSTMENT",
  ADMIN_DEDUCTION = "ADMIN_DEDUCTION",
}

export { MembershipTier }

export interface PointsTransaction {
  id: string
  userId: string
  points: number
  balance: number
  source: PointsSource
  description: string
  metadata?: Record<string, any>
  createdAt: string
}

export interface PointsBalanceResponse {
  userId: string
  loyaltyPoints: number
  totalSpending: string // BigInt as string
  currentTier: MembershipTier
  updatedAt: string
}

export interface TierInfoResponse {
  currentTier: MembershipTier
  currentPoints: number
  currentSpending: string // BigInt as string
  nextTier: MembershipTier | null
  pointsToNextTier: number | null
  spendingToNextTier: string | null
}

export interface PointsHistoryResponse {
  data: PointsTransaction[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface PointsHistoryQuery {
  page?: number
  limit?: number
  source?: PointsSource
}
