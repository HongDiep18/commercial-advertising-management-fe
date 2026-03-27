import type { CompanyActiveAdItem } from "@/api/active-ads/adminService"

export type AssetEntry =
  | { kind: "existing"; fileUrl: string; assetType: string }
  | { kind: "new"; file: File; assetType: string; previewUrl: string }

export type CompanyActiveAdRowProps = {
  ad: CompanyActiveAdItem
  companyId: string
  locale: string
  lang: string
}
