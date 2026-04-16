"use client"

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react"
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
  Flag,
  ChevronsDown,
  ChevronsUp,
  ChevronDown,
} from "lucide-react"
import { useUser, UserRole, MembershipTier } from "../../contexts/user-context"
import { useTranslation } from "react-i18next"
import { isDemoUser } from "@/components/login/demo"
import { industryFromUnknown } from "@/api/companies/adminCompany.mapper"
import { useCompanyDetail, useCompanyDirectory } from "@/api/companies/hooks"
import { ChannelContactsBlock } from "@/components/company/ChannelContactsBlock"
import type { CompanyChannelContact } from "@/api/companies/types"
import { useQueryClient } from "@tanstack/react-query"
import { useTierInfo } from "@/api/loyalty"
import { getCompanyData } from "../../data/mockCompanies"
import { truncateIntroduction, categoryNameToIdMap } from "../../utils/companyHelpers"
import { translateRegionLabel } from "@/utils/regionSearch"
import {
  getCountryLabel,
  REGISTER_COUNTRY_OTHER_VALUE,
} from "@/components/register/registerOptions"
import {
  COPY_FEEDBACK_MS,
  EMAIL_LIST_CLOSE_DELAY_MS,
  INDUSTRY_TAG_VISIBLE_DEFAULT,
  clearCloseTimer,
  getDeterministicHash,
  normalizeContactGroups,
  normalizeEmails,
  normalizeAddressList,
  pickSelectedByType,
  toWebsiteHref,
  usePersistentBooleanQuery,
  usePersistentStringQuery,
  type ContactGroup,
  type SocialContactItem,
} from "./companyDetail.logic"

interface CompanyDetailProps {
  companyId: string
}

type ContactTypeValueSectionProps = {
  icon: ComponentType<{ className?: string }>
  label: string
  items: SocialContactItem[]
  containerRef?: RefObject<HTMLDivElement | null>
  selectedItem?: SocialContactItem
  isListOpen: boolean
  onToggleList: () => void
  onSelectType: (type: string) => void
  copiedValue: string | null
  onCopy: (value: string) => void
  copyAriaLabel: (value: string) => string
  formatTypeLabel: (type: string) => string
}

function normalizeCompanyName(value: unknown): string {
  const text = String(value ?? "").trim()
  if (!text) return ""
  const normalized = text.toLowerCase()
  if (normalized === "null" || normalized === "undefined" || normalized === "n/a" || text === "-") {
    return ""
  }
  return text
}

function normalizeCompanyName(value: unknown): string {
  const text = String(value ?? "").trim()
  if (!text) return ""
  const normalized = text.toLowerCase()
  if (normalized === "null" || normalized === "undefined" || normalized === "n/a" || text === "-") {
    return ""
  }
  return text
}

