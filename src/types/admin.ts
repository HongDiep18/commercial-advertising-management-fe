export enum AdType {
  Popup = "popup",
  Directory = "directory",
  Product = "product",
}

export enum ProfileRequestStatus {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
}
export enum MembershipTier {
  None = "none",
  Bronze = "bronze",
  Silver = "silver",
  Gold = "gold",
  Diamond = "diamond",
}

export enum AdStatus {
  New = "new",
  Contacted = "contacted",
  Closed = "closed",
}

export type AdSubmission = {
  id: string
  companyName: string
  contactName: string
  email: string
  phone: string
  adType: AdType
  adTypeName: string
  selectedItems: string[]
  totalAmount: string
  status: AdStatus
  submittedAt: string
  notes?: string
}

export type ProfileRequest = {
  id: string
  email: string
  companyNameVi: string
  companyNameCn: string
  phone: string
  taxId: string
  contactPerson: string
  contactPhone: string
  companyAddress: string
  country: string
  region: string
  industry: string
  website: string
  introduction: string
  membershipTier: MembershipTier | MembershipTier.None
  status: ProfileRequestStatus
}

/** Display shape for company requests in admin UI (same for API and demo data). */
export type CompanyRequest = {
  id: string
  companyName: string
  email: string
  contactPerson: string
  status: "pending" | "approved" | "rejected"
  submittedAt: string
  industry: string
  country: string
}
