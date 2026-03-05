import type { ProfileFormData } from "@/types/account"
import type { User } from "@/types/user"
import { DEMO_USERS } from "./demoUsers"

export const DEMO_PROFILE_DATA: ProfileFormData = {
  companyNameVi: "Công ty TNHH Demo",
  companyNameCn: "Demo 有限公司",
  phone: "+84 28 1234 5678",
  taxId: "0123456789",
  contactPerson: "Demo 聯絡人",
  contactPhone: "+84 912 345 678",
  companyAddress: "123 Nguyen Hue, District 1, Ho Chi Minh City",
  email: "demo@company.com",
  country: "vietnam",
  region: "hcm",
  industry: "electronics",
  website: "https://demo-company.com",
  introduction: "這是一家示範公司，專注於提供優質的產品和服務。",
}

const DEMO_USER_IDS = new Set(Object.values(DEMO_USERS).map((u) => u.id))

export function isDemoUser(user: User | null): boolean {
  return user != null && DEMO_USER_IDS.has(user.id)
}

export function getDemoProfileForUser(user: User | null): ProfileFormData | null {
  if (!user || !DEMO_USER_IDS.has(user.id)) return null
  return { ...DEMO_PROFILE_DATA, email: user.email }
}