function ContactTypeValueSection({
  icon: Icon,
  label,
  items,
  containerRef,
  selectedItem,
  isListOpen,
  onToggleList,
  onSelectType,
  copiedValue,
  onCopy,
  copyAriaLabel,
  formatTypeLabel,
}: ContactTypeValueSectionProps) {
  if (items.length === 0) return null

  const typeOptions = Array.from(new Set(items.map((item) => item.type)))
  const selectedTypeItems = selectedItem
    ? items.filter((item) => item.type === selectedItem.type)
    : []
  return (
    <div ref={containerRef} className="mt-4 flex items-start gap-3">
      <div className="bg-primary/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
        <Icon className="text-primary h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-muted-foreground text-sm">{label}</p>
        <div className="mt-2 grid grid-cols-[220px_minmax(0,1fr)] items-start gap-2">
          <div className="relative self-start">
            <button
              type="button"
              onClick={onToggleList}
              className="border-primary/20 from-primary/[0.08] via-muted/25 to-body-bg-dark/45 text-foreground flex h-9 w-full items-center justify-between rounded-md border bg-gradient-to-br px-2 text-sm font-medium shadow-sm"
            >
              <span>{formatTypeLabel(selectedItem?.type ?? "")}</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${isListOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isListOpen && (
              <div className="border-border/70 bg-body-bg-dark/95 absolute top-full right-0 left-2 z-20 mt-1 max-h-44 overflow-y-auto rounded-md border p-1 shadow-lg backdrop-blur-[2px]">
                {typeOptions.map((type) => (
                  <button
                    key={type}
                    type="button"
                    className="hover:bg-primary/10 focus:bg-primary/10 flex w-full items-center rounded px-2 py-1 text-left text-xs font-medium transition-colors"
                    onClick={() => onSelectType(type)}
                  >
                    {formatTypeLabel(type)}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div
            className="border-primary/20 from-primary/[0.08] via-muted/25 to-body-bg-dark/45 text-foreground min-h-9 rounded-md border bg-gradient-to-br px-2.5 py-1.5 text-sm font-medium break-all shadow-sm"
            onClick={() => {
              if (selectedItem?.value) onCopy(selectedItem.value)
            }}
          >
            {selectedTypeItems.length > 1 ? (
              <div className="space-y-1">
                {selectedTypeItems.map((entry, idx) => {
                  const displayValue = entry.contactName
                    ? `${entry.contactName}: ${entry.value}`
                    : entry.value
                  return (
                    <div
                      key={`${entry.type}-${entry.value}-${idx}`}
                      className="flex items-start gap-2"
                    >
                      <span className="min-w-0 flex-1">{displayValue}</span>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          onCopy(entry.value)
                        }}
                        className="text-muted-foreground hover:text-primary rounded p-0.5 transition-colors"
                        aria-label={copyAriaLabel(entry.value)}
                      >
                        {copiedValue === entry.value ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <span className="min-w-0 flex-1">
                  {selectedItem
                    ? selectedItem.contactName
                      ? `${selectedItem.contactName}: ${selectedItem.value}`
                      : selectedItem.value
                    : "-"}
                </span>
                {selectedItem?.value ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      onCopy(selectedItem.value)
                    }}
                    className="text-muted-foreground hover:text-primary rounded p-0.5 transition-colors"
                    aria-label={copyAriaLabel(selectedItem.value)}
                  >
                    {copiedValue === selectedItem.value ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CompanyDetail({ companyId }: CompanyDetailProps) {
  const searchParams = useSearchParams()
  const fromCategory = searchParams.get("fromCategory")
  const backParam = searchParams.get("back")
  const { t, i18n } = useTranslation()
  const { user, isLoggedIn } = useUser()
  const isDemo = isLoggedIn && !!user && isDemoUser(user)
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null)
  const [copiedContactValue, setCopiedContactValue] = useState<string | null>(null)
  const [isSocialTypeListOpen, setIsSocialTypeListOpen] = useState(false)
  const [isOtherTypeListOpen, setIsOtherTypeListOpen] = useState(false)
  const socialSectionRef = useRef<HTMLDivElement>(null)
  const otherSectionRef = useRef<HTMLDivElement>(null)
  const emailListCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const contactListCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const queryClient = useQueryClient()
  const companyUiKey = <T extends string>(suffix: T) =>
    ["ui", "companyDetail", companyId, suffix] as const
  const setUiString = <T extends readonly unknown[]>(key: T, value: string) =>
    queryClient.setQueryData<string>(key, value)
  const setUiBool = <T extends readonly unknown[]>(
    key: T,
    value: boolean | ((prev: boolean | undefined) => boolean)
  ) => queryClient.setQueryData<boolean>(key, value)

  const industriesExpandedQueryKey = companyUiKey("industriesExpanded")
  const industriesExpanded = usePersistentBooleanQuery(industriesExpandedQueryKey)
  const selectedEmailQueryKey = companyUiKey("selectedEmail")
  const selectedContactKeyQueryKey = companyUiKey("selectedContactKey")
  const selectedSocialTypeQueryKey = companyUiKey("selectedSocialType")
  const selectedOtherTypeQueryKey = companyUiKey("selectedOtherType")
  const emailListOpenQueryKey = companyUiKey("isEmailListOpen")
  const contactListOpenQueryKey = companyUiKey("isContactListOpen")
  const selectedEmail = usePersistentStringQuery(selectedEmailQueryKey)
  const selectedContactKey = usePersistentStringQuery(selectedContactKeyQueryKey)
  const selectedSocialType = usePersistentStringQuery(selectedSocialTypeQueryKey)
  const selectedOtherType = usePersistentStringQuery(selectedOtherTypeQueryKey)
  const isEmailListOpen = usePersistentBooleanQuery(emailListOpenQueryKey)
  const isContactListOpen = usePersistentBooleanQuery(contactListOpenQueryKey)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [companyId])

  useEffect(() => {
    return () => {
      clearCloseTimer(emailListCloseTimerRef)
      clearCloseTimer(contactListCloseTimerRef)
    }
  }, [])

  useEffect(() => {
    const handleOutsidePointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null
      if (!target) return

      if (isSocialTypeListOpen && !socialSectionRef.current?.contains(target)) {
        setIsSocialTypeListOpen(false)
      }
      if (isOtherTypeListOpen && !otherSectionRef.current?.contains(target)) {
        setIsOtherTypeListOpen(false)
      }
    }

    document.addEventListener("mousedown", handleOutsidePointerDown)
    return () => {
      document.removeEventListener("mousedown", handleOutsidePointerDown)
    }
  }, [isSocialTypeListOpen, isOtherTypeListOpen])

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
  const hasRelatedIndustryQuery =
    relatedIndustry != null &&
    relatedIndustry !== "" &&
    (!Array.isArray(relatedIndustry) || relatedIndustry.length > 0)

  const { data: relatedDirectoryData } = useCompanyDirectory(
    {
      industry: relatedIndustry,
      page: 1,
      limit: 60,
      sortBy: "name",
      sortOrder: "asc",
    },
    hasRelatedIndustryQuery
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

  const channelContacts: CompanyChannelContact[] = useMemo(() => {
    if (isDemo) return []
    const raw = apiCompany?.channelContacts ?? []
    return raw.filter(
      (c) =>
        c &&
        String(c.type ?? "")
          .trim()
          .toLowerCase() !== "register_email" &&
        typeof c.value === "string" &&
        c.value.trim().length > 0
    )
  }, [isDemo, apiCompany])

  if (!isDemo && isCompanyLoading) {
    return (
      <div className="bg-body-bg-dark py-16 text-center">
        <p className="text-muted-foreground">{t("companyDetail.loading") || "Loading..."}</p>
      </div>
    )
  }

  // Check if error is 403 industry access denied
  const companyError = apiCompanyError as { status?: number; message?: string } | null
  const isIndustryAccessDenied =
    !isDemo &&
    isCompanyError &&
    companyError &&
    companyError.status === 403 &&
    companyError.message?.includes("do not have access to companies in this industry")

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

  const demoCompany = isDemo ? getCompanyData(companyId) : null
  const detailAddresses =
    isDemo || !apiCompany
      ? []
      : normalizeAddressList(
          (apiCompany.contacts ?? [])
            .filter((contact) => String(contact.type).trim().toLowerCase() === "address")
            .map((contact) => String(contact.value))
        )

  const detailWebsites =
    isDemo || !apiCompany
      ? []
      : normalizeAddressList(
          (apiCompany.contacts ?? [])
            .filter((contact) => String(contact.type).trim().toLowerCase() === "website")
            .map((contact) => String(contact.value))
        )

  const socialContacts =
    isDemo || !apiCompany
      ? []
      : (apiCompany.contacts ?? [])
          .map((contact) => ({
            type: String(contact.type).trim().toLowerCase(),
            value: String(contact.value ?? "").trim(),
            contactName: String(contact.contactName ?? "").trim(),
          }))
          .filter((contact) => {
            const allowed = new Set(["zalo", "wechat", "line", "skype", "facebook", "viber"])
            return allowed.has(contact.type) && contact.value.length > 0
          })

  const otherContacts =
    isDemo || !apiCompany
      ? []
      : (apiCompany.contacts ?? [])
          .map((contact) => ({
            type: String(contact.type).trim().toLowerCase(),
            value: String(contact.value ?? "").trim(),
            contactName: String(contact.contactName ?? "").trim(),
          }))
          .filter((contact) => {
            const allowed = new Set(["tel", "hotline", "fax"])
            return allowed.has(contact.type) && contact.value.length > 0
          })

  const company =
    isDemo && demoCompany
      ? {
          ...demoCompany,
          addresses: demoCompany.address ? [demoCompany.address] : [],
          websites: normalizeAddressList([demoCompany.website ?? ""]),
          origin: demoCompany.origin ?? "",
        }
      : {
          id: apiCompany!.id,
          nameCn: apiCompany!.companyNameZh ?? "",
          nameEn: apiCompany!.companyNameEn ?? "",
          logo: apiCompany!.logoUrl ?? "/placeholder.svg",
          category: apiCompany!.industry,
          categoryTags: [],
          addresses: detailAddresses,
          phone: apiCompany!.phone ?? "",
          email: apiCompany!.email ?? "",
          emails: apiCompany!.emails ?? [],
          contactPhonesByName: [],
          websites: detailWebsites,
          contactPerson: "",
          region: apiCompany!.region ?? "",
          origin: (() => {
            const raw = apiCompany!.country
            const s = raw == null ? "" : String(raw).trim()
            return s || REGISTER_COUNTRY_OTHER_VALUE
          })(),
          taxId: apiCompany!.taxId ?? "",
          introduction: apiCompany!.description,
          services: [],
          products: [],
        }

  const companyEmails = isDemo
    ? normalizeEmails([company.email])
    : normalizeEmails(apiCompany?.emails ?? [])

  const contactsByName = isDemo
    ? [
        {
          contactName: company.contactPerson,
          contactPhones: normalizeEmails([company.phone]),
        },
      ]
    : normalizeContactGroups(
        Object.values(
          (apiCompany?.contacts ?? [])
            .filter((contact) => String(contact.type).trim().toLowerCase() === "contact_person")
            .reduce(
              (acc, contact) => {
                const contactName = String(contact.contactName ?? "").trim()
                const phone = String(contact.value ?? "").trim()
                if (!phone) return acc
                const key = contactName || "-"
                const current = acc[key] ?? { contactName, contactPhones: [] as string[] }
                current.contactPhones.push(phone)
                acc[key] = current
                return acc
              },
              {} as Record<string, { contactName: string; contactPhones: string[] }>
            )
        ) as ContactGroup[]
      )

  const effectiveSelectedEmail = companyEmails.includes(selectedEmail)
    ? selectedEmail
    : (companyEmails[0] ?? "")
  const effectiveSelectedContactKey = contactsByName[Number(selectedContactKey)]
    ? selectedContactKey
    : "0"
  const selectedContact = contactsByName[Number(effectiveSelectedContactKey)] ?? contactsByName[0]
  const contactPersonDisplayName = (contact: { contactName: string; contactPhones: string[] }) => {
    const name = contact.contactName.trim()
    if (name) return name
    if (contact.contactPhones.length > 0) {
      return t("companyDetail.contactNameUnknown", { defaultValue: "Unknown" })
    }
    return t("companyDetail.contactPerson", { defaultValue: "Contact Person" })
  }
  const selectedSocialContact = pickSelectedByType(socialContacts, selectedSocialType)
  const selectedOtherContact = pickSelectedByType(otherContacts, selectedOtherType)

  const companyNameZh = normalizeCompanyName(isDemo ? company.nameCn : apiCompany?.companyNameZh)
  const companyNameEn = normalizeCompanyName(isDemo ? company.nameEn : apiCompany?.companyNameEn)
  const companyNameVi = normalizeCompanyName(isDemo ? company.nameEn : apiCompany?.companyNameVi)
  const companyTitle = companyNameZh || companyNameVi || companyNameEn || "-"
  const translatedRegion = translateRegionLabel(company.region, t, i18n)
  const translatedOrigin =
    company.origin === REGISTER_COUNTRY_OTHER_VALUE
      ? t("companyDetail.originCountryOther", { defaultValue: "Other" })
      : getCountryLabel(company.origin, i18n.language)
  const formatChannelContactTypeLabel = (type: string): string => {
    const normalized = String(type ?? "")
      .trim()
      .toLowerCase()
    if (!normalized) return "-"
    return t(`admin.companies.contactTypes.${normalized}`, {
      defaultValue: t(`companyDetail.channelContactTypes.${normalized}`, {
        defaultValue: normalized.toUpperCase(),
      }),
    })
  }
  const fallbackBackToDirectory = fromCategory
    ? `/directory?category=${encodeURIComponent(fromCategory)}`
    : "/directory"
  const backToDirectoryHref =
    backParam && backParam.startsWith("/directory") ? backParam : fallbackBackToDirectory
  const encodedBackToDirectory = encodeURIComponent(backToDirectoryHref)

  const industryTags = [...new Set(industryFromUnknown(company.category as unknown))].map(
    (entry) => {
      const slug = categoryNameToIdMap[entry] ?? entry
      return {
        key: `${slug}-${entry}`,
        label: t(`directory.categories.${slug}`, { defaultValue: entry }),
      }
    }
  )

  const industryTagsOverflow = industryTags.length > INDUSTRY_TAG_VISIBLE_DEFAULT
  const visibleIndustryTags = industriesExpanded
    ? industryTags
    : industryTags.slice(0, INDUSTRY_TAG_VISIBLE_DEFAULT)
  const hiddenIndustryCount = Math.max(0, industryTags.length - INDUSTRY_TAG_VISIBLE_DEFAULT)

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

  const handleCopyWithFeedback = async (
    value: string,
    setter: Dispatch<SetStateAction<string | null>>
  ) => {
    const copied = await copyTextSafely(value)
    if (!copied) return
    setter(value)
    setTimeout(() => setter((prev) => (prev === value ? null : prev)), COPY_FEEDBACK_MS)
  }
  const handleCopyEmail = (email: string) => handleCopyWithFeedback(email, setCopiedEmail)
  const handleCopyPhone = (phone: string) => handleCopyWithFeedback(phone, setCopiedPhone)

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: companyTitle,
        text: `查看 ${companyTitle} 的企業資訊`,
        url: window.location.href,
      })
    } else {
      await copyTextSafely(window.location.href)
    }
  }

  const openEmailList = () => {
    clearCloseTimer(emailListCloseTimerRef)
    setUiBool(emailListOpenQueryKey, true)
  }

  const scheduleCloseEmailList = () => {
    clearCloseTimer(emailListCloseTimerRef)
    emailListCloseTimerRef.current = setTimeout(() => {
      setUiBool(emailListOpenQueryKey, false)
      clearCloseTimer(emailListCloseTimerRef)
    }, EMAIL_LIST_CLOSE_DELAY_MS)
  }

  const openContactList = () => {
    clearCloseTimer(contactListCloseTimerRef)
    setUiBool(contactListOpenQueryKey, true)
  }

  const scheduleCloseContactList = () => {
    clearCloseTimer(contactListCloseTimerRef)
    contactListCloseTimerRef.current = setTimeout(() => {
      setUiBool(contactListOpenQueryKey, false)
      clearCloseTimer(contactListCloseTimerRef)
    }, EMAIL_LIST_CLOSE_DELAY_MS)
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
                    alt={companyTitle}
                    fill
                    className={`object-contain p-4 ${shouldBlurLogo ? "blur-sm" : ""}`}
                  />
                </div>
              </div>

              <div className="lg:w-2/3 lg:p-8">
                <div className="group relative mb-6">
                  <h1 key={i18n.language} className="text-foreground mb-2 text-3xl font-bold">
                    {companyTitle}
                  </h1>
                  <p key={`${i18n.language}-vi`} className="text-muted-foreground mb-1 text-lg">
                    {companyNameVi || companyNameEn}
                  </p>
                  <div className="border-destructive/40 bg-body-bg-dark pointer-events-none absolute top-full left-0 z-20 mt-1 hidden min-w-[240px] rounded-md border px-3 py-2 text-sm shadow-lg group-hover:block">
                    <p className="text-destructive font-medium">
                      Vietnamese: {companyNameVi || "-"}
                    </p>
                    <p className="text-destructive font-medium">Taiwan: {companyNameZh || "-"}</p>
                    <p className="text-destructive font-medium">English: {companyNameEn || "-"}</p>
                  </div>
                </div>

                {(industryTags.length > 0 || company.categoryTags.length > 0) && (
                  <div className="mb-6 space-y-4">
                    {industryTags.length > 0 && (
                      <div className="border-border/50 bg-muted/15 rounded-xl border p-3">
                        <div className="mb-2.5 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="bg-primary/15 flex h-7 w-7 shrink-0 items-center justify-center rounded-md">
                              <Building2 className="text-primary h-3.5 w-3.5" aria-hidden />
                            </div>
                            <span className="text-foreground text-xs font-semibold tracking-tight sm:text-sm">
                              {t("directory.industryCategory")}
                            </span>
                          </div>
                          <span className="text-primary bg-primary/10 rounded-full px-2 py-0.5 text-[10px] font-semibold sm:text-[11px]">
                            {industryTags.length}
                          </span>
                        </div>
                        <ul className="m-0 flex w-full list-none flex-col gap-1.5 p-0">
                          {visibleIndustryTags.map(({ key, label }) => (
                            <li key={key} className="w-full min-w-0">
                              <span className="border-primary/20 bg-primary/[0.06] text-primary flex w-full min-w-0 items-center justify-start rounded-md border px-2.5 py-1.5 text-left text-[11px] leading-snug font-medium break-words sm:text-xs">
                                {label}
                              </span>
                            </li>
                          ))}
                        </ul>
                        {industryTagsOverflow && (
                          <div className="border-border/40 mt-2.5 border-t pt-2">
                            <button
                              type="button"
                              className="text-primary hover:bg-primary/10 flex w-full items-center justify-center gap-1 rounded-md py-1 text-center transition-colors"
                              onClick={() =>
                                setUiBool(industriesExpandedQueryKey, (prev) => !(prev ?? false))
                              }
                              aria-expanded={industriesExpanded}
                              aria-label={
                                industriesExpanded
                                  ? t("companyDetail.industriesShowLess")
                                  : t("companyDetail.industriesSeeMoreAria", {
                                      count: hiddenIndustryCount,
                                    })
                              }
                            >
                              {industriesExpanded ? (
                                <>
                                  <ChevronsUp className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                                  <span className="text-[11px] font-semibold">
                                    {t("companyDetail.industriesShowLess")}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <ChevronsDown
                                    className="h-4 w-4 shrink-0 opacity-90"
                                    aria-hidden
                                  />
                                  <span className="text-[11px] font-semibold">
                                    {t("companyDetail.industriesSeeMore")}
                                  </span>
                                  <span className="text-muted-foreground text-[10px] font-normal">
                                    {t("companyDetail.industriesShowMore", {
                                      count: hiddenIndustryCount,
                                    })}
                                  </span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {company.categoryTags.length > 0 && (
                      <div className="rounded-lg border border-white/5 bg-black/10 p-2.5">
                        <p className="text-muted-foreground mb-1.5 text-[11px] font-medium">
                          {t("companyDetail.keywordTags")}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {company.categoryTags.map((tag) => {
                            const translatedTag = t(`directory.categoryTags.${tag}`, {
                              defaultValue: tag,
                            })
                            return (
                              <span
                                key={tag}
                                className="bg-body-bg-dark/45 border-border/50 text-muted-foreground inline-flex max-w-full items-center rounded-md border px-2 py-0.5 text-[11px] font-medium break-words"
                              >
                                {translatedTag}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-[7fr_3fr]">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                      <MapPin className="text-primary h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-muted-foreground text-sm">
                        {t("companyDetail.address") || "地址"}
                      </p>
                      <div className="space-y-1">
                        {company.addresses.length > 0 ? (
                          <ul className="list-disc space-y-1 pl-5">
                            {company.addresses.map((addr, idx) => (
                              <li key={`${addr}-${idx}`} className="text-sm font-medium">
                                {addr}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm font-medium">-</p>
                        )}
                      </div>
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

                  {company.origin && (
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                        <Flag className="text-primary h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">
                          {t("companyDetail.origin") || "來源地"}
                        </p>
                        <p className="text-sm font-medium">{translatedOrigin}</p>
                      </div>
                    </div>
                  )}

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

                  {company.websites.length > 0 && (
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                        <Globe className="text-primary h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-muted-foreground text-sm">
                          {t("companyDetail.website") || "官網"}
                        </p>
                        <div className="space-y-1">
                          {company.websites.length > 1 ? (
                            <ul className="list-disc space-y-1 pl-5">
                              {company.websites.map((website: string, idx: number) => (
                                <li key={`${website}-${idx}`} className="text-sm font-medium">
                                  <a
                                    href={toWebsiteHref(website)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary inline-flex items-center gap-1 hover:underline"
                                  >
                                    {website}
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <a
                              href={toWebsiteHref(company.websites[0])}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline"
                            >
                              {company.websites[0]}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <ChannelContactsBlock
                  companyId={companyId}
                  contacts={channelContacts}
                  copiedValue={copiedPhone}
                  onCopyValue={(value) => void handleCopyPhone(value)}
                  t={t}
                />

                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                    <Mail className="text-primary h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-muted-foreground text-sm">Email</p>
                    <div className="mt-1 space-y-1.5">
                      {companyEmails.length > 0 ? (
                        <div
                          className="relative"
                          onMouseEnter={openEmailList}
                          onMouseLeave={scheduleCloseEmailList}
                        >
                          {companyEmails.length === 1 ? (
                            <button
                              type="button"
                              onClick={() => void handleCopyEmail(effectiveSelectedEmail)}
                              className="from-primary/[0.08] via-muted/25 to-body-bg-dark/45 border-primary/20 hover:border-primary/35 focus-visible:ring-ring flex w-full items-center gap-2 rounded-lg border bg-gradient-to-br px-2.5 py-1.5 text-left shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
                              aria-label={t("companyDetail.channelContactCopyRow", {
                                defaultValue: "Copy {{value}}",
                                value: effectiveSelectedEmail,
                              })}
                            >
                              <p className="min-w-0 flex-1 text-sm font-medium break-all">
                                {effectiveSelectedEmail}
                              </p>
                              <span
                                className="text-muted-foreground hover:text-primary rounded p-0.5 transition-colors"
                                aria-hidden
                              >
                                {copiedEmail === effectiveSelectedEmail ? (
                                  <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </span>
                            </button>
                          ) : (
                            <div className="from-primary/[0.08] via-muted/25 to-body-bg-dark/45 border-primary/20 flex items-center gap-2 rounded-lg border bg-gradient-to-br px-2.5 py-1.5 shadow-sm">
                              <p className="min-w-0 flex-1 text-sm font-medium break-all">
                                {effectiveSelectedEmail}
                              </p>
                              <span
                                className="text-muted-foreground rounded p-0.5 transition-colors"
                                aria-hidden
                              >
                                {copiedEmail === effectiveSelectedEmail ? (
                                  <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </span>
                            </div>
                          )}
                          {companyEmails.length > 1 && isEmailListOpen && (
                            <div
                              className="border-border/70 bg-body-bg-dark/95 absolute top-full right-0 left-2 z-20 mt-1 max-h-44 overflow-y-auto rounded-md border p-1 shadow-lg backdrop-blur-[2px]"
                              onMouseEnter={openEmailList}
                              onMouseLeave={scheduleCloseEmailList}
                            >
                              {companyEmails.map((email) => (
                                <button
                                  key={`email-hover-${email}`}
                                  type="button"
                                  className="hover:bg-primary/10 focus:bg-primary/10 flex w-full items-center gap-2 rounded px-2 py-1 text-left transition-colors"
                                  onClick={() => {
                                    setUiString(selectedEmailQueryKey, email)
                                    if (emailListCloseTimerRef.current) {
                                      clearTimeout(emailListCloseTimerRef.current)
                                      emailListCloseTimerRef.current = null
                                    }
                                    setUiBool(emailListOpenQueryKey, false)
                                    void handleCopyEmail(email)
                                  }}
                                >
                                  <span className="min-w-0 flex-1 truncate text-xs font-medium">
                                    {email}
                                  </span>
                                  <span className="text-muted-foreground hover:text-primary inline-flex h-5 w-5 items-center justify-center rounded transition-colors">
                                    {copiedEmail === email ? (
                                      <Check className="h-3.5 w-3.5 text-green-600" />
                                    ) : (
                                      <Copy className="h-3.5 w-3.5" />
                                    )}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm font-medium">-</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2"> </div>

                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                    <User className="text-primary h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-muted-foreground text-sm">
                      {t("companyDetail.contactPerson") || "聯絡人"}
                    </p>
                    <div className="mt-2 space-y-2">
                      {contactsByName.length > 0 ? (
                        <>
                          {contactsByName.length > 1 && (
                            <div
                              className="relative"
                              onMouseEnter={openContactList}
                              onMouseLeave={scheduleCloseContactList}
                            >
                              <div className="border-border bg-body-bg-dark/40 text-foreground h-8 w-full rounded-md border px-2 text-xs">
                                <div className="flex h-full items-center justify-between gap-2">
                                  <span className="min-w-0 truncate">
                                    {contactsByName[Number(effectiveSelectedContactKey)]
                                      ? contactPersonDisplayName(
                                          contactsByName[Number(effectiveSelectedContactKey)]!
                                        )
                                      : t("companyDetail.contactPerson", {
                                          defaultValue: "Contact Person",
                                        })}
                                  </span>
                                  <ChevronDown
                                    className={`h-4 w-4 shrink-0 transition-transform ${isContactListOpen ? "rotate-180" : ""}`}
                                  />
                                </div>
                              </div>
                              {isContactListOpen && (
                                <div
                                  className="border-border/70 bg-body-bg-dark/95 absolute top-full right-0 left-2 z-20 mt-1 max-h-44 overflow-y-auto rounded-md border p-1 shadow-lg backdrop-blur-[2px]"
                                  onMouseEnter={openContactList}
                                  onMouseLeave={scheduleCloseContactList}
                                >
                                  {contactsByName.map((contact, idx) => (
                                    <button
                                      key={`contact-hover-${idx}-${contact.contactPhones[0] ?? "none"}`}
                                      type="button"
                                      className="hover:bg-primary/10 focus:bg-primary/10 flex w-full items-center rounded px-2 py-1 text-left text-xs font-medium transition-colors"
                                      onClick={() => {
                                        setUiString(selectedContactKeyQueryKey, String(idx))
                                        if (contactListCloseTimerRef.current) {
                                          clearTimeout(contactListCloseTimerRef.current)
                                          contactListCloseTimerRef.current = null
                                        }
                                        setUiBool(contactListOpenQueryKey, false)
                                      }}
                                    >
                                      {contactPersonDisplayName(contact)}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                          {selectedContact && (
                            <div className="from-primary/[0.08] via-muted/25 to-body-bg-dark/40 border-primary/20 rounded-lg border bg-gradient-to-br p-2.5 shadow-sm">
                              <div className="flex items-center justify-between gap-2">
                                <p className="flex min-w-0 items-center gap-2 text-sm font-semibold">
                                  <User className="text-primary h-4 w-4 shrink-0" />
                                  <span className="truncate">
                                    {contactPersonDisplayName(selectedContact)}
                                  </span>
                                </p>
                                <span className="text-primary bg-primary/15 border-primary/30 rounded-full border px-2 py-0.5 text-[11px] font-semibold">
                                  {selectedContact.contactPhones.length}
                                </span>
                              </div>
                              <div className="mt-1.5 space-y-1">
                                {selectedContact.contactPhones.map((phone) => (
                                  <button
                                    key={`${selectedContact.contactPhones[0] ?? "none"}-${phone}`}
                                    type="button"
                                    onClick={() => void handleCopyPhone(phone)}
                                    className="bg-body-bg-dark/55 border-border/60 hover:border-primary/30 hover:bg-body-bg-dark/70 focus-visible:ring-ring flex w-full items-center gap-2 rounded-md border px-2 py-1 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
                                    aria-label={t("companyDetail.channelContactCopyRow", {
                                      defaultValue: "Copy {{value}}",
                                      value: phone,
                                    })}
                                  >
                                    <Phone className="text-primary/80 h-3.5 w-3.5" />
                                    <p className="min-w-0 flex-1 text-sm font-medium break-words">
                                      {phone}
                                    </p>
                                    <span
                                      className="text-muted-foreground hover:text-primary rounded p-0.5 transition-colors"
                                      aria-hidden
                                    >
                                      {copiedPhone === phone ? (
                                        <Check className="h-4 w-4 text-green-600" />
                                      ) : (
                                        <Copy className="h-4 w-4" />
                                      )}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-sm font-medium">-</p>
                      )}
                    </div>
                  </div>
                </div>

                <ContactTypeValueSection
                  icon={Globe}
                  label={t("admin.companies.contactGroups.social", {
                    defaultValue: "Social & Messaging",
                  })}
                  items={socialContacts}
                  containerRef={socialSectionRef}
                  selectedItem={selectedSocialContact}
                  isListOpen={isSocialTypeListOpen}
                  onToggleList={() => setIsSocialTypeListOpen((prev) => !prev)}
                  onSelectType={(type) => {
                    setUiString(selectedSocialTypeQueryKey, type)
                    setIsSocialTypeListOpen(false)
                  }}
                  copiedValue={copiedContactValue}
                  onCopy={(value) => void handleCopyWithFeedback(value, setCopiedContactValue)}
                  copyAriaLabel={(value) =>
                    t("companyDetail.channelContactCopyRow", {
                      defaultValue: "Copy {{value}}",
                      value,
                    })
                  }
                  formatTypeLabel={formatChannelContactTypeLabel}
                />

                <ContactTypeValueSection
                  icon={Phone}
                  label={t("admin.companies.contactGroups.otherContact", {
                    defaultValue: "Other Contact",
                  })}
                  items={otherContacts}
                  containerRef={otherSectionRef}
                  selectedItem={selectedOtherContact}
                  isListOpen={isOtherTypeListOpen}
                  onToggleList={() => setIsOtherTypeListOpen((prev) => !prev)}
                  onSelectType={(type) => {
                    setUiString(selectedOtherTypeQueryKey, type)
                    setIsOtherTypeListOpen(false)
                  }}
                  copiedValue={copiedContactValue}
                  onCopy={(value) => void handleCopyWithFeedback(value, setCopiedContactValue)}
                  copyAriaLabel={(value) =>
                    t("companyDetail.channelContactCopyRow", {
                      defaultValue: "Copy {{value}}",
                      value,
                    })
                  }
                  formatTypeLabel={formatChannelContactTypeLabel}
                />

                <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2"></div>

                <div className="flex flex-wrap gap-3">
                  {effectiveSelectedEmail && (
                    <Button variant="primary" asChild>
                      <a href={`mailto:${effectiveSelectedEmail}`}>
                        <Mail className="mr-2 h-4 w-4" />
                        {t("companyDetail.contactCompany") || "聯絡公司"}
                      </a>
                    </Button>
                  )}

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
