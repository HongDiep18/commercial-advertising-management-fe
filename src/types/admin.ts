import { MembershipTier } from "./membership"

export enum AdType {
  Popup = "popup",
  Directory = "directory",
  Product = "product",
}

export enum ProfileRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

// export type ProfileRequestStatusUpdate = Exclude<
//   ProfileRequestStatus.APPROVED,
//   ProfileRequestStatus.REJECTED
// >

export type ProfileRequestStatusUpdate =
  | ProfileRequestStatus.APPROVED
  | ProfileRequestStatus.REJECTED

export type ProfileRequestFilterId = "all" | ProfileRequestStatus

export type ProfileRequestStatusCounts = { all: number } & Record<ProfileRequestStatus, number>

const isProfileRequestStatus = (v: string): v is ProfileRequestStatus =>
  v === ProfileRequestStatus.PENDING ||
  v === ProfileRequestStatus.APPROVED ||
  v === ProfileRequestStatus.REJECTED

export function getProfileRequestFilterState<T extends { status: string }>(
  requests: T[],
  filter: ProfileRequestFilterId
): { statusCounts: ProfileRequestStatusCounts; filtered: T[] } {
  const statusCounts: ProfileRequestStatusCounts = {
    all: requests.length,
    [ProfileRequestStatus.PENDING]: 0,
    [ProfileRequestStatus.APPROVED]: 0,
    [ProfileRequestStatus.REJECTED]: 0,
  }
  const filtered: T[] = []
  for (const r of requests) {
    if (isProfileRequestStatus(r.status)) statusCounts[r.status]++
    if (filter === "all" || r.status === filter) filtered.push(r)
  }
  return { statusCounts, filtered }
}

export type ProfileRequestRow = {
  id: string
  companyName: string
  email: string
  contactPerson: string
  status: ProfileRequestStatus | string
  submittedAt: string
  industry: string
  country: string
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
  membershipTier: MembershipTier
  status: ProfileRequestStatus
}
