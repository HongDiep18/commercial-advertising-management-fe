"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  useUser,
  UserRole,
  MembershipTier,
  MEMBERSHIP_CONFIG,
  MEMBERSHIP_THRESHOLDS,
  CONTRIBUTION_VALUES,
} from "@/contexts/user-context"
import { useTranslation } from "react-i18next"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import {
  AccountHeroCard,
  AccountUpgradeCard,
  AccountPointsHistory,
  AccountCommercialHistory,
  AccountUpgradeModal,
  AccountProfileModal,
  AccountBenefitsModal,
  COUNTRY_VALUES,
  REGION_KEYS_BY_COUNTRY,
  COUNTRY_NONE,
} from "@/components/account"
import type { ProfileFormData } from "@/types/account"
import { UpdateProfilePayload } from "@/types/auth"
import { getProfile, type ProfileResponse } from "@/api/profile"
import { updateProfile } from "@/api/auth"
import { Toast, type ToastVariant } from "@/components/ui/Toast"

const INITIAL_PROFILE_FORM: ProfileFormData = {
  companyNameVi: "",
  companyNameCn: "",
  phone: "",
  taxId: "",
  contactPerson: "",
  contactPhone: "",
  companyAddress: "",
  email: "",
  country: "",
  region: "",
  industry: "",
  website: "",
  introduction: "",
}

function apiProfileToFormData(api: ProfileResponse, fallbackEmail?: string): ProfileFormData {
  return {
    companyNameVi: api.companyNameVi ?? "",
    companyNameCn: api.companyNameCn ?? "",
    phone: api.phone ?? "",
    taxId: api.taxId ?? "",
    contactPerson: api.contactPerson ?? "",
    contactPhone: api.contactPhone ?? "",
    companyAddress: api.companyAddress ?? "",
    email: api.email ?? fallbackEmail ?? "",
    country: api.country ?? "",
    region: api.region ?? "",
    industry: api.industry ?? "",
    website: api.website ?? "",
    introduction: api.introduction ?? "",
  }
}

type Modals = { upgrade: boolean; benefits: boolean; profile: boolean }
type LogoState = { url: string | null; uploaded: boolean; changed: boolean }
type ProfileState = { data: ProfileFormData; isSaving: boolean }
type ToastState = { message: string; variant: ToastVariant; visible: boolean }

export default function AccountPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const { user, isLoggedIn, getTotalPoints, getMemberTier, getNextTier } = useUser()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [modals, setModals] = useState<Modals>({
    upgrade: false,
    benefits: false,
    profile: false,
  })
  const [logo, setLogo] = useState<LogoState>({
    url: null,
    uploaded: false,
    changed: false,
  })
  const [profile, setProfile] = useState<ProfileState>({
    data: { ...INITIAL_PROFILE_FORM, email: user?.email ?? "" },
    isSaving: false,
  })
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

  useEffect(() => {
    if (modals.profile) setLogo((l) => ({ ...l, changed: false }))
  }, [modals.profile])

  const applyApiProfile = (apiProfile: ProfileResponse, currentEmail?: string) => {
    setProfile((p) => ({
      ...p,
      data: apiProfileToFormData(apiProfile, currentEmail ?? p.data.email),
    }))
    if (apiProfile.uploadLogo) {
      setLogo((l) => ({ ...l, url: apiProfile.uploadLogo!, uploaded: true }))
    }
  }

  useEffect(() => {
    if (!isLoggedIn) return
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
  }, [isLoggedIn])

  useEffect(() => {
    if (!modals.profile || !isLoggedIn) return
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
  }, [modals.profile, isLoggedIn, user?.email])

  const handleProfileChange = (field: string, value: string) => {
    setProfileData((prev) => {
      if (field === "country") {
        const nextCountry = value === COUNTRY_NONE ? "" : value
        return { ...prev, country: nextCountry, region: "" }
      }
      return { ...prev, [field]: value }
    })
  }

  const handleSaveProfile = async () => {
    const emailTrim = profileData.email?.trim() ?? ""
    const companyNameViTrim = profileData.companyNameVi?.trim() ?? ""
    const companyNameCnTrim = profileData.companyNameCn?.trim() ?? ""
    if (!emailTrim) {
      showToast(t("account.profileRequiredFields") || "請填寫必填欄位（例如：E-Mail）。", "warning")
      return
    }
    if (!companyNameViTrim && !companyNameCnTrim) {
      showToast(
        t("account.profileRequiredCompanyName") || "請至少填寫公司名稱（越文或中文）。",
        "warning"
      )
      return
    }
    try {
      setProfile((p) => ({ ...p, isSaving: true }))
      const payload: UpdateProfilePayload = {
        company_name_vi: profileData.companyNameVi,
        company_name_cn: profileData.companyNameCn,
        phone: profileData.phone,
        tax_id: profileData.taxId,
        contact_person: profileData.contactPerson,
        contact_phone: profileData.contactPhone,
        company_address: profileData.companyAddress,
        email: profileData.email,
        country: profileData.country,
        region: profileData.region,
        industry: profileData.industry,
        website: profileData.website,
        introduction: profileData.introduction,
      }
      if (logo.changed) {
        payload.upload_logo = logo.url ?? ""
      }
      await updateProfile(payload)
      const apiProfile = await getProfile()
      if (apiProfile) {
        applyApiProfile(apiProfile, profileData.email)
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
      setLogo((l) => ({ ...l, changed: true }))
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setLogo((prev) => {
          const isFirst = !prev.uploaded
          queueMicrotask(() => {
            showToast(
              isFirst
                ? t("account.logoPoints", { count: CONTRIBUTION_VALUES.logo }) ||
                    `Logo 上傳成功！您獲得 ${CONTRIBUTION_VALUES.logo.toLocaleString()} 點貢獻值`
                : t("account.logoUpdated") || "Logo 更新成功！",
              "success"
            )
          })
          return { ...prev, url: result, uploaded: true }
        })
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
  const nextThreshold =
    nextTierInfo?.nextTier != null
      ? MEMBERSHIP_THRESHOLDS[nextTierInfo.nextTier]
      : MEMBERSHIP_THRESHOLDS[MembershipTier.Diamond]
  const progressInTier = nextTierInfo ? (totalPoints / nextThreshold) * 100 : 100

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
            {memberTier !== MembershipTier.Diamond && nextTierInfo && (
              <AccountUpgradeCard
                user={user}
                memberTier={memberTier}
                tierConfig={tierConfig}
                totalPoints={totalPoints}
                nextTierInfo={nextTierInfo}
                progressInTier={progressInTier}
                t={t}
                onHowToUpgrade={() => setModals((m) => ({ ...m, upgrade: true }))}
              />
            )}

            {user.role !== UserRole.Admin && (
              <AccountPointsHistory totalPoints={totalPoints} t={t} />
            )}

            {user.commercialPoints > 0 && <AccountCommercialHistory t={t} />}
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
        companyLogo={logo.url}
        onLogoUpload={handleLogoUpload}
        fileInputRef={fileInputRef}
        logoUploaded={logo.uploaded}
        onSave={handleSaveProfile}
        isSaving={profile.isSaving}
        countries={countries}
        availableRegions={availableRegions}
        regionValue={regionValue}
        hasCountry={hasCountry}
        t={t}
      />

      <AccountBenefitsModal
        open={modals.benefits}
        onClose={() => setModals((m) => ({ ...m, benefits: false }))}
        memberTier={memberTier}
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
