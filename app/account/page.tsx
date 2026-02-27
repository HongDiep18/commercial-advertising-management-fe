"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  User,
  Shield,
  ImageIcon,
  TrendingUp,
  Gift,
  ShoppingCart,
  Megaphone,
  ArrowRight,
  Info,
  CheckCircle2,
  X,
  Upload,
  Edit3,
  Save,
} from "lucide-react"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import Input from "@/components/ui/Input"
import Textarea from "@/components/ui/Textarea"
import Select from "@/components/ui/Select"
import {
  useUser,
  CONTRIBUTION_VALUES,
  MEMBERSHIP_CONFIG,
  MEMBERSHIP_THRESHOLDS,
  mockContributionHistory,
  mockCommercialHistory,
  type MembershipTier,
} from "@/contexts/user-context"
import { categories } from "@/components/directory/DirectorySidebar"
import { useTranslation } from "react-i18next"

const COUNTRY_VALUES = [
  "vietnam",
  "taiwan",
  "china",
  "singapore",
  "malaysia",
  "thailand",
  "other",
] as const

const REGION_KEYS_BY_COUNTRY: Record<string, readonly string[]> = {
  vietnam: ["hcm", "hanoi", "danang", "binhduong", "dongnai", "other-vn"],
  taiwan: ["taipei", "taichung", "kaohsiung", "other-tw"],
  china: ["shanghai", "shenzhen", "guangzhou", "other-cn"],
  other: ["other-region"],
}

const contributionTypeConfig: Record<string, { label: string; icon: typeof Gift; color: string }> =
  {
    registration: { label: "註冊禮包", icon: Gift, color: "text-primary bg-primary/10" },
    logo: { label: "上傳 Logo", icon: ImageIcon, color: "text-primary bg-primary/10" },
  }

