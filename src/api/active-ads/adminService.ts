import { AdPackageFormConfig } from "@/api/ads-pricing/types"
import { api } from "@/lib/api"

export enum AdPackageType {
  POPUP_PRIORITY_SLOT = "POPUP_PRIORITY_SLOT",
  POPUP_ROTATION_SLOT = "POPUP_ROTATION_SLOT",
  POPUP_VIEW_DETAILS_LINK = "POPUP_VIEW_DETAILS_LINK",
  POPUP_PRIORITY_DETAILS_LINK = "POPUP_PRIORITY_DETAILS_LINK",
  POPUP_ROTATION_DETAILS_LINK = "POPUP_ROTATION_DETAILS_LINK",
  POPUP_RANKING_ADJUSTMENT = "POPUP_RANKING_ADJUSTMENT",
}

export type CompanyActiveAdItem = {
  id: string
  packageType: string
  pricingModel: string
  assets: Array<{
    fileUrl: string
    assetType: string
  }>
  adLinkUrl: string | null
  startDate: string
  endDate: string | null
  isActive: boolean
  status: "expired" | "activating" | "pending" | "disabled"
  formConfig: AdPackageFormConfig
}

export type CompanyActiveAdsResponse = {
  company_id: string
  items: CompanyActiveAdItem[]
}

export async function getCompanyActiveAds(companyId: string): Promise<CompanyActiveAdsResponse> {
  return api.request<CompanyActiveAdsResponse>(
    `/admin/active-ads/company/${encodeURIComponent(companyId)}`,
    { method: "GET" }
  )
}

export type SaveActiveAdPayload = {
  isActive?: boolean
  startDate?: string
  endDate?: string | null
  adLinkUrl?: string | null
  assets: Array<{ fileUrl: string; assetType: string }>
}

export async function saveActiveAd(
  activeAdId: string,
  { assets, ...fields }: SaveActiveAdPayload
): Promise<void> {
  await api.request(`/admin/active-ads/${encodeURIComponent(activeAdId)}`, {
    method: "PATCH",
    body: fields,
  })
  await api.request(`/admin/active-ads/${encodeURIComponent(activeAdId)}/assets`, {
    method: "PUT",
    body: { assets },
  })
}

export async function deleteActiveAd(activeAdId: string): Promise<void> {
  await api.request(`/admin/active-ads/${encodeURIComponent(activeAdId)}`, {
    method: "DELETE",
  })
}

export type CreateCompanyPopupAddonPayload = {
  companyId: string
  packageType: AdPackageType
  startDate: string
  endDate: string | null
  adLinkUrl?: string
}

export async function createCompanyPopupAddon(
  payload: CreateCompanyPopupAddonPayload
): Promise<void> {
  await api.request(`/admin/active-ads/company/popup-addon`, {
    method: "POST",
    body: payload,
  })
}
