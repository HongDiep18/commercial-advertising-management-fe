import type { User } from "@/contexts/user-context"
import { MEMBERSHIP_THRESHOLDS, MembershipTier, UserRole } from "@/contexts/user-context"

export type AuthUserFromApi = {
  id: string
  email: string
  name?: string
  role?: string
  membershipTier?: string
  companyId?: string | null
  primaryIndustry?: string | null
  selectedIndustries?: string[]
}

export type LoginUserPayload = {
  id: string
  email: string
  name?: string
  role?: string
  membershipTier?: string
  companyId?: string | null
  primaryIndustry?: string | null
  selectedIndustries?: string[]
}

export type LoginResponse = {
  success?: boolean
  message?: string
  data?: {
    user?: AuthUserFromApi
    token?: string
  }
  token?: string
  user?: AuthUserFromApi
}

export function isLoginSuccess(res: LoginResponse): boolean {
  if (res.success === false) return false
  return true
}

export function getLoginErrorMessage(res: LoginResponse): string {
  return res.message ?? ""
}

const API_TIER_TO_MEMBERSHIP: Record<string, MembershipTier> = {
  GUEST: MembershipTier.GUEST,
  BRONZE: MembershipTier.BRONZE,
  SILVER: MembershipTier.SILVER,
  GOLD: MembershipTier.GOLD,
  DIAMOND: MembershipTier.DIAMOND,
}

export function mapApiUserToUser(payload: LoginUserPayload, email: string): User {
  const rawRole = (payload.role ?? "").toLowerCase()

  let role: UserRole
  if (rawRole === "admin" || rawRole === "administrator") {
    role = UserRole.Admin
  } else if (rawRole === "super_admin") {
    role = UserRole.SuperAdmin
  } else if (rawRole === "guest") {
    role = UserRole.Guest
  } else if (rawRole === "free" || rawRole === "bronze") {
    role = UserRole.Free
  } else {
    role = UserRole.Free
  }

  const rawTier = (payload.membershipTier ?? "").toUpperCase()
  const membershipTier = API_TIER_TO_MEMBERSHIP[rawTier] ?? MembershipTier.GUEST

  return {
    id: payload.id,
    companyId: payload.companyId ?? null,
    email: payload.email ?? email,
    name: payload.name ?? payload.email?.split("@")[0] ?? email.split("@")[0] ?? "User",
    role,
    membershipTier,
    primaryIndustry: payload.primaryIndustry ?? null,
    selectedIndustries: payload.selectedIndustries ?? [],
  }
}

export function extractUserFromLoginResponse(
  res: LoginResponse,
  fallbackEmail: string
): LoginUserPayload | null {
  const apiUser = res?.data?.user ?? res?.user
  if (!apiUser || typeof apiUser !== "object") return null
  const u = apiUser as AuthUserFromApi
  if (!u.id && !u.email) return null
  const apiCompanyId =
    (typeof u.companyId === "string" && u.companyId.trim() ? u.companyId : undefined) ?? undefined
  return {
    id: u.id || `api-${fallbackEmail}`,
    email: u.email ?? fallbackEmail,
    name: u.name,
    role: u.role,
    membershipTier: u.membershipTier,
    companyId: apiCompanyId ?? null,
    primaryIndustry: u.primaryIndustry ?? null,
    selectedIndustries: u.selectedIndustries ?? [],
  }
}
