export enum MembershipTier {
  GUEST = "NONE",
  BRONZE = "BRONZE",
  SILVER = "SILVER",
  GOLD = "GOLD",
  DIAMOND = "DIAMOND",
}

export type MembershipConfigEntry = {
  label: string
  labelEn: string
  minPoints: number
  maxPoints: number | null
  spendingRequired: string
  color: string
  bgColor: string
  benefits: string[]
  restrictions: string[]
}

export type MembershipConfig = Record<MembershipTier, MembershipConfigEntry>

export type MembershipThresholds = Record<MembershipTier, number>

export type NextTierInfo = {
  nextTier: MembershipTier | null
  pointsNeeded: number
}

export type GetMembershipTierFn = (totalPoints: number) => MembershipTier

export type GetNextTierInfoFn = (totalPoints: number) => NextTierInfo | null
