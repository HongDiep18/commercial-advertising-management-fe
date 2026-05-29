import {
  industryFromUnknown,
  pickLogoUrlFromApiResponse,
} from "@/api/companies/adminCompany.mapper"
import {
  INITIAL_REGISTER_FORM,
  type RegisterFormData,
} from "@/components/register/registerConstants"
import { normalizeWebsiteHttpScheme } from "@/types/auth"
import type {
  AdminCompanyContact,
  AdminCompanyDetail,
  AdminCompanyUpdatePayload,
  AdminUnlinkedCompanyItem,
} from "./types"

export type AdminCompanyForm = {
  logoUrl: string | null
  companyNameVi: string
  companyNameEn: string
  companyNameZh: string
  taxId: string
  country: string
  region: string
  industry: string[]
  description: string
  note: string
  contacts: AdminCompanyContact[]
}

export type AdminCompanyNameVariants = {
  companyNameZh: string
  companyNameEn: string
  companyNameVi: string
}

export type AdminCompanyPrimaryContact = {
  value: string
  contactName: string
}

const CONTACT_PLACEHOLDER_GROUPS: Array<{
  types: Set<string>
  defaultType: AdminCompanyContact["type"]
}> = [
  { types: new Set(["contact_person"]), defaultType: "contact_person" },
  { types: new Set(["email", "register_email"]), defaultType: "email" },
  { types: new Set(["website"]), defaultType: "website" },
  { types: new Set(["tel", "hotline", "fax"]), defaultType: "tel" },
  { types: new Set(["zalo", "wechat", "line", "skype", "facebook", "viber"]), defaultType: "zalo" },
  { types: new Set(["address"]), defaultType: "address" },
]

function createEmptyContact(type: AdminCompanyContact["type"] = "email"): AdminCompanyContact {
  return {
    type,
    value: "",
    contactName: null,
  }
}

export function ensureAdminCompanyFormContacts(
  contacts: AdminCompanyContact[]
): AdminCompanyContact[] {
  const next = [...contacts]

  for (const group of CONTACT_PLACEHOLDER_GROUPS) {
    const hasGroupContact = next.some((contact) => group.types.has(clean(String(contact.type))))
    if (!hasGroupContact) next.push(createEmptyContact(group.defaultType))
  }

  return next
}

export const EMPTY_ADMIN_COMPANY_FORM: AdminCompanyForm = {
  logoUrl: null,
  companyNameVi: "",
  companyNameEn: "",
  companyNameZh: "",
  taxId: "",
  country: "",
  region: "",
  industry: [],
  description: "",
  note: "",
  contacts: ensureAdminCompanyFormContacts([]),
}

function clean(value: string | null | undefined): string {
  return typeof value === "string" ? value.trim() : ""
}

export const ADMIN_COMPANY_CONTACT_TYPES_AS_FORM_FIELDS = new Set(["note", "register_email"])

function contactTypeKey(type: unknown): string {
  return clean(String(type ?? "")).toLowerCase()
}

export function excludeCompanyLevelContactRows<T extends { type?: string | null }>(rows: T[]): T[] {
  return rows.filter(
    (row) => !ADMIN_COMPANY_CONTACT_TYPES_AS_FORM_FIELDS.has(contactTypeKey(row.type))
  )
}

export function isCompanyLevelContactType(type: unknown): boolean {
  return ADMIN_COMPANY_CONTACT_TYPES_AS_FORM_FIELDS.has(contactTypeKey(type))
}

function normalizeContact(contact: AdminCompanyContact): AdminCompanyContact | null {
  const type = clean(String(contact.type ?? ""))
  const value = clean(contact.value)
  const contactName = clean(contact.contactName ?? "")
  if (!type && !value && !contactName) return null
  if (!type || !value) return { type, value, contactName: contactName || null }
  return {
    type,
    value,
    contactName: contactName || null,
  }
}

