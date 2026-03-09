import { UserRole, MEMBERSHIP_THRESHOLDS, MembershipTier } from "@/contexts/user-context"
import type { User } from "@/contexts/user-context"

export type AuthUserFromApi = {
  id: string
  email: string
  name?: string
  role?: string
  contributionPoints?: number
  commercialPoints?: number
  createdAt?: string
}

export type LoginUserPayload = {
  id: string
  email: string
  name?: string
  role?: string
  contributionPoints?: number
  commercialPoints?: number
  createdAt?: string
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
  bronze: MembershipTier.Bronze,
  silver: MembershipTier.Silver,
  gold: MembershipTier.Gold,
  diamond: MembershipTier.Diamond,
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

  const apiTier = API_TIER_TO_MEMBERSHIP[rawRole]
  const contributionPoints =
    payload.contributionPoints ?? (apiTier ? MEMBERSHIP_THRESHOLDS[apiTier] : 0)
  const commercialPoints = payload.commercialPoints ?? 0

  return {
    id: payload.id,
    email: payload.email ?? email,
    name: payload.name ?? payload.email?.split("@")[0] ?? email.split("@")[0] ?? "User",
    role,
    contributionPoints,
    commercialPoints,
    createdAt: payload.createdAt ?? new Date().toISOString().slice(0, 10),
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
  return {
    id: u.id || `api-${fallbackEmail}`,
    email: u.email ?? fallbackEmail,
    name: u.name,
    role: u.role,
    contributionPoints: u.contributionPoints,
    commercialPoints: u.commercialPoints,
    createdAt: u.createdAt,
  }
}
