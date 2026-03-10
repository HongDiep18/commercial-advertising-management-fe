"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import {
  UserRole,
  MembershipTier,
  ContributionType,
  CommercialType,
  AdType,
  AdStatus,
} from "@/types"
import type {
  User,
  UserContextType,
  MembershipConfigEntry,
  NextTierInfo,
  ContributionHistory,
  CommercialHistory,
  AdSubmission,
} from "@/types"

export { UserRole, MembershipTier } from "@/types"
export type { User } from "@/types"

export const MEMBERSHIP_THRESHOLDS: Record<MembershipTier, number> = {
  [MembershipTier.GUEST]: 0,
  [MembershipTier.BRONZE]: 50000,
  [MembershipTier.SILVER]: 150000,
  [MembershipTier.GOLD]: 300000,
  [MembershipTier.DIAMOND]: 550000,
}

export const MEMBERSHIP_CONFIG: Record<MembershipTier, MembershipConfigEntry> = {
  [MembershipTier.GUEST]: {
    label: "訪客",
    labelEn: "Guest",
    minPoints: 0,
    maxPoints: 49999,
    spendingRequired: "無",
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    benefits: ["公司名（部分）", "地區"],
    restrictions: ["無官網、無電話、無地址、無稅號"],
  },
  [MembershipTier.BRONZE]: {
    label: "銅牌會員",
    labelEn: "Bronze",
    minPoints: 50000,
    maxPoints: 149999,
    spendingRequired: "免費（註冊即享）",
    color: "text-amber-700",
    bgColor: "bg-amber-100",
    benefits: ["本業 - 基礎版", "公司名、稅號、地區"],
    restrictions: ["無官網、無電話、無地址"],
  },
  [MembershipTier.SILVER]: {
    label: "銀牌會員",
    labelEn: "Silver",
    minPoints: 150000,
    maxPoints: 299999,
    spendingRequired: "消費 15 萬 VND",
    color: "text-slate-500",
    bgColor: "bg-slate-200",
    benefits: ["本業 - 完整版", "解鎖官網、電話、地址、Email"],
    restrictions: [],
  },
  [MembershipTier.GOLD]: {
    label: "金牌會員",
    labelEn: "Gold",
    minPoints: 300000,
    maxPoints: 549999,
    spendingRequired: "消費 30 萬 VND",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    benefits: ["本業 + 跨 3 產業 - 完整版", "解鎖自家產業 + 自選 3 個上下游產業"],
    restrictions: [],
  },
  [MembershipTier.DIAMOND]: {
    label: "鑽石會員",
    labelEn: "Diamond",
    minPoints: 550000,
    maxPoints: null,
    spendingRequired: "消費 55 萬 VND",
    color: "text-sky-600",
    bgColor: "bg-sky-100",
    benefits: ["全站所有產業 - 完整版", "取代紙本名錄", "解鎖所有產業、所有欄位（含手機）"],
    restrictions: [],
  },
}

export function getMembershipTier(totalPoints: number): MembershipTier {
  if (totalPoints >= MEMBERSHIP_THRESHOLDS[MembershipTier.DIAMOND]) return MembershipTier.DIAMOND
  if (totalPoints >= MEMBERSHIP_THRESHOLDS[MembershipTier.GOLD]) return MembershipTier.GOLD
  if (totalPoints >= MEMBERSHIP_THRESHOLDS[MembershipTier.SILVER]) return MembershipTier.SILVER
  if (totalPoints >= MEMBERSHIP_THRESHOLDS[MembershipTier.BRONZE]) return MembershipTier.BRONZE
  return MembershipTier.GUEST
}

export function getNextTierInfo(totalPoints: number): NextTierInfo | null {
  const currentTier = getMembershipTier(totalPoints)
  const tiers: MembershipTier[] = [
    MembershipTier.GUEST,
    MembershipTier.BRONZE,
    MembershipTier.SILVER,
    MembershipTier.GOLD,
    MembershipTier.DIAMOND,
  ]
  const currentIndex = tiers.indexOf(currentTier)

  if (currentIndex >= tiers.length - 1) return null

  const nextTier = tiers[currentIndex + 1]
  const pointsNeeded = MEMBERSHIP_THRESHOLDS[nextTier] - totalPoints

  return { nextTier, pointsNeeded }
}

export { ContributionType, CommercialType } from "@/types"
export type { ContributionHistory, CommercialHistory } from "@/types"

export const mockContributionHistory: ContributionHistory[] = [
  {
    id: "c1",
    type: ContributionType.Registration,
    description: "註冊並填寫自家企業資料（新手禮包）",
    points: 50000,
    date: "2025-01-15",
  },
]

export const mockCommercialHistory: CommercialHistory[] = [
  {
    id: "m1",
    type: CommercialType.Advertising,
    description: "首頁彈窗廣告 - 1個月",
    amount: 50000,
    points: 50000,
    date: "2024-12-01",
  },
  {
    id: "m2",
    type: CommercialType.Advertising,
    description: "精選企業曝光 - 3個月",
    amount: 80000,
    points: 80000,
    date: "2024-11-15",
  },
  {
    id: "m3",
    type: CommercialType.Purchase,
    description: "購買廣告點數",
    amount: 30000,
    points: 30000,
    date: "2024-11-01",
  },
  {
    id: "m4",
    type: CommercialType.Advertising,
    description: "企業名錄廣告 - 封面裡",
    amount: 70000,
    points: 70000,
    date: "2024-10-20",
  },
]

export { AdType, AdStatus } from "@/types"
export type { AdSubmission } from "@/types"