function dedupeContacts(contacts: AdminCompanyContact[]): AdminCompanyContact[] {
  const seen = new Set<string>()
  const result: AdminCompanyContact[] = []

  for (const rawContact of contacts) {
    const contact = normalizeContact(rawContact)
    if (!contact) continue

    const type = clean(String(contact.type))
    const value = clean(contact.value)
    if (!type || !value) continue

    const key = `${type.toLowerCase()}|${value.toLowerCase()}`
    if (seen.has(key)) continue
    seen.add(key)
    result.push(contact)
  }

  return result
}

export function normalizeAdminCompanyContacts(value: unknown): AdminCompanyContact[] {
  if (!Array.isArray(value)) return []

  return dedupeContacts(
    value
      .map((item) => {
        const record = item as Record<string, unknown>
        return {
          type: clean(String(record?.type ?? "")),
          value: clean(String(record?.value ?? "")),
          contactName: clean(String(record?.contactName ?? "")) || null,
        }
      })
      .filter((contact) => clean(String(contact.type)) || clean(contact.value))
  )
}

export function getAdminCompanyNameVariants(
  detail: Partial<AdminCompanyDetail>
): AdminCompanyNameVariants {
  return {
    companyNameZh: clean(detail.companyNameZh),
    companyNameEn: clean(detail.companyNameEn),
    companyNameVi: clean(detail.companyNameVi),
  }
}

export function getPreferredAdminCompanyName(
  detail: Partial<AdminCompanyDetail>,
  fallback?: string
): string {
  const { companyNameZh, companyNameEn, companyNameVi } = getAdminCompanyNameVariants(detail)
  return companyNameZh || companyNameEn || companyNameVi || clean(fallback)
}

export function getPrimaryAdminCompanyContact(
  contacts: AdminCompanyContact[]
): AdminCompanyPrimaryContact {
  const normalized = normalizeAdminCompanyContacts(contacts)
  const preferredTypeOrder = ["contact_person", "tel", "hotline", "fax"] as const
  const preferred = preferredTypeOrder
    .map((type) => normalized.find((contact) => contactTypeKey(contact.type) === type))
    .find(Boolean)

  return {
    value: clean(preferred?.value),
    contactName: clean(preferred?.contactName ?? ""),
  }
}

function contactValueByType(contacts: AdminCompanyContact[], type: string): string {
  const row = contacts.find((c) => contactTypeKey(c.type) === type)
  return clean(row?.value)
}

export function unlinkedCompanyToAdminCompanyDetail(
  item: AdminUnlinkedCompanyItem
): AdminCompanyDetail {
  return {
    id: item.id,
    logoUrl: item.logoUrl ?? null,
    companyNameVi: item.companyNameVi,
    companyNameEn: item.companyNameEn,
    companyNameZh: item.companyNameZh,
    taxId: item.taxId,
    country: item.country,
    region: item.region,
    industry: item.industry,
    description: item.description,
    contacts: (item.contacts ?? []).map((c) => ({
      type: c.type,
      value: c.value,
      contactName: c.contactName ?? null,
    })),
  }
}

export function adminCompanyDetailToRegisterFormData(detail: AdminCompanyDetail): RegisterFormData {
  const companyForm = adminCompanyDetailToForm(detail)
  const contacts = normalizeAdminCompanyContacts(detail.contacts ?? [])
  const primary = getPrimaryAdminCompanyContact(contacts)
  const phoneFromContacts =
    contactValueByType(contacts, "tel") ||
    contactValueByType(contacts, "hotline") ||
    contactValueByType(contacts, "fax") ||
    primary.value

  const companyEmail =
    detail.emails?.map((e) => clean(e)).find(Boolean) ||
    contactValueByType(contacts, "email") ||
    clean(detail.email)

  return {
    ...INITIAL_REGISTER_FORM,
    companyNameVi: companyForm.companyNameVi,
    companyNameCn: companyForm.companyNameZh,
    phone: clean(detail.phone) || phoneFromContacts,
    taxId: companyForm.taxId,
    contactPerson: clean(detail.contactName) || primary.contactName,
    contactPhone: clean(detail.contactPhone) || primary.value || phoneFromContacts,
    companyAddress: clean(detail.address) || contactValueByType(contacts, "address"),
    email: "",
    companyEmail,
    country: companyForm.country,
    industry: companyForm.industry,
    website: clean(detail.website) || contactValueByType(contacts, "website"),
    introduction: companyForm.description,
    note: companyForm.note,
  }
}

