"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import Button from "../ui/Button"
import Card, { CardContent } from "../ui/Card"
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  User,
  Building2,
  Share2,
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Crown,
  FileText,
} from "lucide-react"
import { useUser, UserRole, MembershipTier } from "../../contexts/user-context"
import { useTranslation } from "react-i18next"
import { isDemoUser } from "@/components/login/demo"
import { useCompanyDetail, useCompanyDirectory } from "@/api/companies/hooks"
import { useTierInfo } from "@/api/loyalty"
import { getCompanyData } from "../../data/mockCompanies"
import { truncateIntroduction, categoryNameToIdMap } from "../../utils/companyHelpers"
import { translateRegionLabel } from "@/utils/regionSearch"

interface CompanyDetailProps {
  companyId: string
}

function getDeterministicHash(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 31 + seed.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

export default function CompanyDetail({ companyId }: CompanyDetailProps) {
  const searchParams = useSearchParams()
  const fromCategory = searchParams.get("fromCategory")
  const backParam = searchParams.get("back")
  const { t, i18n } = useTranslation()
  const { user, isLoggedIn } = useUser()
  const isDemo = isLoggedIn && !!user && isDemoUser(user)
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [copiedPhone, setCopiedPhone] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [companyId])

  const {
    data: apiCompany,
    isLoading: isCompanyLoading,
    isError: isCompanyError,
    error: apiCompanyError,
  } = useCompanyDetail(companyId, true)
  const isAdmin = !!user && user.role === UserRole.Admin
  const {
    data: tierInfo,
    isLoading: isTierLoading,
    isError: isTierError,
  } = useTierInfo(isLoggedIn && !isAdmin)

  const relatedIndustry = apiCompany?.industry

  const { data: relatedDirectoryData } = useCompanyDirectory(
    {
      industry: relatedIndustry,
      page: 1,
      limit: 60,
      sortBy: "name",
      sortOrder: "asc",
    },
    Boolean(relatedIndustry)
  )

  const relatedCompanies = useMemo<
    Array<{ id: string; name: string; logoUrl: string | null }>
  >(() => {
    const candidates = relatedDirectoryData?.companies ?? []
    return candidates
      .filter((c) => c.id !== companyId)
      .sort(
        (a, b) =>
          getDeterministicHash(`${companyId}-${a.id}`) -
          getDeterministicHash(`${companyId}-${b.id}`)
      )
      .slice(0, 6)
      .map((c) => ({
        id: c.id,
        name: c.name,
        logoUrl: c.logoUrl ?? "/placeholder.svg",
      }))
  }, [companyId, relatedDirectoryData])

  if (!isDemo && isCompanyLoading) {
    return (
      <div className="bg-body-bg-dark py-16 text-center">
        <p className="text-muted-foreground">{t("companyDetail.loading") || "Loading..."}</p>
      </div>
    )
  }

  // Check if error is 403 industry access denied
  const isIndustryAccessDenied =
    !isDemo &&
    isCompanyError &&
    apiCompanyError &&
    (apiCompanyError as any).status === 403 &&
    (apiCompanyError as any).message?.includes("do not have access to companies in this industry")

  // Show industry access denied error UI
  if (isIndustryAccessDenied) {
    return (
      <div className="bg-body-bg-dark min-h-screen">
        {/* Back to Home Link - Top Left */}
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="text-muted-foreground hover:text-primary inline-flex items-center text-sm transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("companyDetail.errors.industryAccessDenied.backToHome") || "Back to Home"}
          </Link>
        </div>

        {/* Centered Error Message */}
        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <Card className="bg-card border-border/50 overflow-hidden">
            <CardContent className="bg-body-bg-light p-6 lg:p-8">
              <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                  <Lock className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
                  <h2 className="mb-2 text-2xl font-semibold">
                    {t("companyDetail.errors.industryAccessDenied.title") || "Access Restricted"}
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {t("companyDetail.errors.industryAccessDenied.message") ||
                      "Your current tier cannot access companies in this industry"}
                  </p>
                  <Button
                    className="bg-white font-semibold !text-amber-600 hover:bg-white/90"
                    asChild
                  >
                    <Link href="/account">
                      <Crown className="mr-2 h-4 w-4" />
                      {t("companyDetail.errors.industryAccessDenied.upgradeButton") ||
                        "Upgrade to unlock information"}
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    )
  }

  // Show generic error for other cases
  if (!isDemo && (isCompanyError || !apiCompany)) {
    return (
      <div className="bg-body-bg-dark py-16 text-center">
        <p className="text-muted-foreground">
          {t("error.failedToLoadData") || "Failed to load data"}
        </p>
      </div>
    )
  }

  const company = isDemo
    ? getCompanyData(companyId)
    : {
        id: apiCompany!.id,
        nameCn: apiCompany!.companyNameCn ?? apiCompany!.companyNameVi ?? "",
        nameEn: apiCompany!.companyNameVi ?? apiCompany!.companyNameCn ?? "",
        logo: apiCompany!.logoUrl ?? "/placeholder.svg",
        category: apiCompany!.industry,
        categoryTags: [],
        address: apiCompany!.address,
        phone: apiCompany!.phone,
        email: apiCompany!.email,
        website: apiCompany!.website ?? "",
        contactPerson: apiCompany!.contactName,
        region: apiCompany!.region ?? "",
        taxId: apiCompany!.taxId ?? "",
        introduction: apiCompany!.description,
        services: [],
        products: [],
      }

  const companyNameCn = t(`companyDetail.companies.${companyId}.nameCn`, {
    defaultValue: company.nameCn,
  })
  const companyNameEn = t(`companyDetail.companies.${companyId}.nameEn`, {
    defaultValue: company.nameEn,
  })
  const translatedRegion = translateRegionLabel(company.region, t, i18n)
  const fallbackBackToDirectory = fromCategory
    ? `/directory?category=${encodeURIComponent(fromCategory)}`
    : "/directory"
  const backToDirectoryHref =
    backParam && backParam.startsWith("/directory") ? backParam : fallbackBackToDirectory
  const encodedBackToDirectory = encodeURIComponent(backToDirectoryHref)

  const categoryId = categoryNameToIdMap[company.category] || ""
  const translatedCategory = categoryId ? t(`directory.categories.${categoryId}`) : company.category

  const effectiveTier = isAdmin
    ? MembershipTier.DIAMOND
    : (tierInfo?.currentTier ?? MembershipTier.GUEST)
  const isResolvingTier = isLoggedIn && !isAdmin && isTierLoading && !isTierError && !tierInfo
  const isGuest = !isAdmin && effectiveTier === MembershipTier.GUEST
  const isBronze = !isAdmin && effectiveTier === MembershipTier.BRONZE
  const isSilverOrAbove =
    isAdmin ||
    effectiveTier === MembershipTier.SILVER ||
    effectiveTier === MembershipTier.GOLD ||
    effectiveTier === MembershipTier.DIAMOND

  const shouldBlurLogo = isGuest || isBronze

  const copyTextSafely = async (text: string): Promise<boolean> => {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text)
        return true
      } catch {
        console.error("Failed to copy text to clipboard")
      }
    }

    if (typeof document === "undefined") return false

    const textArea = document.createElement("textarea")
    textArea.value = text
    textArea.setAttribute("readonly", "")
    textArea.style.position = "fixed"
    textArea.style.top = "-9999px"
    textArea.style.left = "-9999px"
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      const didCopy = document.execCommand("copy")
      document.body.removeChild(textArea)
      return didCopy
    } catch {
      document.body.removeChild(textArea)
      return false
    }
  }

  if (isResolvingTier) {
    return (
      <div className="bg-body-bg-dark py-16 text-center">
        <p className="text-muted-foreground">{t("companyDetail.loading") || "Loading..."}</p>
      </div>
    )
  }

  const handleCopyEmail = async () => {
    const copied = await copyTextSafely(company.email)
    if (!copied) return
    setCopiedEmail(true)
    setTimeout(() => setCopiedEmail(false), 2000)
  }

  const handleCopyPhone = async () => {
    const copied = await copyTextSafely(company.phone)
    if (!copied) return
    setCopiedPhone(true)
    setTimeout(() => setCopiedPhone(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: companyNameCn,
        text: `查看 ${companyNameCn} 的企業資訊`,
        url: window.location.href,
      })
    } else {
      await copyTextSafely(window.location.href)
    }
  }

  return (
    <div className="bg-body-bg-dark">
      {(isGuest || isBronze) && (
        <div className="sticky top-14 z-40 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                <span className="font-medium">
                  {isGuest
                    ? t("companyDetail.upgradeBanner.guest") ||
                      "您目前為訪客，僅可查看部分公司名稱與地區"
                    : t("companyDetail.upgradeBanner.bronze") ||
                      "您目前為銅牌會員，升級可查看官網、電話、地址等完整資訊"}
                </span>
              </div>
              <Button
                size="sm"
                className="bg-white font-semibold !text-amber-600 hover:bg-white/90"
                asChild
              >
                <Link href={isGuest ? "/register" : "/account"}>
                  <Crown className="mr-2 h-4 w-4" />
                  {isGuest
                    ? t("companyDetail.upgradeBanner.register") || "註冊成為會員"
                    : t("companyDetail.upgradeBanner.upgrade") || "升級解鎖完整資訊"}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href={backToDirectoryHref}
          className="text-muted-foreground hover:text-primary inline-flex items-center text-sm transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("companyDetail.breadcrumb") || "返回企業名錄"}
        </Link>
      </div>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <Card className="bg-card border-border/50 overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-body-bg-light flex flex-col lg:flex-row">
              <div className="bg-body-bg-dark bg-muted/30 flex items-center justify-center lg:w-1/3 lg:p-8">
                <div className="border-border/50 relative aspect-square w-full max-w-[280px] overflow-hidden rounded-lg border bg-white">
                  <Image
                    src={company.logo || "/placeholder.svg"}
                    alt={companyNameCn}
                    fill
                    className={`object-contain p-4 ${shouldBlurLogo ? "blur-sm" : ""}`}
                  />
                </div>
              </div>

              <div className="lg:w-2/3 lg:p-8">
                <div className="mb-6">
                  <h1 key={i18n.language} className="text-foreground mb-2 text-3xl font-bold">
                    {companyNameCn}
                  </h1>
                  <p key={`${i18n.language}-en`} className="text-muted-foreground mb-1 text-lg">
                    {companyNameEn}
                  </p>
                </div>

                <div className="mb-6 flex flex-wrap gap-2">
                  <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium">
                    {translatedCategory}
                  </span>
                  {company.categoryTags.map((tag) => {
                    const translatedTag = t(`directory.categoryTags.${tag}`, { defaultValue: tag })
                    return (
                      <span
                        key={tag}
                        className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-sm"
                      >
                        {translatedTag}
                      </span>
                    )
                  })}
                </div>

                <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                      <MapPin className="text-primary h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-muted-foreground text-sm">
                        {t("companyDetail.address") || "地址"}
                      </p>
                      <p className="text-sm font-medium">{company.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                      <Phone className="text-primary h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-muted-foreground text-sm">
                        {t("companyDetail.phone") || "電話"}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{company.phone}</p>
                        <button
                          onClick={handleCopyPhone}
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          {copiedPhone ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                      <Mail className="text-primary h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-muted-foreground text-sm">Email</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{company.email}</p>
                        <button
                          onClick={handleCopyEmail}
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          {copiedEmail ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {company.website && (
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                        <Globe className="text-primary h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-muted-foreground text-sm">
                          {t("companyDetail.website") || "官網"}
                        </p>
                        <a
                          href={`https://${company.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline"
                        >
                          {company.website}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                      <User className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">
                        {t("companyDetail.contactPerson") || "聯絡人"}
                      </p>
                      <p className="text-sm font-medium">{company.contactPerson}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                      <Building2 className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">
                        {t("companyDetail.region") || "地區"}
                      </p>
                      <p className="text-sm font-medium">{translatedRegion}</p>
                    </div>
                  </div>

                  {company.taxId && (
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                        <FileText className="text-primary h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">
                          {t("companyDetail.taxId") || "稅號"}
                        </p>
                        <p className="text-sm font-medium">{company.taxId}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button variant="primary" asChild>
                    <a href={`mailto:${company.email}`}>
                      <Mail className="mr-2 h-4 w-4" />
                      {t("companyDetail.contactCompany") || "聯絡公司"}
                    </a>
                  </Button>
                  {/* <Button
                      variant="outline"
                      onClick={() => setIsFavorite(!isFavorite)}
                      className={
                        isFavorite
                          ? "text-primary !bg-body-bg-dark hover:!bg-header-red-dark/80 border-primary hover:!text-white"
                          : "hover:!bg-header-red-dark border !border-gray-400 bg-transparent hover:!text-white"
                      }
                    >
                      <Heart className={`mr-2 h-4 w-4 ${isFavorite ? "fill-primary" : ""}`} />
                      {isFavorite
                        ? t("companyDetail.favorited") || "已收藏"
                        : t("companyDetail.addToFavorites") || "加入收藏"}
                    </Button> */}
                  <Button
                    variant="outline"
                    onClick={handleShare}
                    className="hover:!bg-header-red-dark !bg-body-bg-dark border hover:!text-white"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    {t("companyDetail.share") || "分享"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <Card className="bg-card border-border/50 relative overflow-hidden">
          <CardContent className="bg-body-bg-light p-6 lg:p-8">
            <h2 className="text-foreground mb-4 flex items-center gap-2 text-xl font-bold">
              <div className="bg-primary h-6 w-1 rounded-full" />
              {t("companyDetail.introduction") || "公司簡介"}
            </h2>

            {(() => {
              const translatedIntroduction = t(`companyDetail.introductions.${companyId}`, {
                defaultValue: company.introduction,
              })

              return isSilverOrAbove ? (
                <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {translatedIntroduction}
                </div>
              ) : (
                <div className="relative">
                  <div className="text-muted-foreground leading-relaxed">
                    {truncateIntroduction(translatedIntroduction, 50)}
                  </div>
                  <div className="relative mt-4">
                    <div className="text-muted-foreground leading-relaxed whitespace-pre-line opacity-50 blur-[4px] select-none">
                      {translatedIntroduction.substring(50, 200)}...
                    </div>
                    <div className="via-background/80 to-background absolute inset-0 bg-gradient-to-b from-transparent" />
                  </div>
                </div>
              )
            })()}
          </CardContent>
        </Card>
      </section>

      {company.products && company.products.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <Card className="bg-card border-border/50">
            <CardContent className="p-6 lg:p-8">
              <h2 className="text-foreground mb-4 flex items-center gap-2 text-xl font-bold">
                <div className="bg-primary h-6 w-1 rounded-full" />
                {t("companyDetail.productsLabel") || "產品"}
              </h2>
              <div className="flex flex-wrap gap-2">
                {company.products.map((product, index) => {
                  const translatedProduct = t(`companyDetail.products.${product}`, {
                    defaultValue: product,
                  })
                  return (
                    <span
                      key={index}
                      className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-sm"
                    >
                      {translatedProduct}
                    </span>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {company.services && company.services.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <Card className="bg-card border-border/50">
            <CardContent className="p-6 lg:p-8">
              <h2 className="text-foreground mb-4 flex items-center gap-2 text-xl font-bold">
                <div className="bg-primary h-6 w-1 rounded-full" />
                {t("companyDetail.servicesLabel") || "服務"}
              </h2>
              <div className="flex flex-wrap gap-2">
                {company.services.map((service, index) => {
                  const translatedService = t(`companyDetail.services.${service}`, {
                    defaultValue: service,
                  })
                  return (
                    <span
                      key={index}
                      className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-sm"
                    >
                      {translatedService}
                    </span>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <Card className="bg-card border-border/50">
          <CardContent className="bg-body-bg-light p-6 lg:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-foreground flex items-center gap-2 text-xl font-bold">
                <div className="bg-primary h-6 w-1 rounded-full" />
                {t("companyDetail.relatedCompanies") || "相關企業"}
              </h2>
              <Link
                href={backToDirectoryHref}
                className="text-primary text-sm hover:underline"
                onClick={() => window.scrollTo(0, 0)}
              >
                {t("companyDetail.viewMore") || "查看更多"}
              </Link>
            </div>
            {relatedCompanies.length === 0 ? (
              <p className="text-muted-foreground text-center">
                {t("companyDetail.noRelatedCompanies") || "No related companies"}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
                {relatedCompanies.map((relatedCompany) => (
                  <Link
                    key={relatedCompany.id}
                    href={`/directory/${relatedCompany.id}?back=${encodedBackToDirectory}`}
                    className="group"
                  >
                    <div className="bg-muted relative mb-2 aspect-square overflow-hidden rounded-lg">
                      <Image
                        src={relatedCompany.logoUrl || "/placeholder.svg"}
                        alt={`相關企業 ${relatedCompany.id}`}
                        fill
                        className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
                          shouldBlurLogo ? "blur-[3px]" : ""
                        }`}
                      />
                    </div>
                    <p className="group-hover:text-primary line-clamp-2 text-xs font-medium transition-colors">
                      {relatedCompany.name}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