export const mockAdSubmissions: AdSubmission[] = [
  {
    id: "ad-001",
    companyName: "越南紡織有限公司",
    contactName: "王先生",
    email: "wang@vnTextile.com",
    phone: "+84-909-123-456",
    adType: AdType.Popup,
    adTypeName: "平台廣告刊登",
    selectedItems: ["首頁彈窗廣告 - 優先顯示", "精選企業曝光 - 首位"],
    totalAmount: "洽談中",
    status: AdStatus.New,
    submittedAt: "2025-01-26 14:30",
  },
  {
    id: "ad-002",
    companyName: "ABC電子科技公司",
    contactName: "李小姐",
    email: "li@abctech.com",
    phone: "+84-908-765-432",
    adType: AdType.Directory,
    adTypeName: "越南華商採購名錄",
    selectedItems: ["封面", "內頁彩色"],
    totalAmount: "170,000,000 VND",
    status: AdStatus.Contacted,
    submittedAt: "2025-01-25 10:15",
    notes: "已於1/26電話聯繫，客戶考慮中",
  },
  {
    id: "ad-003",
    companyName: "XYZ貿易公司",
    contactName: "陳經理",
    email: "chen@xyz-trade.com",
    phone: "+84-907-111-222",
    adType: AdType.Product,
    adTypeName: "商品銷售刊登",
    selectedItems: ["進階刊登方案", "首頁推薦"],
    totalAmount: "8,000,000 VND",
    status: AdStatus.Closed,
    submittedAt: "2025-01-20 09:00",
    notes: "已完成簽約，廣告將於2/1上線",
  },
  {
    id: "ad-004",
    companyName: "DEF機械設備公司",
    contactName: "張總",
    email: "zhang@defmachine.com",
    phone: "+84-906-333-444",
    adType: AdType.Popup,
    adTypeName: "平台廣告刊登",
    selectedItems: ["企業名錄廣告 - 置頂3個月"],
    totalAmount: "15,000,000 VND",
    status: AdStatus.New,
    submittedAt: "2025-01-27 08:45",
  },
]

export const CONTRIBUTION_VALUES = {
  registration: 50000,
  logo: 20000,
}

export const COMMERCIAL_POINTS_RATE = 1

export const DIAMOND_COMMERCIAL_THRESHOLD = 550000

const UserContext = createContext<UserContextType | undefined>(undefined)

const STORAGE_KEY = "demo_user"

function getStoredUser(): User | null {
  if (typeof window === "undefined") return null
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    return s ? (JSON.parse(s) as User) : null
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(getStoredUser)
  const [isAuthReady, setIsAuthReady] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setIsAuthReady(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const setUser = (u: User | null) => {
    setUserState(u)
    if (typeof window === "undefined") return
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    else localStorage.removeItem(STORAGE_KEY)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const loginWithEmail = (email: string, password: string) => {
    const bronzeUser: User = {
      id: `user-email-${Date.now()}`,
      email,
      name: email.split("@")[0] ?? "User",
      role: UserRole.Free,
      contributionPoints: 50000,
      commercialPoints: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    }
    setUser(bronzeUser)
  }

  const loginWithRegisteredUser = (email: string, name: string, membershipTier: MembershipTier) => {
    const minPoints = MEMBERSHIP_THRESHOLDS[membershipTier]
    const role: UserRole = membershipTier === MembershipTier.BRONZE ? UserRole.Free : UserRole.Paid
    const newUser: User = {
      id: `user-reg-${Date.now()}`,
      email,
      name: name || email.split("@")[0],
      role,
      contributionPoints: minPoints,
      commercialPoints: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    }
    setUser(newUser)
  }

  const logout = () => {
    setUser(null)
  }

  const getTotalPoints = () => {
    if (!user) return 0
    return user.contributionPoints + user.commercialPoints
  }

  const getMemberTier = (): MembershipTier => {
    if (!user) return MembershipTier.GUEST
    if (user.role === UserRole.Admin) return MembershipTier.DIAMOND
    return getMembershipTier(getTotalPoints())
  }

  const getNextTier = () => {
    if (!user) return null
    if (user.role === UserRole.Admin) return null
    return getNextTierInfo(getTotalPoints())
  }

  const canViewPhone = (): boolean => {
    const tier = getMemberTier()
    return [
      MembershipTier.BRONZE,
      MembershipTier.SILVER,
      MembershipTier.GOLD,
      MembershipTier.DIAMOND,
    ].includes(tier)
  }

  const canViewWebsite = (): boolean => {
    const tier = getMemberTier()
    return [
      MembershipTier.BRONZE,
      MembershipTier.SILVER,
      MembershipTier.GOLD,
      MembershipTier.DIAMOND,
    ].includes(tier)
  }

  const canViewEmail = (): boolean => {
    const tier = getMemberTier()
    return [MembershipTier.SILVER, MembershipTier.GOLD, MembershipTier.DIAMOND].includes(tier)
  }

  const canDownloadDirectory = (): boolean => {
    const tier = getMemberTier()
    return [MembershipTier.GOLD, MembershipTier.DIAMOND].includes(tier)
  }

  const getUpgradeProgress = (): number => {
    if (!user) return 0
    const totalPoints = getTotalPoints()
    const nextTier = getNextTier()
    if (!nextTier || !nextTier.nextTier) return 100
    const nextTierThreshold = MEMBERSHIP_THRESHOLDS[nextTier.nextTier]
    return Math.min((totalPoints / nextTierThreshold) * 100, 100)
  }

  return (
    <UserContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isAuthReady,
        setUser,
        loginWithEmail,
        loginWithRegisteredUser,
        logout,
        getTotalPoints,
        getMemberTier,
        getNextTier,
        canViewPhone,
        canViewWebsite,
        canViewEmail,
        canDownloadDirectory,
        getUpgradeProgress,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
