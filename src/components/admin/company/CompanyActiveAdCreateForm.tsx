"use client"

import { AdPackageType } from "@/api/active-ads/adminService"
import { useCreateCompanyPopupAddon } from "@/api/active-ads/hooks"
import { translateAdPackageType } from "@/components/admin/advertising/AdPackageLabel"
import AdItemForm, { type OrderItemValues } from "@/components/shared/AdItemForm"
import Button from "@/components/ui/Button"
import { useState } from "react"
import { useTranslation } from "react-i18next"

const AllowedAdPackage = [
  AdPackageType.POPUP_PRIORITY_DETAILS_LINK,
  AdPackageType.POPUP_ROTATION_DETAILS_LINK,
  AdPackageType.POPUP_RANKING_ADJUSTMENT,
] as const

const AD_LINK_REQUIRED_TYPES: string[] = [
  AdPackageType.POPUP_PRIORITY_DETAILS_LINK,
  AdPackageType.POPUP_ROTATION_DETAILS_LINK,
]

type Props = {
  companyId: string
}

export function CompanyActiveAdCreateForm({ companyId }: Props) {
  const { t, i18n } = useTranslation()
  const { mutateAsync: createAddon, isPending } = useCreateCompanyPopupAddon(companyId)
  const [packageType, setPackageType] = useState<AdPackageType>(
    AdPackageType.POPUP_PRIORITY_DETAILS_LINK
  )
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const adLinkRequired = AD_LINK_REQUIRED_TYPES.includes(packageType)

  const orderItemData = {
    id: packageType,
    name: translateAdPackageType(t, packageType),
    category: "",
    price: "",
    packageType,
  }

  const formConfig = {
    requiresStartDate: false,
    requiresAdLink: adLinkRequired,
    requiresDesignService: false,
    requiresAssets: false,
  }

  const handleSubmit = async (values: OrderItemValues): Promise<void> => {
    await createAddon({
      packageType,
      startDate: values.startDate
        ? new Date(values.startDate).toISOString()
        : new Date().toISOString(),
      endDate: values.endDate ? new Date(values.endDate).toISOString() : null,
      adLinkUrl: values.adLink,
    })
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
            onChange={(e) => setPackageType(e.target.value as AdPackageType)}
            className="border-input bg-background text-foreground focus:ring-primary h-9 w-full rounded-md border px-2 text-xs focus:ring-1 focus:outline-none"
          >
            {AllowedAdPackage.map((type) => (
              <option key={type} value={type}>
                {translateAdPackageType(t, type.toString())}
              </option>
            ))}
          </select>
        </div>
      </div>
      <AdItemForm
        key={`${packageType}-${i18n.language}`}
        orderItemData={orderItemData}
        formConfig={formConfig}
        onSubmit={handleSubmit}
        onCancel={() => setIsCreateOpen(false)}
        submitLabel={isPending ? t("common.saving", "Saving...") : t("common.save")}
      />
    </div>
  )
}