export function adminCompanyDetailToForm(detail: AdminCompanyDetail): AdminCompanyForm {
  const normalized = normalizeAdminCompanyContacts(detail.contacts)
  const noteFromContactRows =
    normalized
      .filter((c) => contactTypeKey(c.type) === "note")
      .map((c) => clean(String(c.value ?? "")))
      .find((v) => v.length > 0) ?? ""
  const listContacts = normalized.filter((c) => contactTypeKey(c.type) !== "note")

  return {
    logoUrl: pickLogoUrlFromApiResponse(detail),
    companyNameVi: clean(detail.companyNameVi),
    companyNameEn: clean(detail.companyNameEn),
    companyNameZh: clean(detail.companyNameZh),
    taxId: clean(detail.taxId),
    country: clean(detail.country),
    region: clean(detail.region),
    industry: industryFromUnknown(detail.industry),
    description: clean(detail.description),
    note: clean(detail.note) || noteFromContactRows,
    contacts: ensureAdminCompanyFormContacts(listContacts),
  }
}

export function adminCompanyFormToUpdatePayload(form: AdminCompanyForm): AdminCompanyUpdatePayload {
  const contacts = dedupeContacts(
    excludeCompanyLevelContactRows(form.contacts).map((contact) => {
      const type = clean(String(contact.type))
      const value = clean(contact.value)
      const contactName = clean(contact.contactName ?? "")

      if (type === "website" && value) {
        return {
          type,
          value: /^https?:\/\//i.test(value)
            ? normalizeWebsiteHttpScheme(value)
            : `https://${value}`,
          contactName: contactName || null,
        }
      }

      return {
        type,
        value: type === "email" ? value.toLowerCase() : value,
        contactName: contactName || null,
      }
    })
  )

  return {
    companyNameVi: clean(form.companyNameVi) || null,
    companyNameEn: clean(form.companyNameEn) || null,
    companyNameZh: clean(form.companyNameZh) || null,
    taxId: clean(form.taxId) || null,
    country: clean(form.country) || null,
    region: clean(form.region) || null,
    industry: form.industry,
    description: clean(form.description),
    note: clean(form.note),
    ...(contacts.length > 0 && { contacts }),
  }
}

export function pickAdminCompanyLogoUrl(detail: AdminCompanyDetail): string | null {
  return pickLogoUrlFromApiResponse(detail)
}

export type AdminCompanyRequestsTableRowCache = {
  companyNameVi: string
  companyNameEn: string
  companyNameZh: string
  displayCompanyName: string
  contactValue: string
  contactName: string
  industry: string | string[]
}

type ProfileRequestRowFallback = {
  companyName?: string
  companyEmail?: string
  contactName?: string
  industry?: string
}

export function adminCompanyDetailToRequestsTableCache(
  detail: AdminCompanyDetail,
  fallback: ProfileRequestRowFallback
): AdminCompanyRequestsTableRowCache {
  const names = getAdminCompanyNameVariants(detail)
  const displayCompanyName = getPreferredAdminCompanyName(detail, fallback.companyName || "")
  const primaryContact = getPrimaryAdminCompanyContact(
    normalizeAdminCompanyContacts(detail.contacts)
  )
  const industry = detail.industry ?? fallback.industry ?? ""

  return {
    companyNameVi: names.companyNameVi,
    companyNameEn: names.companyNameEn,
    companyNameZh: names.companyNameZh,
    displayCompanyName,
    contactValue: primaryContact.value || "",
    contactName: primaryContact.contactName || detail.contactName || fallback.contactName || "",
    industry,
  }
}
