import { UserRole } from "@/contexts/user-context"
import type { User } from "@/contexts/user-context"

export const DEMO_ADMIN_EMAIL = "admin@demo.com"

export function isDemoAdminUser(user: User | null): boolean {
  return user?.role === UserRole.Admin && user?.email === DEMO_ADMIN_EMAIL
}

export const DEMO_USERS: Record<string, User> = {
  bronze: {
    id: "user-bronze-001",
    email: "bronze@demo.com",
    name: "Demo 銅牌會員",
    role: UserRole.Free,
    contributionPoints: 50000,
    commercialPoints: 0,
    createdAt: "2025-01-15",
  },
  silver: {
    id: "user-silver-001",
    email: "silver@demo.com",
    name: "Demo 銀牌會員",
    role: UserRole.Paid,
    contributionPoints: 50000,
    commercialPoints: 100000,
    createdAt: "2024-10-01",
  },
  gold: {
    id: "user-gold-001",
    email: "gold@demo.com",
    name: "Demo 金牌會員",
    role: UserRole.Paid,
    contributionPoints: 70000,
    commercialPoints: 250000,
    createdAt: "2024-06-15",
  },
  diamond: {
    id: "user-diamond-001",
    email: "diamond@demo.com",
    name: "Demo 鑽石會員",
    role: UserRole.Paid,
    contributionPoints: 70000,
    commercialPoints: 550000,
    createdAt: "2024-01-01",
  },
  admin: {
    id: "user-admin-001",
    email: DEMO_ADMIN_EMAIL,
    name: "系統管理員",
    role: UserRole.Admin,
    contributionPoints: 0,
    commercialPoints: 0,
    createdAt: "2023-01-01",
  },
}
