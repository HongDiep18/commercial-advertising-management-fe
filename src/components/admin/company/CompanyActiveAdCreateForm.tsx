"use client"

import type { CompanyActiveAdItem } from "@/api/active-ads/adminService"
import { useCreateCompanyPopupAddon } from "@/api/active-ads/hooks"
import { translateAdPackageType } from "@/components/admin/advertising/AdPackageLabel"
import Button from "@/components/ui/Button"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { CompanyActiveAdEditRow } from "./CompanyActiveAdEditRow"

const POPUP_ADDON_TYPES = ["POPUP_VIEW_DETAILS_LINK", "POPUP_RANKING_ADJUSTMENT"] as const

type PopupAddonPackageType = (typeof POPUP_ADDON_TYPES)[number]

function getStartOfDayIsoString(date: Date): string {
  const value = new Date(date)
  value.setHours(0, 0, 0, 0)
  return value.toISOString()
}

function createActiveAdPlaceholder(): CompanyActiveAdItem {
  return {
    id: "new-active-ad",
    packageType: "POPUP_VIEW_DETAILS_LINK",
    pricingModel: "ONE_TIME",
    assets: [],
    adLinkUrl: null,
    startDate: getStartOfDayIsoString(new Date()),
    endDate: null,
    isActive: true,
    status: "pending",
  }
}

type Props = {
  companyId: string
}

export function CompanyActiveAdCreateForm({ companyId }: Props) {
  const { t, i18n } = useTranslation()
  const { mutateAsync: createAddon, isPending } = useCreateCompanyPopupAddon(companyId)
  const [packageType, setPackageType] = useState<PopupAddonPackageType>("POPUP_VIEW_DETAILS_LINK")
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const adLinkRequired = packageType === "POPUP_VIEW_DETAILS_LINK"

  const rowAd: CompanyActiveAdItem = useMemo(
    () => {
      void isCreateOpen
      return {
        ...createActiveAdPlaceholder(),
        packageType,
      }
    },
    [packageType, isCreateOpen]
  )

  const handleSubmit = async (values: {
    startDate: Date | undefined
    endDate: Date | undefined
    adLinkUrl: string
  }): Promise<void> => {
    await createAddon({
      packageType,
      startDate: values.startDate!.toISOString(),
      endDate: values.endDate ? values.endDate.toISOString() : null,
      ...(adLinkRequired ? { adLinkUrl: values.adLinkUrl.trim() } : {}),
    })
    setIsCreateOpen(false)
  }

  const handleCancel = () => {
    setIsCreateOpen(false)
  }

  if (!isCreateOpen) {
    return (
      <div className="mb-3 flex justify-end">
        <Button type="button" size="sm" variant="primary" onClick={() => setIsCreateOpen(true)}>
          {t("admin.activeAds.createShowButton", "+ Create")}
        </Button>
      </div>
    )
  }

  return (
    <div className="mb-3 space-y-2">
      <div className="border-border bg-body-bg-dark-foreground rounded-lg border p-3">
        <div className="space-y-1.5">
          <p className="text-foreground text-sm font-medium">
            {t("admin.activeAds.createSectionTitle")}
          </p>
          <select
            value={packageType}
            onChange={(e) => setPackageType(e.target.value as PopupAddonPackageType)}
            className="border-input bg-background text-foreground focus:ring-primary h-9 w-full rounded-md border px-2 text-xs focus:ring-1 focus:outline-none"
          >
            {POPUP_ADDON_TYPES.map((type) => (
              <option key={type} value={type}>
                {translateAdPackageType(t, type)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <CompanyActiveAdEditRow
        ad={rowAd}
        lang={i18n.language}
        showActiveToggle={false}
        showAssets={false}
        disableDateEditing={false}
        showDateRangeValidation
        showAdLinkField={adLinkRequired}
        showAdLinkValidation={adLinkRequired}
        saveLabel={t("admin.activeAds.createSubmit")}
        saving={isPending}
        deleting={false}
        onCancel={handleCancel}
        onSave={handleSubmit}
      />
    </div>
  )
}
