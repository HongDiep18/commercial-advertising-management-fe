import { api } from "@/lib/api"
import type { PopupCompaniesResponse } from "./types"

export async function getPopupRotationalCompanies(): Promise<PopupCompaniesResponse> {
  const res = await api.request<PopupCompaniesResponse>("/active-ads/popup-rotational", {
    method: "GET",
  })
  return res
}

export async function getPopupPriorityCompanies(): Promise<PopupCompaniesResponse> {
  const res = await api.request<PopupCompaniesResponse>("/active-ads/popup-priority", {
    method: "GET",
  })
  return res
}

