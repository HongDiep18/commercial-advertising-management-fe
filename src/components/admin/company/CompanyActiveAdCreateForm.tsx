"use client"

import { useCreateCompanyPopupAddon } from "@/api/active-ads/hooks"
import Button from "@/components/ui/Button"
import type { CompanyActiveAdItem } from "@/api/active-ads/adminService"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { CompanyActiveAdEditRow } from "./CompanyActiveAdEditRow"
import type { AssetEntry } from "./company-active-ads.types"

const POPUP_ADDON_TYPES = ["POPUP_VIEW_DETAILS_LINK", "POPUP_RANKING_ADJUSTMENT"] as const

type PopupAddonPackageType = (typeof POPUP_ADDON_TYPES)[number]

type Props = {
  companyId: string
  dialogOpen: boolean
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

export function CompanyActiveAdCreateForm({ companyId, dialogOpen, open, onOpenChange }: Props) {
  const { t, i18n } = useTranslation()
  const { mutateAsync: createAddon, isPending } = useCreateCompanyPopupAddon(companyId)
  const [packageType, setPackageType] = useState<PopupAddonPackageType>("POPUP_VIEW_DETAILS_LINK")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [isActive, setIsActive] = useState(true)
  const [adLinkUrl, setAdLinkUrl] = useState("")
  const [assets, setAssets] = useState<AssetEntry[]>([])
  const [startCalOpen, setStartCalOpen] = useState(false)
  const [endCalOpen, setEndCalOpen] = useState(false)
  const [isDateRangeValid, setIsDateRangeValid] = useState(true)
  const [isAdLinkValid, setIsAdLinkValid] = useState(false)

  useEffect(() => {
    if (!dialogOpen || !open) return
    setPackageType("POPUP_VIEW_DETAILS_LINK")
    setStartDate(new Date())
    setEndDate(undefined)
    setIsActive(true)
    setAdLinkUrl("")
    setAssets([])
    setStartCalOpen(false)
    setEndCalOpen(false)
    setIsDateRangeValid(true)
    setIsAdLinkValid(false)
  }, [dialogOpen, companyId, open])

  const canSubmit = Boolean(startDate) && isAdLinkValid && isDateRangeValid && !isPending

  const handleSubmit = async () => {
    if (!canSubmit) return
    await createAddon({
      packageType,
      startDate: startDate!.toISOString(),
      endDate: endDate ? endDate.toISOString() : null,
      adLinkUrl: adLinkUrl.trim(),
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
                {t(`admin.advertising.adPackageType.${type}`)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <CompanyActiveAdEditRow
        ad={{ ...CREATE_ROW_AD_PLACEHOLDER, packageType }}
        lang={i18n.language}
        packageTypeLabelKey={`admin.advertising.adPackageType.${packageType}`}
        showActiveToggle={false}
        showAssets={false}
        disableDateEditing={false}
        showDateRangeValidation
        showAdLinkValidation
        saveLabel={t("admin.activeAds.createSubmit")}
        isActive={isActive}
        setIsActive={setIsActive}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        adLinkUrl={adLinkUrl}
        setAdLinkUrl={setAdLinkUrl}
        assets={assets}
        setAssets={setAssets}
        startCalOpen={startCalOpen}
        setStartCalOpen={setStartCalOpen}
        endCalOpen={endCalOpen}
        setEndCalOpen={setEndCalOpen}
        saving={isPending}
        deleting={false}
        onCancel={handleCancel}
        onSave={handleSubmit}
        onDateRangeValidityChange={setIsDateRangeValid}
        onAdLinkValidityChange={setIsAdLinkValid}
      />
    </div>
  )
}
