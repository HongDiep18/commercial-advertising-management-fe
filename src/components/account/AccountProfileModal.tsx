"use client"

import { ensureAdminCompanyFormContacts, type AdminCompanyForm } from "@/api/admin-companies/mapper"
import type { AdminCompanyContact } from "@/api/admin-companies/types"
import type { CompanyDetail } from "@/api/companies/types"
import { AdminCompanyEditDialog } from "@/components/admin/company/AdminCompanyEditDialog"
import type { ProfileFormData } from "@/types/account"
import type { TFunction } from "i18next"
import { formatDate } from "@/utils/datetime"
import { useMemo, type RefObject } from "react"
import { COUNTRY_NONE } from "./accountConstants"

type CountryOption = { value: string; label: string }
type RegionOption = { value: string; label: string }
type AccountSummary = {
  userName?: string
  registeredEmail?: string
  memberSince?: string
  memberRange?: string
}

type AccountProfileModalProps = {
  open: boolean
  onClose: () => void
  profileData: ProfileFormData
  onProfileChange: (field: string, value: string | string[]) => void
  fieldErrors?: Partial<Record<keyof ProfileFormData, string>>
  companyLogo: string | null
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  fileInputRef: RefObject<HTMLInputElement | null>
  logoUploaded: boolean
  onSave: (extras: { emails: string[]; contactPhones: string[] }) => void
  isSaving: boolean
  countries: CountryOption[]
  allRegions: RegionOption[]
  readOnly?: boolean
  companyDetail?: CompanyDetail | null
  accountSummary?: AccountSummary
  locale?: string
  t: TFunction
}

export function AccountProfileModal({
  open,
  onClose,
  profileData,
  onProfileChange: _onProfileChange,
  fieldErrors = {},
  companyLogo,
  onLogoUpload,
  fileInputRef,
  logoUploaded: _logoUploaded,
  onSave,
  isSaving,
  countries,
  allRegions,
  readOnly = false,
  companyDetail,
  accountSummary,
  locale = "en-US",
  t,
}: AccountProfileModalProps) {
  void _onProfileChange
  void _logoUploaded

  const contacts = useMemo<AdminCompanyContact[]>(() => {
    const detailContacts = companyDetail?.contacts ?? companyDetail?.channelContacts
    if (Array.isArray(detailContacts) && detailContacts.length > 0) {
      return ensureAdminCompanyFormContacts(
        detailContacts.map((contact) => ({
          type: contact.type,
          value: contact.value,
          contactName: contact.contactName ?? null,
        }))
      )
    }

    const rows: AdminCompanyContact[] = []
    if (profileData.email?.trim()) {
      rows.push({ type: "email", value: profileData.email.trim(), contactName: null })
    }
    if (profileData.contactName?.trim() || profileData.contactPhone?.trim()) {
      rows.push({
        type: "contact_person",
        value: profileData.contactPhone.trim(),
        contactName: profileData.contactName.trim() || null,
      })
    }
    if (profileData.phone?.trim()) {
      rows.push({ type: "tel", value: profileData.phone.trim(), contactName: null })
    }
    if (profileData.website?.trim()) {
      rows.push({ type: "website", value: profileData.website.trim(), contactName: null })
    }
    if (profileData.address?.trim()) {
      rows.push({ type: "address", value: profileData.address.trim(), contactName: null })
    }
    return ensureAdminCompanyFormContacts(rows)
  }, [companyDetail, profileData])

  const form = useMemo<AdminCompanyForm>(
    () => ({
      logoUrl: companyLogo,
      companyNameVi: companyDetail?.companyNameVi ?? profileData.companyNameVi ?? "",
      companyNameEn: companyDetail?.companyNameEn ?? "",
      companyNameZh: companyDetail?.companyNameZh ?? profileData.companyNameCn ?? "",
      taxId: companyDetail?.taxId ?? profileData.taxId ?? "",
      country:
        (companyDetail?.country ?? profileData.country) === COUNTRY_NONE
          ? ""
          : (companyDetail?.country ?? profileData.country ?? ""),
      region: companyDetail?.region ?? profileData.region ?? "",
      industry: Array.isArray(companyDetail?.industry)
        ? companyDetail.industry.map(String)
        : (profileData.industry ?? []),
      description: companyDetail?.description ?? profileData.description ?? "",
      note: "",
      contacts,
    }),
    [companyDetail, companyLogo, contacts, profileData]
  )
  const formattedMemberSince = useMemo(
    () => formatDate(accountSummary?.memberSince ?? "", locale),
    [accountSummary?.memberSince, locale]
  )

  if (!open) return null

  return (
    <AdminCompanyEditDialog
      open={open}
      onClose={onClose}
      form={form}
      errors={{
        companyNameVi: fieldErrors.companyNameVi,
        companyNameZh: fieldErrors.companyNameCn,
        taxId: fieldErrors.taxId,
        country: fieldErrors.country,
        region: fieldErrors.region,
        industry: fieldErrors.industry,
        description: fieldErrors.description,
        contacts: form.contacts.map(() => ({})),
      }}
      accountSummary={{
        userName: accountSummary?.userName ?? "",
        registeredEmail: accountSummary?.registeredEmail ?? profileData.email ?? "",
        memberSince: formattedMemberSince,
        memberRange: accountSummary?.memberRange ?? "",
      }}
      onFieldChange={() => {}}
      onContactChange={() => {}}
      onAddContact={() => {}}
      onRemoveContact={() => {}}
      onLogoUpload={onLogoUpload}
      fileInputRef={fileInputRef}
      onSave={() => onSave({ emails: [], contactPhones: [] })}
      isSaving={isSaving}
      countries={countries}
      allRegions={allRegions}
      readOnly={readOnly || true}
      showNoteSection={false}
      allowReadOnlyIndustryPreview
      t={t}
    />
  )
}
