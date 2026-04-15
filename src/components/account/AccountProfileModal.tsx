"use client"

import { ensureAdminCompanyFormContacts, type AdminCompanyForm } from "@/api/admin-companies/mapper"
import type { AdminCompanyContact, AdminCompanyContactType } from "@/api/admin-companies/types"
import type { CompanyDetail } from "@/api/companies/types"
import { AdminCompanyEditDialog } from "@/components/admin/company/AdminCompanyEditDialog"
import type { ProfileFormData } from "@/types/account"
import type { TFunction } from "i18next"
import { formatDate } from "@/utils/datetime"
import { useCallback, useMemo, type RefObject } from "react"
import { COUNTRY_NONE } from "./accountConstants"

function contactsToProfilePatch(contacts: AdminCompanyContact[]): Partial<ProfileFormData> {
  const emailRow = contacts.find((c) => String(c.type).trim().toLowerCase() === "email")
  const telRow = contacts.find((c) => {
    const t = String(c.type).trim().toLowerCase()
    return t === "tel" || t === "hotline"
  })
  const personRow = contacts.find((c) => String(c.type).trim().toLowerCase() === "contact_person")
  const webRow = contacts.find((c) => String(c.type).trim().toLowerCase() === "website")
  const addrRow = contacts.find((c) => String(c.type).trim().toLowerCase() === "address")

  return {
    email: emailRow?.value?.trim() ?? "",
    phone: telRow?.value?.trim() ?? "",
    contactName: personRow?.contactName?.trim() ?? "",
    contactPhone: personRow?.value?.trim() ?? "",
    website: webRow?.value?.trim() ?? "",
    address: addrRow?.value?.trim() ?? "",
  }
}

type CountryOption = { value: string; label: string }
type RegionOption = { value: string; label: string }
type AccountSummary = {
  userName?: string
  registeredEmail?: string
  memberSince?: string
  memberRange?: string
}

const PROFILE_FIELD_MAP: Partial<Record<keyof AdminCompanyForm, keyof ProfileFormData>> = {
  companyNameVi: "companyNameVi",
  companyNameZh: "companyNameCn",
  taxId: "taxId",
  country: "country",
  region: "region",
  industry: "industry",
  description: "description",
}

function normalizeCountry(value: string | null | undefined): string {
  const next = String(value ?? "").trim()
  return next === COUNTRY_NONE ? "" : next
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
  onProfileChange,
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
  void _logoUploaded

  const contacts = useMemo<AdminCompanyContact[]>(() => {
    const detailContacts = companyDetail?.contacts ?? companyDetail?.channelContacts
    if (readOnly && Array.isArray(detailContacts) && detailContacts.length > 0) {
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
  }, [readOnly, companyDetail, profileData])

  const form = useMemo<AdminCompanyForm>(() => {
    const readValue = <T,>(detailValue: T | null | undefined, profileValue: T): T =>
      readOnly ? (detailValue ?? profileValue) : profileValue

    return {
      logoUrl: companyLogo,
      companyNameVi: readValue(companyDetail?.companyNameVi, profileData.companyNameVi ?? ""),
      companyNameEn: companyDetail?.companyNameEn ?? "",
      companyNameZh: readValue(companyDetail?.companyNameZh, profileData.companyNameCn ?? ""),
      taxId: readValue(companyDetail?.taxId, profileData.taxId ?? ""),
      country: normalizeCountry(readValue(companyDetail?.country, profileData.country ?? "")),
      region: readValue(companyDetail?.region, profileData.region ?? ""),
      industry:
        readOnly && Array.isArray(companyDetail?.industry)
          ? companyDetail.industry.map(String)
          : (profileData.industry ?? []),
      description: readValue(companyDetail?.description, profileData.description ?? ""),
      note: "",
      contacts,
    }
  }, [readOnly, companyDetail, companyLogo, contacts, profileData])

  const handleFieldChange = useCallback(
    (field: keyof AdminCompanyForm, value: string | string[]) => {
      if (readOnly) return
      const profileField = PROFILE_FIELD_MAP[field]
      if (!profileField) return
      onProfileChange(profileField, value)
    },
    [onProfileChange, readOnly]
  )

  const applyContactsToProfile = useCallback(
    (nextContacts: AdminCompanyContact[]) => {
      const patch = contactsToProfilePatch(nextContacts)
      ;(Object.entries(patch) as [keyof ProfileFormData, string][]).forEach(([k, v]) => {
        onProfileChange(k, v)
      })
    },
    [onProfileChange]
  )

  const handleContactChange = useCallback(
    (index: number, field: keyof AdminCompanyContact, value: string) => {
      if (readOnly) return
      const next = contacts.map((c, i) => (i === index ? { ...c, [field]: value } : { ...c }))
      applyContactsToProfile(next)
    },
    [applyContactsToProfile, contacts, readOnly]
  )

  const handleAddContact = useCallback(
    (type?: AdminCompanyContactType) => {
      if (readOnly) return
      const next = [
        ...contacts,
        { type: type ?? "email", value: "", contactName: null as string | null },
      ]
      applyContactsToProfile(next)
    },
    [applyContactsToProfile, contacts, readOnly]
  )

  const handleRemoveContact = useCallback(
    (index: number) => {
      if (readOnly) return
      const next = contacts.filter((_, i) => i !== index)
      applyContactsToProfile(next)
    },
    [applyContactsToProfile, contacts, readOnly]
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
      onFieldChange={handleFieldChange}
      onContactChange={handleContactChange}
      onAddContact={handleAddContact}
      onRemoveContact={handleRemoveContact}
      onLogoUpload={onLogoUpload}
      fileInputRef={fileInputRef}
      onSave={() => onSave({ emails: [], contactPhones: [] })}
      isSaving={isSaving}
      countries={countries}
      allRegions={allRegions}
      readOnly={readOnly}
      showNoteSection={false}
      allowReadOnlyIndustryPreview
      t={t}
    />
  )
}
