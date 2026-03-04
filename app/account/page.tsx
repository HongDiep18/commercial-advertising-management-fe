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
import { getProfile } from "@/api/profile"
import { updateProfile } from "@/api/auth"

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
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  const [profileData, setProfileData] = useState<ProfileFormData>(() => ({
    companyNameVi: "",
    companyNameCn: "",
    phone: "",
    taxId: "",
    contactPerson: "",
    contactPhone: "",
    companyAddress: "",
    email: user?.email ?? "",
    country: "",
    region: "",
    industry: "",
    website: "",
    introduction: "",
  }))

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
    if (!isLoggedIn) return
    let cancelled = false
    ;(async () => {
      try {
        const apiProfile = await getProfile()
        if (!apiProfile || cancelled) return
        setProfileData((prev) => ({
          ...prev,
          companyNameVi: apiProfile.company_name_vi ?? "",
          companyNameCn: apiProfile.company_name_cn ?? "",
          phone: apiProfile.phone ?? "",
          taxId: apiProfile.tax_id ?? "",
          contactPerson: apiProfile.contact_person ?? "",
          contactPhone: apiProfile.contact_phone ?? "",
          companyAddress: apiProfile.company_address ?? "",
          email: apiProfile.email ?? prev.email,
          country: apiProfile.country ?? "",
          region: apiProfile.region ?? "",
          industry: apiProfile.industry ?? "",
          website: apiProfile.website ?? "",
          introduction: apiProfile.introduction ?? "",
        }))
        if (apiProfile.logo) {
          setCompanyLogo(apiProfile.logo)
          setLogoUploaded(true)
        }
      } catch (err) {
        console.error(err)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isLoggedIn])

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
    try {
      setIsSavingProfile(true)
      const payload: UpdateProfilePayload = {
        logo: companyLogo ?? "",
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
      await updateProfile(payload)
      setShowProfileModal(false)
      alert(t("account.profileUpdated") || "會員資料已更新！")
    } catch (err) {
      const msg =
        (err as { message?: string })?.message ||
        t("account.profileUpdateError") ||
        "會員資料更新失敗，請稍後再試"
      alert(msg)
    } finally {
      setIsSavingProfile(false)
    }
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
              companyLogo={companyLogo}
              logoUploaded={logoUploaded}
              t={t}
              onViewBenefits={() => setShowBenefitsModal(true)}
              onEditProfile={() => setShowProfileModal(true)}
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
                onHowToUpgrade={() => setShowUpgradeModal(true)}
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
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        t={t}
      />

      <AccountProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profileData={profileData}
        onProfileChange={handleProfileChange}
        companyLogo={companyLogo}
        onLogoUpload={handleLogoUpload}
        fileInputRef={fileInputRef}
        logoUploaded={logoUploaded}
        onSave={handleSaveProfile}
        isSaving={isSavingProfile}
        countries={countries}
        availableRegions={availableRegions}
        regionValue={regionValue}
        hasCountry={hasCountry}
        t={t}
      />

      <AccountBenefitsModal
        open={showBenefitsModal}
        onClose={() => setShowBenefitsModal(false)}
        memberTier={memberTier}
        t={t}
      />
    </main>
  )
}
