import { UserRole, MembershipTier } from "@/contexts/user-context"
import type { User } from "@/contexts/user-context"

export const DEMO_ADMIN_EMAIL = "admin@demo.com"

export function isDemoAdminUser(user: User | null): boolean {
  return user?.role === UserRole.Admin && user?.email === DEMO_ADMIN_EMAIL
}

export const DEMO_USERS: Record<string, User> = {
  bronze: {
    id: "user-bronze-001",
    companyId: null,
    email: "bronze@demo.com",
    name: "Demo 銅牌會員",
    role: UserRole.Free,
    membershipTier: MembershipTier.BRONZE,
    primaryIndustry: null,
    selectedIndustries: [],
  },
  silver: {
    id: "user-silver-001",
    companyId: null,
    email: "silver@demo.com",
    name: "Demo 銀牌會員",
    role: UserRole.Paid,
    membershipTier: MembershipTier.SILVER,
    primaryIndustry: null,
    selectedIndustries: [],
  },
  gold: {
    id: "user-gold-001",
    companyId: null,
    email: "gold@demo.com",
    name: "Demo 金牌會員",
    role: UserRole.Paid,
    membershipTier: MembershipTier.GOLD,
    primaryIndustry: "textile",
    selectedIndustries: ["electronics", "machinery", "logistics"],
  },
  diamond: {
    id: "user-diamond-001",
    companyId: null,
    email: "diamond@demo.com",
    name: "Demo 鑽石會員",
    role: UserRole.Paid,
    membershipTier: MembershipTier.DIAMOND,
    primaryIndustry: null,
    selectedIndustries: [],
  },
  admin: {
    id: "user-admin-001",
    companyId: null,
    email: DEMO_ADMIN_EMAIL,
    name: "系統管理員",
    role: UserRole.Admin,
    membershipTier: MembershipTier.DIAMOND,
    primaryIndustry: null,
    selectedIndustries: [],
  },
}
