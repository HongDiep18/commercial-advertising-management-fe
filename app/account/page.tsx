"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useUser, UserRole, MembershipTier, MEMBERSHIP_CONFIG } from "@/contexts/user-context"
import { useTranslation } from "react-i18next"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import {
  AccountHeroCard,
  AccountUpgradeCard,
  AccountPointsHistory,
  AccountCommercialHistory,
  AccountAdOrdersSection,
  AccountUpgradeModal,
  AccountProfileModal,
  AccountBenefitsModal,
  AccountIndustrySelectionModal,
  REGION_KEYS_BY_COUNTRY,
  COUNTRY_NONE,
} from "@/components/account"
import type { ProfileFormData } from "@/types/account"
import { getProfile, getProfileAndLogoFromUpdateData, type ProfileResponse } from "@/api/profile"
import { updateProfile, updateProfileWithLogo } from "@/api/auth"
import { Toast, type ToastVariant } from "@/components/ui/Toast"
import { PROFILE_ERROR_KEYS, validateProfileForm } from "@/components/register/registerValidation"
import { getDemoProfileForUser } from "@/components/login/demo"
import { getCountryOptions } from "@/components/register/registerOptions"
import { api } from "@/lib/api"

function normalizeMembershipTier(value: unknown): MembershipTier | null {
  if (typeof value !== "string") return null
  const v = value.trim().toUpperCase()
  if (!v) return null
  if (v === "GUEST") return MembershipTier.GUEST
  if (v === "NONE") return MembershipTier.GUEST
  if (v === "BRONZE") return MembershipTier.BRONZE
  if (v === "SILVER") return MembershipTier.SILVER
  if (v === "GOLD") return MembershipTier.GOLD
  if (v === "DIAMOND") return MembershipTier.DIAMOND
  return null
}

const INITIAL_PROFILE_FORM: ProfileFormData = {
  companyNameVi: "",
  companyNameCn: "",
  phone: "",
  taxId: "",
  contactName: "",
  contactPhone: "",
  address: "",
  email: "",
  country: "",
  region: "",
  industry: "",
  website: "",
  description: "",
}

function apiProfileToFormData(api: ProfileResponse, fallbackEmail?: string): ProfileFormData {
  return {
    companyNameVi: api.companyNameVi ?? "",
    companyNameCn: api.companyNameCn ?? "",
    phone: api.phone ?? "",
    taxId: api.taxId ?? "",
    contactName: api.contactName ?? "",
    contactPhone: api.contactPhone ?? "",
    address: api.address ?? "",
    email: api.email ?? fallbackEmail ?? "",
    country: api.country ?? "",
    region: api.region ?? "",
    industry: api.industry ?? "",
    website: api.website ?? "",
    description: api.description ?? "",
  }
}

type Modals = { upgrade: boolean; benefits: boolean; profile: boolean; industrySelection: boolean }
type LogoState = { url: string | null; file: File | null; uploaded: boolean; changed: boolean }
type ProfileState = { data: ProfileFormData; isSaving: boolean }
type ToastState = { message: string; variant: ToastVariant; visible: boolean }

