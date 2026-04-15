import type { AdminCompanyListItem } from "@/api/admin-companies/types"
import { industryFromUnknown } from "@/api/companies/adminCompany.mapper"
import type { ProfileRequestRow } from "@/types/admin"

function cleanString(v: unknown): string {
  return typeof v === "string" ? v.trim() : ""
}

function emptyRow(): ProfileRequestRow {
  return {
    id: "",
    companyName: "",
    email: "",

    registeredEmail: "",
    companyEmail: "",
    contactName: "",
    status: "",
    submittedAt: "",
    industry: "",
    country: "",
  }
}

export function mapAdminCompanyListItemToProfileRequestRow(item: unknown): ProfileRequestRow {
  if (!item || typeof item !== "object") {
    return emptyRow()
  }
  const r = item as AdminCompanyListItem & Record<string, unknown>
  const companyId = cleanString(r.id)
  if (!companyId) {
    return emptyRow()
  }

  const companyNameVi = cleanString(r.companyNameVi)
  const companyNameEn = cleanString(r.companyNameEn)
  const companyNameZh = cleanString(r.companyNameZh)
  const companyName = companyNameVi || companyNameEn || companyNameZh || ""

  const primaryEmail = cleanString(r.primaryEmail)
  const primaryPhone = cleanString(r.primaryPhone)
  const status = cleanString(r.status)
  const submittedAt = cleanString(r.createdAt) || cleanString(r.updatedAt)
  const industry = industryFromUnknown(r.industry).join(", ")
  const isActive = r.isActive === true

  return {
    id: companyId,
    companyId,
    companyName,
    email: primaryEmail,

    registeredEmail: primaryEmail,
    companyEmail: primaryEmail,

    contactName: "",
    phone: primaryPhone || undefined,
    status,
    submittedAt,
    industry,
    country: "",
    isActive,
  }
}
