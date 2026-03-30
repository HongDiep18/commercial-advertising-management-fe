"use client"

import { useCreateCompanyPopupAddon } from "@/api/active-ads/hooks"
import { translateAdPackageType } from "@/components/admin/advertising/AdPackageLabel"
import Button from "@/components/ui/Button"
import type { CompanyActiveAdItem } from "@/api/active-ads/adminService"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { CompanyActiveAdEditRow } from "./CompanyActiveAdEditRow"

const POPUP_ADDON_TYPES = ["POPUP_VIEW_DETAILS_LINK", "POPUP_RANKING_ADJUSTMENT"] as const

type PopupAddonPackageType = (typeof POPUP_ADDON_TYPES)[number]

type Props = {
  companyId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CREATE_ROW_AD_PLACEHOLDER: CompanyActiveAdItem = {
  id: "new-active-ad",
  packageType: "POPUP_VIEW_DETAILS_LINK",
  pricingModel: "ONE_TIME",
  assets: [],
  adLinkUrl: null,
  startDate: new Date().toISOString(),
  endDate: null,
  isActive: true,
  status: "pending",
}

export function CompanyActiveAdCreateForm({ companyId, open, onOpenChange }: Props) {
  const { t, i18n } = useTranslation()
  const { mutateAsync: createAddon, isPending } = useCreateCompanyPopupAddon(companyId)
  const [packageType, setPackageType] = useState<PopupAddonPackageType>("POPUP_VIEW_DETAILS_LINK")

  const adLinkRequired = packageType === "POPUP_VIEW_DETAILS_LINK"

  const initialStartDateIso = useMemo(() => new Date().toISOString(), [open])

  const rowAd: CompanyActiveAdItem = useMemo(
    () => ({
      ...CREATE_ROW_AD_PLACEHOLDER,
      packageType,
      startDate: initialStartDateIso,
    }),
    [initialStartDateIso, packageType]
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
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  if (!open) {
    return (
      <div className="mb-3 flex justify-end">
        <Button type="button" size="sm" variant="primary" onClick={() => onOpenChange(true)}>
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
