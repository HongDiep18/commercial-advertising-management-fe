"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type UserRole = "guest" | "free" | "paid" | "admin"

export type MembershipTier = "guest" | "bronze" | "silver" | "gold" | "diamond"

export interface User {
    id: string
    email: string
    name: string
    role: UserRole
    contributionPoints: number
    commercialPoints: number
    createdAt: string
}


export const MEMBERSHIP_THRESHOLDS: Record<MembershipTier, number> = {
    guest: 0,
    bronze: 50000,
    silver: 150000,
    gold: 300000,
    diamond: 550000,
}


export const MEMBERSHIP_CONFIG: Record<MembershipTier, {
    label: string
    labelEn: string
    minPoints: number
    maxPoints: number | null
    spendingRequired: string
    color: string
    bgColor: string
    benefits: string[]
    restrictions: string[]
}> = {
    guest: {
        label: "訪客",
        labelEn: "Guest",
        minPoints: 0,
        maxPoints: 49999,
        spendingRequired: "無",
        color: "text-muted-foreground",
        bgColor: "bg-muted",
        benefits: [
            "公司名（部分）",
            "地區",
        ],
        restrictions: [
            "無官網、無電話、無地址、無稅號",
        ],
    },
    bronze: {
        label: "銅牌會員",
        labelEn: "Bronze",
        minPoints: 50000,
        maxPoints: 149999,
        spendingRequired: "免費（註冊即享）",
        color: "text-amber-700",
        bgColor: "bg-amber-100",
        benefits: [
            "本業 - 基礎版",
            "公司名、稅號、地區",
        ],
        restrictions: [
            "無官網、無電話、無地址",
        ],
    },
    silver: {
        label: "銀牌會員",
        labelEn: "Silver",
        minPoints: 150000,
        maxPoints: 299999,
        spendingRequired: "消費 15 萬 VND",
        color: "text-slate-500",
        bgColor: "bg-slate-200",
        benefits: [
            "本業 - 完整版",
            "解鎖官網、電話、地址、Email",
        ],
        restrictions: [],
    },
    gold: {
        label: "金牌會員",
        labelEn: "Gold",
        minPoints: 300000,
        maxPoints: 549999,
        spendingRequired: "消費 30 萬 VND",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
        benefits: [
            "本業 + 跨 3 產業 - 完整版",
            "解鎖自家產業 + 自選 3 個上下游產業",
        ],
        restrictions: [],
    },
    diamond: {
        label: "鑽石會員",
        labelEn: "Diamond",
        minPoints: 550000,
        maxPoints: null,
        spendingRequired: "消費 55 萬 VND",
        color: "text-sky-600",
        bgColor: "bg-sky-100",
        benefits: [
            "全站所有產業 - 完整版",
            "取代紙本名錄",
            "解鎖所有產業、所有欄位（含手機）",
        ],
        restrictions: [],
    },
}


export function getMembershipTier(totalPoints: number): MembershipTier {
    if (totalPoints >= MEMBERSHIP_THRESHOLDS.diamond) return "diamond"
    if (totalPoints >= MEMBERSHIP_THRESHOLDS.gold) return "gold"
    if (totalPoints >= MEMBERSHIP_THRESHOLDS.silver) return "silver"
    if (totalPoints >= MEMBERSHIP_THRESHOLDS.bronze) return "bronze"
    return "guest"
}


export function getNextTierInfo(totalPoints: number): { nextTier: MembershipTier | null; pointsNeeded: number } | null {
    const currentTier = getMembershipTier(totalPoints)
    const tiers: MembershipTier[] = ["guest", "bronze", "silver", "gold", "diamond"]
    const currentIndex = tiers.indexOf(currentTier)

    if (currentIndex >= tiers.length - 1) return null

    const nextTier = tiers[currentIndex + 1]
    const pointsNeeded = MEMBERSHIP_THRESHOLDS[nextTier] - totalPoints

    return { nextTier, pointsNeeded }
}

export interface ContributionHistory {
    id: string
    type: "registration" | "logo"
    description: string
    points: number
    date: string
}

export interface CommercialHistory {
    id: string
    type: "ad" | "purchase"
    description: string
    amount: number
    points: number
    date: string
}



const demoUsers: Record<string, User> = {
    bronze: {
        id: "user-bronze-001",
        email: "bronze@demo.com",
        name: "Demo 銅牌會員",
        role: "free",
        contributionPoints: 50000,
        commercialPoints: 0,
        createdAt: "2025-01-15",
    },
    silver: {
        id: "user-silver-001",
        email: "silver@demo.com",
        name: "Demo 銀牌會員",
        role: "paid",
        contributionPoints: 50000,
        commercialPoints: 100000,
        createdAt: "2024-10-01",
    },
    gold: {
        id: "user-gold-001",
        email: "gold@demo.com",
        name: "Demo 金牌會員",
        role: "paid",
        contributionPoints: 70000,
        commercialPoints: 250000,
        createdAt: "2024-06-15",
    },
    diamond: {
        id: "user-diamond-001",
        email: "diamond@demo.com",
        name: "Demo 鑽石會員",
        role: "paid",
        contributionPoints: 70000,
        commercialPoints: 550000,
        createdAt: "2024-01-01",
    },
    admin: {
        id: "user-admin-001",
        email: "admin@demo.com",
        name: "系統管理員",
        role: "admin",
        contributionPoints: 0,
        commercialPoints: 0,
        createdAt: "2023-01-01",
    },
}


export const mockContributionHistory: ContributionHistory[] = [
    { id: "c1", type: "registration", description: "註冊並填寫自家企業資料（新手禮包）", points: 50000, date: "2025-01-15" },
]