export default function AccountPage() {
  const router = useRouter()
  const { t, i18n } = useTranslation()
  const { user, isLoggedIn, getMemberTier, setUser } = useUser()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const adOrdersSectionRef = useRef<HTMLDivElement>(null)

  const [modals, setModals] = useState<Modals>({
    upgrade: false,
    benefits: false,
    profile: false,
    industrySelection: false,
  })
  const [logo, setLogo] = useState<LogoState>({
    url: null,
    file: null,
    uploaded: false,
    changed: false,
  })
  const [profile, setProfile] = useState<ProfileState>({
    data: { ...INITIAL_PROFILE_FORM, email: user?.email ?? "" },
    isSaving: false,
  })
  const [profileTier, setProfileTier] = useState<MembershipTier | null>(null)
  const [profileFieldErrors, setProfileFieldErrors] = useState<
    Partial<Record<keyof ProfileFormData, string>>
  >({})
  const [toast, setToast] = useState<ToastState>({
    message: "",
    variant: "info",
    visible: false,
  })

  const profileData = profile.data
  const showToast = (message: string, variant: ToastVariant = "info") =>
    setToast({ message, variant, visible: true })
  const hideToast = () => setToast((t) => ({ ...t, visible: false }))
  const setProfileData = (fn: (prev: ProfileFormData) => ProfileFormData) =>
    setProfile((p) => ({ ...p, data: fn(p.data) }))

  const countries = useMemo(() => getCountryOptions(i18n.language), [i18n.language])

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

  const allRegions = useMemo(() => {
    const byValue = new Map<string, { value: string; label: string }>()
    for (const list of Object.values(regionsByCountry)) {
      if (!Array.isArray(list)) continue
      for (const r of list) {
        if (!byValue.has(r.value)) byValue.set(r.value, r)
      }
    }
    return Array.from(byValue.values())
  }, [regionsByCountry])

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login")
    }
  }, [isLoggedIn, router])

  useEffect(() => {
    if (modals.profile) {
      setLogo((l) => ({ ...l, changed: false }))
    } else {
      setLogo((l) => {
        if (l.url?.startsWith("blob:")) URL.revokeObjectURL(l.url)
        const hadBlob = l.url?.startsWith("blob:")
        return { ...l, file: null, ...(hadBlob ? { url: null } : {}) }
      })
      if (logo.changed && logo.file && !getDemoProfileForUser(user)) {
        getProfile()
          .then((apiProfile) => {
            if (apiProfile?.uploadLogo)
              setLogo((l) => ({ ...l, url: apiProfile.uploadLogo!, uploaded: true }))
          })
          .catch(() => {})
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modals.profile])

  const applyApiProfile = (apiProfile: ProfileResponse, currentEmail?: string) => {
    setProfile((p) => ({
      ...p,
      data: apiProfileToFormData(apiProfile, currentEmail ?? p.data.email),
    }))
    setProfileTier(
      normalizeMembershipTier((apiProfile as { membershipTier?: unknown }).membershipTier)
    )
    if (apiProfile.uploadLogo) {
      setLogo((l) => {
        if (l.url?.startsWith("blob:")) URL.revokeObjectURL(l.url)
        return { ...l, url: apiProfile.uploadLogo!, file: null, uploaded: true }
      })
    }
  }

  useEffect(() => {
    if (!isLoggedIn) return
    const demoProfile = getDemoProfileForUser(user)
    if (demoProfile) {
      setProfile((p) => ({ ...p, data: demoProfile }))
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const apiProfile = await getProfile()
        if (!apiProfile || cancelled) return
        applyApiProfile(apiProfile)
      } catch (err) {
        console.error(err)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isLoggedIn, user])

  useEffect(() => {
    if (!modals.profile || !isLoggedIn) return
    const demoProfile = getDemoProfileForUser(user)
    if (demoProfile) {
      applyApiProfile({ ...demoProfile, uploadLogo: undefined } as ProfileResponse, user?.email)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const apiProfile = await getProfile()
        if (!apiProfile || cancelled) return
        applyApiProfile(apiProfile, user?.email)
      } catch (err) {
        console.error(err)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [modals.profile, isLoggedIn, user])

  const handleProfileChange = (field: string, value: string) => {
    setProfileData((prev) => {
      if (field === "country") {
        const nextCountry = value === COUNTRY_NONE ? "" : value
        return { ...prev, country: nextCountry, region: "" }
      }
      return { ...prev, [field]: value }
    })
    if (profileFieldErrors[field as keyof ProfileFormData]) {
      setProfileFieldErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSaveProfile = async () => {
    const validation = validateProfileForm(profileData)
    if (!validation.valid) {
      const next: Partial<Record<keyof ProfileFormData, string>> = {}
      validation.errors.forEach(({ field, kind }) => {
        next[field] = t(PROFILE_ERROR_KEYS[kind])
      })
      setProfileFieldErrors(next)
      setTimeout(
        () =>
          document.querySelector("[data-profile-field-error]")?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          }),
        100
      )
      return
    }
    setProfileFieldErrors({})
    try {
      setProfile((p) => ({ ...p, isSaving: true }))
      if (getDemoProfileForUser(user)) {
        setProfile((p) => ({ ...p, data: profileData, isSaving: false }))
        setLogo((l) => ({ ...l, changed: false }))
        showToast(
          t("account.demoProfileUpdated") || "Demo account: profile updated locally (not saved).",
          "info"
        )
        setModals((m) => ({ ...m, profile: false }))
        return
      }
      const profilePayload = {
        company_name_vi: profileData.companyNameVi,
        company_name_cn: profileData.companyNameCn,
        phone: profileData.phone,
        tax_id: profileData.taxId,
        contact_person: profileData.contactName,
        contact_phone: profileData.contactPhone,
        company_address: profileData.address,
        email: profileData.email,
        country: profileData.country,
        region: profileData.region,
        industry: profileData.industry,
        website: profileData.website,
        introduction: profileData.description,
      }
      const updateRes =
        logo.changed && logo.file
          ? await updateProfileWithLogo(profilePayload, logo.file)
          : await updateProfile(profilePayload)
      const { profile: profileFromUpdate, logoUrl: logoUrlFromUpdate } =
        getProfileAndLogoFromUpdateData(updateRes?.data)
      if (profileFromUpdate) {
        applyApiProfile(profileFromUpdate, profileData.email)
      } else {
        const apiProfile = await getProfile()
        if (apiProfile) applyApiProfile(apiProfile, profileData.email)
      }
      if (logoUrlFromUpdate) {
        setLogo((l) => {
          if (l.url?.startsWith("blob:")) URL.revokeObjectURL(l.url)
          return { ...l, url: logoUrlFromUpdate, file: null, uploaded: true, changed: false }
        })
      } else {
        setLogo((l) => ({ ...l, changed: false }))
      }
      setModals((m) => ({ ...m, profile: false }))
      showToast(t("account.profileUpdated") || "會員資料已更新！", "success")
    } catch (err) {
      const msg =
        (err as { message?: string })?.message ||
        t("account.profileUpdateError") ||
        "會員資料更新失敗，請稍後再試"
      showToast(msg, "error")
    } finally {
      setProfile((p) => ({ ...p, isSaving: false }))
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogo((prev) => {
        if (prev.url?.startsWith("blob:")) URL.revokeObjectURL(prev.url)
        queueMicrotask(() => {
          showToast(t("account.logoUpdated") || "Logo 更新成功！", "success")
        })
        return {
          ...prev,
          url: URL.createObjectURL(file),
          file,
          uploaded: true,
          changed: true,
        }
      })
    }
    e.target.value = ""
  }

  const scrollToAdOrdersSection = () => {
    adOrdersSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const handleSaveIndustrySelection = async (selected: string[]) => {
    try {
      const response = await api.request<{
        message: string
        user: {
          id: string
          email: string
          membershipTier: string
          primaryIndustry: string | null
          selectedIndustries: string[]
          industriesSelected: boolean
        }
      }>("/auth/profile/industries", {
        method: "PATCH",
        body: { selectedIndustries: selected },
      })

      // Update user context with new selectedIndustries from response
      if (user && response.user) {
        setUser({
          ...user,
          selectedIndustries: response.user.selectedIndustries,
        })
      }

      showToast(t("account.industrySelectionSaved") || "產業選擇已儲存！", "success")
    } catch (error) {
      console.error("Failed to save industry selection:", error)
      const errorMessage = error instanceof Error ? error.message : "儲存失敗，請稍後再試"
      showToast(errorMessage, "error")
      throw error
    }
  }

  if (!isLoggedIn || !user) {
    return null
  }

  const memberTier =
    user.role === UserRole.Admin ? MembershipTier.DIAMOND : (profileTier ?? getMemberTier())
  const tierConfig = MEMBERSHIP_CONFIG[memberTier]

  return (
    <main className="bg-body-bg-dark min-h-screen">
      <Header />

      <div className="pt-14">
        <section className="from-primary/5 via-background to-primary/5 bg-body-bg-dark py-8 sm:py-12">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <AccountHeroCard
              user={user}
              memberTier={memberTier}
              tierConfig={tierConfig}
              companyLogo={logo.url}
              logoUploaded={logo.uploaded}
              t={t}
              onViewBenefits={() => setModals((m) => ({ ...m, benefits: true }))}
              onEditProfile={() => setModals((m) => ({ ...m, profile: true }))}
            />
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-2">
            {user.role !== UserRole.Admin && (
              <AccountUpgradeCard
                onHowToUpgrade={() => setModals((m) => ({ ...m, upgrade: true }))}
              />
            )}

            {memberTier === MembershipTier.GOLD &&
              user.role !== UserRole.Admin &&
              (() => {
                const hasSelectedIndustries = (user.selectedIndustries || []).length === 3

                return (
                  <div className="bg-card border-border rounded-lg border p-6">
                    <h3 className="text-foreground mb-2 text-lg font-semibold">
                      {hasSelectedIndustries
                        ? t("account.industrySelection.selectedTitle", {
                            defaultValue: "已選擇的產業",
                          })
                        : t("account.industrySelection.cardTitle", {
                            defaultValue: "產業選擇設定",
                          })}
                    </h3>
                    {hasSelectedIndustries ? (
                      <div className="space-y-2">
                        <p className="text-muted-foreground mb-3 text-sm">
                          {t("account.industrySelection.selectedDescription", {
                            defaultValue: "您已選擇以下3個產業",
                          })}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {user.selectedIndustries.map((industry) => (
                            <span
                              key={industry}
                              className="bg-primary/10 text-primary border-primary inline-flex items-center rounded-md border px-3 py-1 text-sm"
                            >
                              {t(`directory.categories.${industry}`, { defaultValue: industry })}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-muted-foreground mb-4 text-sm">
                          {t("account.industrySelection.cardDescription", {
                            defaultValue: "金牌會員可選擇3個產業",
                          })}
                        </p>
                        <button
                          onClick={() => setModals((m) => ({ ...m, industrySelection: true }))}
                          className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                        >
                          {t("account.industrySelection.manageButton", {
                            defaultValue: "管理產業選擇 →",
                          })}
                        </button>
                      </>
                    )}
                  </div>
                )
              })()}

            {user.role !== UserRole.Admin && <AccountPointsHistory />}

            {user.role !== UserRole.Admin && (
              <AccountCommercialHistory t={t} onViewAll={scrollToAdOrdersSection} />
            )}

            {user.role !== UserRole.Admin && (
              <div ref={adOrdersSectionRef} className="h-fit lg:col-span-2">
                <AccountAdOrdersSection />
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />

      <AccountUpgradeModal
        open={modals.upgrade}
        onClose={() => setModals((m) => ({ ...m, upgrade: false }))}
        t={t}
      />

      <AccountProfileModal
        open={modals.profile}
        onClose={() => setModals((m) => ({ ...m, profile: false }))}
        profileData={profileData}
        onProfileChange={handleProfileChange}
        fieldErrors={profileFieldErrors}
        companyLogo={logo.url}
        onLogoUpload={handleLogoUpload}
        fileInputRef={fileInputRef}
        logoUploaded={logo.uploaded}
        onSave={handleSaveProfile}
        isSaving={profile.isSaving}
        countries={countries}
        allRegions={allRegions}
        readOnly={user.role !== UserRole.Admin}
        t={t}
      />

      <AccountBenefitsModal
        open={modals.benefits}
        onClose={() => setModals((m) => ({ ...m, benefits: false }))}
        memberTier={memberTier}
        t={t}
      />

      <AccountIndustrySelectionModal
        open={modals.industrySelection}
        onClose={() => setModals((m) => ({ ...m, industrySelection: false }))}
        primaryIndustry={user.primaryIndustry}
        selectedIndustries={user.selectedIndustries || []}
        onSave={handleSaveIndustrySelection}
        t={t}
      />

      <Toast
        message={toast.message}
        variant={toast.variant}
        visible={toast.visible}
        onClose={hideToast}
        duration={4500}
      />
    </main>
  )
}
