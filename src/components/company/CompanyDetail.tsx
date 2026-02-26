"use client"

import { useState, useEffect } from "react"
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
  Heart,
  Share2,
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Crown,
  FileText,
} from "lucide-react"
import { useUser, MEMBERSHIP_THRESHOLDS } from "../../contexts/user-context"
import { useTranslation } from "react-i18next"
import { getCompanyData } from "../../data/mockCompanies"
import {
  maskCompanyName,
  truncateIntroduction,
  maskIntroductionCompanyNames,
  categoryNameToIdMap,
} from "../../utils/companyHelpers"

interface CompanyDetailProps {
  companyId: string
}

export default function CompanyDetail({ companyId }: CompanyDetailProps) {
  const searchParams = useSearchParams()
  const fromCategory = searchParams.get("fromCategory")
  const { t, i18n } = useTranslation()
  const { user, isLoggedIn, getTotalPoints } = useUser()
  const [isFavorite, setIsFavorite] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [copiedPhone, setCopiedPhone] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [companyId])

  const company = getCompanyData(companyId)

  const companyNameCn = t(`companyDetail.companies.${companyId}.nameCn`, {
    defaultValue: company.nameCn,
  })
  const companyNameEn = t(`companyDetail.companies.${companyId}.nameEn`, {
    defaultValue: company.nameEn,
  })
  const companyNameVn = company.nameVn
    ? t(`companyDetail.companies.${companyId}.nameVn`, { defaultValue: company.nameVn })
    : undefined

  const categoryId = categoryNameToIdMap[company.category] || ""
  const translatedCategory = categoryId ? t(`directory.categories.${categoryId}`) : company.category

  const totalPoints = getTotalPoints()

  const isGuest = !isLoggedIn || !user || totalPoints < MEMBERSHIP_THRESHOLDS.bronze
  const isBronze =
    isLoggedIn &&
    user &&
    totalPoints >= MEMBERSHIP_THRESHOLDS.bronze &&
    totalPoints < MEMBERSHIP_THRESHOLDS.silver
  const isSilverOrAbove =
    isLoggedIn && user && (totalPoints >= MEMBERSHIP_THRESHOLDS.silver || user.role === "admin")

  const isFreeUser = !isSilverOrAbove

  const handleCopyEmail = async () => {
    await navigator.clipboard.writeText(company.email)
    setCopiedEmail(true)
    setTimeout(() => setCopiedEmail(false), 2000)
  }

  const handleCopyPhone = async () => {
    await navigator.clipboard.writeText(company.phone)
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
      await navigator.clipboard.writeText(window.location.href)
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
          href={
            fromCategory ? `/directory?category=${encodeURIComponent(fromCategory)}` : "/directory"
          }
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
                    className={`object-contain p-4 ${isGuest ? "blur-sm" : ""}`}
                  />
                </div>
              </div>

              <div className="lg:w-2/3 lg:p-8">
                <div className="mb-6">
                  <h1 key={i18n.language} className="text-foreground mb-2 text-3xl font-bold">
                    {isGuest ? maskCompanyName(companyNameCn) : companyNameCn}
                  </h1>
                  <p key={`${i18n.language}-en`} className="text-muted-foreground mb-1 text-lg">
                    {isGuest ? maskCompanyName(companyNameEn) : companyNameEn}
                  </p>
                  {companyNameVn && (
                    <p key={`${i18n.language}-vn`} className="text-muted-foreground text-base">
                      {isGuest ? maskCompanyName(companyNameVn) : companyNameVn}
                    </p>
                  )}
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
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${isFreeUser ? "bg-muted" : "bg-primary/10"}`}
                    >
                      {isFreeUser ? (
                        <Lock className="text-muted-foreground h-5 w-5" />
                      ) : (
                        <MapPin className="text-primary h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-muted-foreground text-sm">
                        {t("companyDetail.address") || "地址"}
                      </p>
                      <p
                        className={`text-sm font-medium ${isFreeUser ? "text-muted-foreground/40 blur-[3px] select-none" : ""}`}
                      >
                        {company.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${isFreeUser ? "bg-muted" : "bg-primary/10"}`}
                    >
                      {isFreeUser ? (
                        <Lock className="text-muted-foreground h-5 w-5" />
                      ) : (
                        <Phone className="text-primary h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-muted-foreground text-sm">
                        {t("companyDetail.phone") || "電話"}
                      </p>
                      {isFreeUser ? (
                        <p className="text-muted-foreground/40 text-sm font-medium blur-[3px] select-none">
                          {company.phone}
                        </p>
                      ) : (
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
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${isFreeUser ? "bg-muted" : "bg-primary/10"}`}
                    >
                      {isFreeUser ? (
                        <Lock className="text-muted-foreground h-5 w-5" />
                      ) : (
                        <Mail className="text-primary h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-muted-foreground text-sm">Email</p>
                      {isFreeUser ? (
                        <p className="text-muted-foreground/40 text-sm font-medium blur-[3px] select-none">
                          {company.email}
                        </p>
                      ) : (
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
                      )}
                    </div>
                  </div>

                  {company.website && (
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${isFreeUser ? "bg-muted" : "bg-primary/10"}`}
                      >
                        {isFreeUser ? (
                          <Lock className="text-muted-foreground h-5 w-5" />
                        ) : (
                          <Globe className="text-primary h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-muted-foreground text-sm">
                          {t("companyDetail.website") || "官網"}
                        </p>
                        {isFreeUser ? (
                          <p className="text-muted-foreground/40 text-sm font-medium blur-[3px] select-none">
                            {company.website}
                          </p>
                        ) : (
                          <a
                            href={`https://${company.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline"
                          >
                            {company.website}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${isFreeUser ? "bg-muted" : "bg-primary/10"}`}
                    >
                      {isFreeUser ? (
                        <Lock className="text-muted-foreground h-5 w-5" />
                      ) : (
                        <User className="text-primary h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">
                        {t("companyDetail.contactPerson") || "聯絡人"}
                      </p>
                      <p
                        className={`text-sm font-medium ${isFreeUser ? "text-muted-foreground/40 blur-[3px] select-none" : ""}`}
                      >
                        {company.contactPerson}
                      </p>
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
                      <p className="text-sm font-medium">
                        {t(`companyDetail.regions.${company.region}`, {
                          defaultValue: company.region,
                        })}
                      </p>
                    </div>
                  </div>

                  {company.taxId && (
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${isSilverOrAbove ? "bg-primary/10" : "bg-muted"}`}
                      >
                        {isSilverOrAbove ? (
                          <FileText className="text-primary h-5 w-5" />
                        ) : (
                          <Lock className="text-muted-foreground h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">
                          {t("companyDetail.taxId") || "稅號"}
                        </p>
                        <p
                          className={`text-sm font-medium ${!isSilverOrAbove ? "text-muted-foreground/40 blur-[3px] select-none" : ""}`}
                        >
                          {company.taxId}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {!isFreeUser && (
                  <div className="flex flex-wrap gap-3">
                    <Button variant="primary" asChild>
                      <a href={`mailto:${company.email}`}>
                        <Mail className="mr-2 h-4 w-4" />
                        {t("companyDetail.contactCompany") || "聯絡公司"}
                      </a>
                    </Button>
                    <Button
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
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleShare}
                      className="hover:!bg-header-red-dark !bg-body-bg-dark border hover:!text-white"
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      {t("companyDetail.share") || "分享"}
                    </Button>
                  </div>
                )}
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
                    {isGuest
                      ? maskIntroductionCompanyNames(
                          truncateIntroduction(translatedIntroduction, 50),
                          companyNameCn
                        )
                      : truncateIntroduction(translatedIntroduction, 50)}
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
                href={
                  fromCategory
                    ? `/directory?category=${encodeURIComponent(fromCategory)}`
                    : "/directory"
                }
                className="text-primary text-sm hover:underline"
                onClick={() => window.scrollTo(0, 0)}
              >
                {t("companyDetail.viewMore") || "查看更多"}
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
              {[1, 2, 3, 4, 5, 6].map((i) => {
                const relatedCompanyName = companyNameCn.replace(/\d+/, String(i + 10))
                return (
                  <Link
                    key={i}
                    href={`/directory/${companyId.split("-")[0]}-${i + 10}${fromCategory ? `?fromCategory=${encodeURIComponent(fromCategory)}` : ""}`}
                    className="group"
                  >
                    <div className="bg-muted relative mb-2 aspect-square overflow-hidden rounded-lg">
                      <Image
                        src="/assets/images/companies/product-design-concept.png"
                        alt={`相關企業 ${i}`}
                        fill
                        className={`object-cover transition-transform duration-300 group-hover:scale-105 ${isFreeUser ? "blur-[3px]" : ""}`}
                      />
                    </div>
                    <p className="group-hover:text-primary line-clamp-2 text-xs font-medium transition-colors">
                      {isFreeUser ? maskCompanyName(relatedCompanyName) : relatedCompanyName}
                    </p>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
