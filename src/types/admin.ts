export enum AdType {
  Popup = "popup",
  Directory = "directory",
  Product = "product",
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
