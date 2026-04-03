"use client"

import { useDeleteActiveAd, useSaveActiveAd } from "@/api/active-ads/hooks"
import { uploadFiles } from "@/api/files/service"
import AdItemForm, { type OrderItemValues } from "@/components/shared/AdItemForm"
import { t } from "i18next"
import { useState } from "react"
import { CompanyActiveAdDisplayRow } from "./CompanyActiveAdDisplayRow"
import type { CompanyActiveAdRowProps } from "./company-active-ads.types"

export function CompanyActiveAdRow({ ad, companyId, locale }: CompanyActiveAdRowProps) {
  const [editing, setEditing] = useState(false)
  const { mutateAsync: saveAd, isPending: saving } = useSaveActiveAd(companyId)
  const { mutateAsync: deleteAd, isPending: deleting } = useDeleteActiveAd(companyId)

  const handleCancel = () => setEditing(false)

  const handleSave = async (values: OrderItemValues): Promise<void> => {
    let uploadedUrls: string[] = []
    if (values.files.length > 0) {
      const result = await uploadFiles(values.files, "active-ads")
      uploadedUrls = result.files.map((f) => f.url)
    }
    const newAssets = uploadedUrls.map((url) => ({ fileUrl: url, assetType: "banner" }))
    const finalAssets = [...(values.existingAssets ?? []), ...newAssets]
    await saveAd({
      activeAdId: ad.id,
      payload: {
        isActive: values.isActive ?? ad.isActive,
        startDate: values.startDate || undefined,
        endDate: values.endDate ? values.endDate : null,
        adLinkUrl: values.adLink.trim() || null,
        assets: finalAssets,
      },
    })
    setEditing(false)
  }

  const handleDelete = async () => {
    await deleteAd(ad.id)
    setEditing(false)
  }

  if (!editing) {
    return (
      <CompanyActiveAdDisplayRow
        ad={ad}
        locale={locale}
        deleting={deleting}
        onDelete={handleDelete}
        onEdit={() => setEditing(true)}
      />
    )
  }

  const orderItemData = {
    id: ad.id,
    name: ad.packageType,
    category: "",
    price: "",
    packageType: ad.packageType,
  }

  const formConfig = {
    ...ad.formConfig,
    requiresActiveToggle: true,
  }

  const defaultValues: Partial<OrderItemValues> = {
    isActive: ad.isActive,
    startDate: ad.startDate,
    endDate: ad.endDate ?? "",
    adLink: ad.adLinkUrl ?? "",
    existingAssets: ad.assets,
  }

  return (
    <AdItemForm
      orderItemData={orderItemData}
      formConfig={formConfig}
      defaultValues={defaultValues}
      onSubmit={handleSave}
      onCancel={handleCancel}
      submitLabel={saving ? t("common.saving", "Saving...") : t("common.save")}
    />
  )
}
