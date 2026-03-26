import type { MembershipTier, NextTierInfo } from "./membership"

export enum UserRole {
  Guest = "guest",
  Free = "free",
  Paid = "paid",
  Admin = "admin",
  SuperAdmin = "SUPER_ADMIN",
}

export type User = {
  id: string
  companyId: string | null
  email: string
  name?: string
  role: UserRole
  membershipTier: MembershipTier
  primaryIndustry: string | null
  selectedIndustries: string[]
  createdAt?: string // TODO: check why remove createdAt from User type causes issue
}

export type SetUserFn = (user: User | null) => void

export type LoginWithEmailFn = (email: string, password: string) => void

export type LoginWithRegisteredUserFn = (
  email: string,
  name: string,
  membershipTier: MembershipTier
) => void

export type LogoutFn = () => void

export type GetTotalPointsFn = () => number

export type GetMemberTierFn = () => MembershipTier

export type GetNextTierFn = () => NextTierInfo | null

export type CanViewPhoneFn = () => boolean

export type CanViewWebsiteFn = () => boolean

export type CanViewEmailFn = () => boolean

export type CanDownloadDirectoryFn = () => boolean

export type GetUpgradeProgressFn = () => number

export enum FeatureKey {
  AdminPanel = "adminPanel",
  DownloadDirectory = "downloadDirectory",
  AdPackageManagement = "adPackageManagement",
}

export type FeatureKeyType = FeatureKey

export type CanUseFeatureFn = (feature: FeatureKey) => boolean

export type UserContextType = {
  user: User | null
  isLoggedIn: boolean
  isAuthReady: boolean
  setUser: SetUserFn
  loginWithEmail: LoginWithEmailFn
  loginWithRegisteredUser: LoginWithRegisteredUserFn
  logout: LogoutFn
  getTotalPoints: GetTotalPointsFn
  getMemberTier: GetMemberTierFn
  getNextTier: GetNextTierFn
  canViewPhone: CanViewPhoneFn
  canViewWebsite: CanViewWebsiteFn
  canViewEmail: CanViewEmailFn
  canDownloadDirectory: CanDownloadDirectoryFn
  getUpgradeProgress: GetUpgradeProgressFn
  canUseFeature: CanUseFeatureFn
}