export default function AccountPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const { user, isLoggedIn, getTotalPoints, getMemberTier, getNextTier } = useUser()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showBenefitsModal, setShowBenefitsModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [companyLogo, setCompanyLogo] = useState<string | null>(null)
  const [logoUploaded, setLogoUploaded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profileData, setProfileData] = useState({
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
  })

  const countries = useMemo(
    () =>
      COUNTRY_VALUES.map((value) => ({
        value,
        label: t(`register.countries.${value}`) || value,
      })),
    [t]
  )

  const regionsByCountry = useMemo(() => {
    const result: Record<string, { value: string; label: string }[]> = {}
    for (const [country, keys] of Object.entries(REGION_KEYS_BY_COUNTRY)) {
      result[country] = keys.map((key) => ({
        value: key,
        label: t(`register.regions.${key}`) || key,
      }))
    }
    return result
  }, [t])

  const hasCountry = Boolean(profileData.country?.trim())
  const availableRegions = hasCountry
    ? regionsByCountry[profileData.country] || regionsByCountry.other
    : []
  const regionInList = hasCountry && availableRegions.some((r) => r.value === profileData.region)
  const regionValue = hasCountry && regionInList ? profileData.region : ""

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login")
    }
  }, [isLoggedIn, router])

  const COUNTRY_NONE = "__none__"

  const handleProfileChange = (field: string, value: string) => {
    setProfileData((prev) => {
      if (field === "country") {
        const nextCountry = value === COUNTRY_NONE ? "" : value
        return { ...prev, country: nextCountry, region: "" }
      }
      return { ...prev, [field]: value }
    })
  }

  const handleSaveProfile = () => {
    setShowProfileModal(false)
    alert(t("account.profileUpdated") || "會員資料已更新！")
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCompanyLogo(reader.result as string)
        if (!logoUploaded) {
          setLogoUploaded(true)
          alert(
            t("account.logoPoints", { count: CONTRIBUTION_VALUES.logo }) ||
              `Logo 上傳成功！您獲得 ${CONTRIBUTION_VALUES.logo.toLocaleString()} 點貢獻值`
          )
        } else {
          alert(t("account.logoUpdated") || "Logo 更新成功！")
        }
      }
      reader.readAsDataURL(file)
    }
  }

  if (!isLoggedIn || !user) {
    return null
  }

  const totalPoints = getTotalPoints()
  const memberTier = getMemberTier()
  const nextTierInfo = getNextTier()
  const tierConfig = MEMBERSHIP_CONFIG[memberTier]
  const nextThreshold = nextTierInfo
    ? MEMBERSHIP_THRESHOLDS[nextTierInfo.nextTier as MembershipTier]
    : MEMBERSHIP_THRESHOLDS.diamond
  const progressInTier = nextTierInfo ? (totalPoints / nextThreshold) * 100 : 100

  return (
    <main className="bg-body-bg-dark min-h-screen">
      <Header />

      <div className="pt-14">
        <section className="from-primary/5 via-background to-primary/5 bg-body-bg-dark py-8 sm:py-12">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <Card className="bg-card/80 border-0 shadow-lg">
              <Card.Content className="p-6 sm:p-8">
                <div className="flex flex-col gap-6 sm:flex-row">
                  <div
                    className={`border-border flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 ${!companyLogo ? tierConfig.bgColor : ""}`}
                  >
                    {companyLogo ? (
                      <img
                        src={companyLogo}
                        alt={t("account.companyLogo") || "公司 Logo"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className={`h-12 w-12 ${tierConfig.color}`} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <h1 className="text-foreground text-2xl font-bold">{user.name}</h1>
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-medium ${tierConfig.bgColor} ${tierConfig.color}`}
                      >
                        {user.role === "admin"
                          ? t("account.tiers.admin") || "管理員"
                          : t("account.tiers." + memberTier) || tierConfig.label}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{user.email}</p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {t("account.memberSince") || "會員加入日期"}：{user.createdAt}
                    </p>

                    <div className="border-border mt-4 flex flex-wrap gap-2 border-t pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:!bg-header-red-dark bg-transparent hover:text-white"
                        onClick={() => setShowBenefitsModal(true)}
                      >
                        <Shield className="mr-1.5 h-4 w-4" />
                        {t("account.viewBenefits") || "查看會員權益"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:!bg-header-red-dark relative bg-transparent hover:text-white"
                        onClick={() => setShowProfileModal(true)}
                      >
                        <Edit3 className="mr-1.5 h-4 w-4" />
                        {t("account.editProfile") || "編輯會員資料"}
                        {!logoUploaded && (
                          <span className="bg-primary text-primary-foreground absolute -top-2 -right-2 flex h-5 w-5 animate-pulse items-center justify-center rounded-full text-xs">
                            !
                          </span>
                        )}
                      </Button>
                      {user.role === "admin" && (
                        <Button
                          size="sm"
                          asChild
                          className="hover:!bg-header-red-dark/80 !bg-header-red-dark border !border-gray-400"
                        >
                          <Link href="/admin">
                            <Shield className="mr-1.5 h-4 w-4" />
                            {t("account.goAdmin") || "進入管理後台"}
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-2">
            {memberTier !== "diamond" && nextTierInfo && (
              <Card className="border-primary/20 from-primary/5 to-primary/10 h-fit bg-gradient-to-br">
                <Card.Header className="pb-4">
                  <Card.Title className="text-primary flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    {t("account.upgradeProgress") || "升級進度"}
                  </Card.Title>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {t("account.currentTier") || "目前等級"}：
                    {user.role === "admin"
                      ? t("account.tiers.admin")
                      : t("account.tiers." + memberTier) || tierConfig.label}{" "}
                    | {t("account.nextTier") || "下一等級"}：
                    {MEMBERSHIP_CONFIG[nextTierInfo.nextTier as MembershipTier].label}
                  </p>
                </Card.Header>
                <Card.Content className="space-y-5">
                  <div>
                    <div className="mb-3 flex justify-between text-sm">
                      <span className="text-foreground font-medium">
                        {totalPoints.toLocaleString()} /{" "}
                        {MEMBERSHIP_THRESHOLDS[
                          nextTierInfo.nextTier as MembershipTier
                        ].toLocaleString()}{" "}
                        {t("account.points") || "點"}
                      </span>
                      <span className="text-primary font-semibold">
                        {Math.min(100, Math.max(0, progressInTier)).toFixed(1)}%
                      </span>
                    </div>
                    <div className="bg-body-bg-dark-foreground h-4 w-full overflow-hidden rounded-full">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, Math.max(0, progressInTier))}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="bg-background/60 flex flex-col items-start justify-between gap-4 rounded-xl p-4 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-muted-foreground text-sm">
                        {t("account.pointsToUpgrade") || "距離升級還需"}
                      </p>
                      <p className="text-primary text-2xl font-bold">
                        {nextTierInfo.pointsNeeded.toLocaleString()} {t("account.points") || "點"}
                      </p>
                    </div>
                    <Button
                      className="!bg-header-red-dark hover:!bg-header-red-dark/80 hover:!text-white"
                      onClick={() => setShowUpgradeModal(true)}
                    >
                      {t("account.howToUpgrade") || "查看升級方式"}
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </Card.Content>
              </Card>
            )}

            {user.role !== "admin" && (
              <Card className="h-fit">
                <Card.Header className="pb-4">
                  <Card.Title className="flex items-center gap-2">
                    <Gift className="text-primary h-5 w-5" />
                    {t("account.pointsHistory") || "點數紀錄"}
                  </Card.Title>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {t("account.totalPoints") || "累計獲得"} {totalPoints.toLocaleString()}{" "}
                    {t("account.points") || "點"}
                  </p>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-3">
                    {mockContributionHistory.slice(0, 5).map((item) => {
                      const typeConfig = contributionTypeConfig[item.type]
                      const TypeIcon = typeConfig.icon
                      return (
                        <div
                          key={item.id}
                          className="bg-body-bg-dark flex items-center gap-4 rounded-xl p-4"
                        >
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-xl ${typeConfig.color}`}
                          >
                            <TypeIcon className="h-6 w-6" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-foreground font-medium">{item.description}</p>
                            <p className="text-muted-foreground mt-0.5 text-sm">{item.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">
                              +{item.points.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <Button
                    variant="ghost"
                    className="hover:!bg-header-red-dark mt-4 w-full border !border-gray-400 bg-transparent hover:!text-white"
                  >
                    {t("account.viewAllRecords") || "查看全部紀錄"}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Card.Content>
              </Card>
            )}

            {user.commercialPoints > 0 && (
              <Card className="h-fit lg:col-span-2">
                <Card.Header className="pb-4">
                  <Card.Title className="flex items-center gap-2">
                    <Megaphone className="text-primary h-5 w-5" />
                    {t("account.adHistory") || "廣告投放 / 消費紀錄"}
                  </Card.Title>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {t("account.adHistoryDesc") || "您的廣告投放與消費歷史"}
                  </p>
                </Card.Header>
                <Card.Content>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {mockCommercialHistory.map((item) => (
                      <div
                        key={item.id}
                        className="bg-body-bg-light flex items-center gap-4 rounded-xl p-4"
                      >
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                            item.type === "ad"
                              ? "bg-purple-100 text-purple-600"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {item.type === "ad" ? (
                            <Megaphone className="h-6 w-6" />
                          ) : (
                            <ShoppingCart className="h-6 w-6" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-foreground font-medium">{item.description}</p>
                          <p className="text-muted-foreground mt-0.5 text-sm">{item.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-foreground font-semibold">
                            {item.amount.toLocaleString()} VND
                          </p>
                          <p className="text-sm text-green-600">
                            +{item.points.toLocaleString()} 點
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    className="hover:!bg-header-red-dark mt-4 w-full border !border-gray-400 bg-transparent hover:!text-white"
                  >
                    {t("account.viewAllRecords") || "查看全部紀錄"}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Card.Content>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />

      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-body-bg-dark max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg">
            <div className="bg-body-bg-dark sticky top-0 z-10 flex items-center justify-between border-b border-gray-400 px-6 py-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Info className="text-primary h-5 w-5" />
                {t("account.howToGetPoints") || "如何獲得貢獻值"}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowUpgradeModal(false)}
                aria-label={t("common.close") || "關閉"}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-6 p-6">
              <div className="space-y-4">
                <h3 className="text-muted-foreground text-sm font-medium">
                  1. {t("account.laborContribution") || "勞力貢獻"}
                </h3>
                <div className="space-y-3">
                  <div className="bg-body-bg-dark-foreground flex items-center justify-between rounded-lg p-3 text-sm">
                    <span className="flex items-center gap-2">
                      <Gift className="text-primary h-4 w-4" />
                      {t("account.registerAndFill") || "註冊並填寫自家資料"}
                    </span>
                    <span className="text-primary font-semibold">
                      +{CONTRIBUTION_VALUES.registration.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-muted-foreground ml-2 text-xs">
                    {t("account.newbieBonus") || "新手禮包（直接升銅牌）"}
                  </p>
                  <div className="bg-body-bg-dark-foreground flex items-center justify-between rounded-lg p-3 text-sm">
                    <span className="flex items-center gap-2">
                      <ImageIcon className="text-primary h-4 w-4" />
                      {t("account.uploadLogoTask") || "(任務) 上傳自家 Logo"}
                    </span>
                    <span className="text-primary font-semibold">
                      +{CONTRIBUTION_VALUES.logo.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-muted-foreground ml-2 text-xs">
                    {t("account.uploadLogoHint") || "鼓勵完善門面"}
                  </p>
                </div>
              </div>
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-muted-foreground text-sm font-medium">
                  2. {t("account.commercialSpending") || "商業消費"}
                </h3>
                <div className="space-y-3">
                  <div className="bg-body-bg-dark-foreground flex items-center justify-between rounded-lg p-3 text-sm">
                    <span className="flex items-center gap-2">
                      <Megaphone className="text-primary h-4 w-4" />
                      {t("account.buyAd") || "購買廣告"}
                    </span>
                    <span className="text-primary font-semibold">1 VND = 1 點</span>
                  </div>
                  <p className="text-muted-foreground ml-2 text-xs">
                    {t("account.buyAdDiamondHint") || "花 55 萬買廣告，直接送鑽石會員"}
                  </p>

                  <div className="bg-body-bg-dark-foreground flex items-center justify-between rounded-lg p-3 text-sm">
                    <span className="flex items-center gap-2">
                      <ShoppingCart className="text-primary h-4 w-4" />
                      {t("account.shopSpending") || "商城消費"}
                    </span>
                    <span className="text-primary font-semibold">1 VND = 1 點</span>
                  </div>
                  <p className="text-muted-foreground ml-2 text-xs">
                    {t("account.shopSpendingHint") || "買茶葉送名錄，升級看全站資料"}
                  </p>
                </div>
              </div>
              <div className="space-y-3 border-t pt-4">
                <Button
                  className="!bg-header-red-dark hover:!bg-header-red-dark/80 w-full hover:!text-white"
                  asChild
                >
                  <Link href="/contact">
                    <Megaphone className="mr-2 h-4 w-4" />
                    {t("account.goToAd") || "前往投放廣告"}
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="hover:!bg-header-red-dark w-full border !border-gray-400 bg-transparent hover:!text-white"
                  onClick={() => setShowUpgradeModal(false)}
                >
                  {t("common.close") || "關閉"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-body-bg-dark max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg">
            <div className="bg-body-bg-dark border-border sticky top-0 z-10 flex items-center justify-between border-b border-gray-300 px-6 py-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Edit3 className="text-primary h-5 w-5" />
                {t("account.editProfile") || "編輯會員資料"}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowProfileModal(false)}
                aria-label={t("common.close") || "關閉"}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-6 p-6">
              <div className="space-y-4">
                <h3 className="text-muted-foreground text-sm font-medium">
                  {t("account.companyLogo") || "公司 Logo"}
                </h3>
                <div className="flex items-center gap-6">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <div
                    className={`border-border !bg-body-bg-dark-foreground flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-400 ${!companyLogo ? "bg-muted/60" : ""}`}
                  >
                    {companyLogo ? (
                      <img
                        src={companyLogo}
                        alt={t("account.companyLogo") || "公司 Logo"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="text-muted-foreground h-10 w-10" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:!bg-header-red-dark border !border-gray-400 bg-transparent hover:!text-white"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {companyLogo
                        ? t("account.reupload") || "重新上傳"
                        : t("account.uploadLogo") || "上傳 Logo"}
                    </Button>
                    {!logoUploaded && (
                      <p className="text-primary text-xs">
                        {t("account.uploadLogoPoints", {
                          count: CONTRIBUTION_VALUES.logo,
                        }) || `上傳 Logo 可獲得 ${CONTRIBUTION_VALUES.logo.toLocaleString()} 點`}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="text-muted-foreground text-sm font-medium">
                  {t("account.companyInfo") || "公司資料"}
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    placeholder={t("register.placeholders.companyNameVi") || "公司名稱（越文）"}
                    value={profileData.companyNameVi}
                    onChange={(e) => handleProfileChange("companyNameVi", e.target.value)}
                  />
                  <Input
                    placeholder={t("register.placeholders.companyNameCn") || "公司名稱（中文）"}
                    value={profileData.companyNameCn}
                    onChange={(e) => handleProfileChange("companyNameCn", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    placeholder={t("register.placeholders.phone") || "電話"}
                    value={profileData.phone}
                    onChange={(e) => handleProfileChange("phone", e.target.value)}
                  />
                  <Input
                    placeholder={t("register.placeholders.taxId") || "稅號"}
                    value={profileData.taxId}
                    onChange={(e) => handleProfileChange("taxId", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    placeholder={t("register.placeholders.contactPerson") || "聯絡人"}
                    value={profileData.contactPerson}
                    onChange={(e) => handleProfileChange("contactPerson", e.target.value)}
                  />
                  <Input
                    placeholder={t("register.placeholders.contactPhone") || "聯絡人電話號碼"}
                    value={profileData.contactPhone}
                    onChange={(e) => handleProfileChange("contactPhone", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    placeholder={t("register.placeholders.companyAddress") || "公司地址"}
                    value={profileData.companyAddress}
                    onChange={(e) => handleProfileChange("companyAddress", e.target.value)}
                  />
                  <Input
                    placeholder={t("register.placeholders.email") || "E-Mail"}
                    value={profileData.email}
                    onChange={(e) => handleProfileChange("email", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Select
                    value={profileData.country || COUNTRY_NONE}
                    onValueChange={(value) => handleProfileChange("country", value)}
                    options={[
                      {
                        value: COUNTRY_NONE,
                        label: t("register.placeholders.country") || "Select Country *",
                      },
                      ...countries,
                    ]}
                  >
                    <Select.Trigger className="w-full">
                      <Select.Value
                        placeholder={t("register.placeholders.country") || "Select Country *"}
                      />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value={COUNTRY_NONE} key="country-empty">
                        {t("register.placeholders.country") || "Select Country *"}
                      </Select.Item>
                      {countries.map((c) => (
                        <Select.Item key={c.value} value={c.value}>
                          {c.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>

                  <Select
                    key={profileData.country || "__no_country__"}
                    value={regionValue}
                    onValueChange={(value) => handleProfileChange("region", value)}
                    disabled={!hasCountry}
                    options={availableRegions}
                  >
                    <Select.Trigger className="w-full">
                      <Select.Value
                        placeholder={
                          !hasCountry
                            ? t("register.placeholders.selectCountryFirst") ||
                              "Please select country first"
                            : t("register.placeholders.region") || "Select Region *"
                        }
                      />
                    </Select.Trigger>
                    <Select.Content>
                      {availableRegions.length > 0 ? (
                        availableRegions.map((r) => (
                          <Select.Item key={r.value} value={r.value}>
                            {r.label}
                          </Select.Item>
                        ))
                      ) : (
                        <div className="text-muted-foreground px-2 py-1.5 text-sm">
                          {t("register.noRegions") || "無可用地區"}
                        </div>
                      )}
                    </Select.Content>
                  </Select>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <Select
                    value={profileData.industry}
                    onValueChange={(value) => handleProfileChange("industry", value)}
                  >
                    <Select.Trigger className="w-full min-w-0">
                      <Select.Value
                        placeholder={t("register.placeholders.industry") || "選擇產業類別"}
                      />
                    </Select.Trigger>
                    <Select.Content>
                      {categories.map((cat) => (
                        <Select.Item key={cat.id} value={cat.id}>
                          {t(`directory.categories.${cat.id}`) || cat.name}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </div>

                <Input
                  placeholder="Website"
                  value={profileData.website}
                  onChange={(e) => handleProfileChange("website", e.target.value)}
                />
                <Textarea
                  placeholder={t("register.placeholders.introduction") || "簡單介紹"}
                  value={profileData.introduction}
                  onChange={(e) => handleProfileChange("introduction", e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex gap-3 border-t border-gray-400 pt-4">
                <Button
                  variant="outline"
                  className="hover:!bg-header-red-dark flex-1 border !border-gray-400 bg-transparent hover:!text-white"
                  onClick={() => setShowProfileModal(false)}
                >
                  {t("account.cancel") || "取消"}
                </Button>
                <Button
                  className="!bg-header-red-dark hover:!bg-header-red-dark/80 flex-1 text-white hover:!text-white"
                  onClick={handleSaveProfile}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {t("account.saveChanges") || "儲存變更"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showBenefitsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-body-bg-dark max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg">
            <div className="bg-body-bg-dark border-border sticky top-0 z-10 flex items-center justify-between border-b border-gray-300 px-6 py-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Shield className="text-primary h-5 w-5" />
                {t("account.membershipBenefits") || "會員等級與權益"}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowBenefitsModal(false)}
                aria-label={t("common.close") || "關閉"}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-4 p-6">
              {(["bronze", "silver", "gold", "diamond"] as MembershipTier[]).map((tier) => {
                const config = MEMBERSHIP_CONFIG[tier]
                const isCurrentTier = memberTier === tier
                return (
                  <div
                    key={tier}
                    className={`rounded-lg border-2 p-4 ${
                      isCurrentTier
                        ? "border-primary bg-primary/5"
                        : "border-border border-gray-300"
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-medium ${config.bgColor} ${config.color}`}
                        >
                          {t(`account.tiers.${tier}`) || config.label}
                        </span>
                        {isCurrentTier && (
                          <span className="text-primary text-xs font-medium">
                            （{t("account.currentTierLabel") || "目前等級"}）
                          </span>
                        )}
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-medium">
                          {MEMBERSHIP_THRESHOLDS[tier].toLocaleString()} 點
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {t(`account.tierSpending.${tier}`) || config.spendingRequired}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {config.benefits.map((benefit, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600" />
                          <span>
                            {t(`account.tierBenefits.${tier}.${i}`, { defaultValue: benefit })}
                          </span>
                        </div>
                      ))}
                      {config.restrictions.length > 0 &&
                        config.restrictions.map((restriction, i) => (
                          <div
                            key={`r-${i}`}
                            className="text-muted-foreground flex items-center gap-2 text-sm"
                          >
                            <X className="h-4 w-4 flex-shrink-0 text-red-500" />
                            <span>
                              {t(`account.tierRestrictions.${tier}.${i}`, {
                                defaultValue: restriction,
                              })}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )
              })}
              <div className="border-t pt-4">
                <Button
                  className="!bg-header-red-dark hover:!bg-header-red-dark/80 w-full"
                  onClick={() => setShowBenefitsModal(false)}
                >
                  {t("common.close") || "關閉"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