export const mockCommercialHistory: CommercialHistory[] = [
    { id: "m1", type: "ad", description: "首頁彈窗廣告 - 1個月", amount: 50000, points: 50000, date: "2024-12-01" },
    { id: "m2", type: "ad", description: "精選企業曝光 - 3個月", amount: 80000, points: 80000, date: "2024-11-15" },
    { id: "m3", type: "purchase", description: "購買廣告點數", amount: 30000, points: 30000, date: "2024-11-01" },
    { id: "m4", type: "ad", description: "企業名錄廣告 - 封面裡", amount: 70000, points: 70000, date: "2024-10-20" },
]


export interface AdSubmission {
    id: string
    companyName: string
    contactName: string
    email: string
    phone: string
    adType: "popup" | "directory" | "product"
    adTypeName: string
    selectedItems: string[]
    totalAmount: string
    status: "new" | "contacted" | "closed"
    submittedAt: string
    notes?: string
}

export const mockAdSubmissions: AdSubmission[] = [
    {
        id: "ad-001",
        companyName: "越南紡織有限公司",
        contactName: "王先生",
        email: "wang@vnTextile.com",
        phone: "+84-909-123-456",
        adType: "popup",
        adTypeName: "平台廣告刊登",
        selectedItems: ["首頁彈窗廣告 - 優先顯示", "精選企業曝光 - 首位"],
        totalAmount: "洽談中",
        status: "new",
        submittedAt: "2025-01-26 14:30",
    },
    {
        id: "ad-002",
        companyName: "ABC電子科技公司",
        contactName: "李小姐",
        email: "li@abctech.com",
        phone: "+84-908-765-432",
        adType: "directory",
        adTypeName: "越南華商採購名錄",
        selectedItems: ["封面", "內頁彩色"],
        totalAmount: "170,000,000 VND",
        status: "contacted",
        submittedAt: "2025-01-25 10:15",
        notes: "已於1/26電話聯繫，客戶考慮中",
    },
    {
        id: "ad-003",
        companyName: "XYZ貿易公司",
        contactName: "陳經理",
        email: "chen@xyz-trade.com",
        phone: "+84-907-111-222",
        adType: "product",
        adTypeName: "商品銷售刊登",
        selectedItems: ["進階刊登方案", "首頁推薦"],
        totalAmount: "8,000,000 VND",
        status: "closed",
        submittedAt: "2025-01-20 09:00",
        notes: "已完成簽約，廣告將於2/1上線",
    },
    {
        id: "ad-004",
        companyName: "DEF機械設備公司",
        contactName: "張總",
        email: "zhang@defmachine.com",
        phone: "+84-906-333-444",
        adType: "popup",
        adTypeName: "平台廣告刊登",
        selectedItems: ["企業名錄廣告 - 置頂3個月"],
        totalAmount: "15,000,000 VND",
        status: "new",
        submittedAt: "2025-01-27 08:45",
    },
]



export const CONTRIBUTION_VALUES = {
    registration: 50000,
    logo: 20000,
}




export const COMMERCIAL_POINTS_RATE = 1


export const DIAMOND_COMMERCIAL_THRESHOLD = 550000

interface UserContextType {
    user: User | null
    isLoggedIn: boolean
    login: (tier: string) => void
    loginWithEmail: (email: string, password: string) => void
    logout: () => void
    getTotalPoints: () => number
    getMemberTier: () => MembershipTier
    getNextTier: () => { nextTier: MembershipTier | null; pointsNeeded: number } | null
    canViewPhone: () => boolean
    canViewWebsite: () => boolean
    canViewEmail: () => boolean
    canDownloadDirectory: () => boolean
    getUpgradeProgress: () => number
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        const storedUser = localStorage.getItem("demo_user")
        if (storedUser) {
            try {
                setTimeout(() => {
                    const user = JSON.parse(storedUser)
                    setUser(user)
                }, 0)
            } catch {
                localStorage.removeItem("demo_user")
            }
        }
    }, [])

    const login = (tier: string) => {
        if (tier === "guest") {
            logout()
            return
        }
        const demoUser = demoUsers[tier]
        if (demoUser) {
            setUser(demoUser)
            localStorage.setItem("demo_user", JSON.stringify(demoUser))
        }
    }

    const loginWithEmail = (email: string, password: string) => {
        console.log("loginWithEmail", email, password)
        const bronzeUser = { ...demoUsers.bronze, email, name: email.split("@")[0] }
        setUser(bronzeUser)
        localStorage.setItem("demo_user", JSON.stringify(bronzeUser))
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem("demo_user")
    }

    const getTotalPoints = () => {
        if (!user) return 0
        return user.contributionPoints + user.commercialPoints
    }

    const getMemberTier = (): MembershipTier => {
        if (!user) return "guest"
        if (user.role === "admin") return "diamond"
        return getMembershipTier(getTotalPoints())
    }

    const getNextTier = () => {
        if (!user) return null
        if (user.role === "admin") return null
        return getNextTierInfo(getTotalPoints())
    }


    const canViewPhone = (): boolean => {
        const tier = getMemberTier()
        return ["bronze", "silver", "gold", "diamond"].includes(tier)
    }

    const canViewWebsite = (): boolean => {
        const tier = getMemberTier()
        return ["bronze", "silver", "gold", "diamond"].includes(tier)
    }

    const canViewEmail = (): boolean => {
        const tier = getMemberTier()
        return ["silver", "gold", "diamond"].includes(tier)
    }

    const canDownloadDirectory = (): boolean => {
        const tier = getMemberTier()
        return ["gold", "diamond"].includes(tier)
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
                login,
                loginWithEmail,
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
