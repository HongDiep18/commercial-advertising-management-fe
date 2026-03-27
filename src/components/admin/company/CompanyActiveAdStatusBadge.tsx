"use client"

import type { CompanyActiveAdItem } from "@/api/active-ads/adminService"
import Badge from "@/components/ui/Badge"
import { useTranslation } from "react-i18next"

const STATUS_STYLES: Record<CompanyActiveAdItem["status"], string> = {
  activating: "border-green-500 bg-green-50 text-green-700",
  pending: "border-orange-400 bg-orange-50 text-orange-700",
  expired: "border-red-400 bg-red-50 text-red-700",
  disabled: "border-gray-400 bg-gray-100 text-gray-600",
}

type Props = {
  status: CompanyActiveAdItem["status"]
}

export function CompanyActiveAdStatusBadge({ status }: Props) {
  const { t } = useTranslation()
  return (
    <Badge variant="outline" className={STATUS_STYLES[status]}>
      {t(`admin.activeAds.status.${status}`, status)}
    </Badge>
  )
}
