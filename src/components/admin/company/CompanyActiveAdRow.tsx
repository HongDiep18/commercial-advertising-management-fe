"use client"

import { useDeleteActiveAd, useSaveActiveAd } from "@/api/active-ads/hooks"
import { uploadFiles } from "@/api/files/service"
import { useState } from "react"
import { CompanyActiveAdDisplayRow } from "./CompanyActiveAdDisplayRow"
import { CompanyActiveAdEditRow } from "./CompanyActiveAdEditRow"
import type { AssetEntry, CompanyActiveAdRowProps } from "./company-active-ads.types"

export function CompanyActiveAdRow({
  ad,
  companyId,
  locale,
  lang,
}: CompanyActiveAdRowProps) {
  const [editing, setEditing] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const { mutateAsync: saveAd, isPending: saving } = useSaveActiveAd(companyId)
  const { mutateAsync: deleteAd, isPending: deleting } = useDeleteActiveAd(companyId)

  const handleCancel = () => setEditing(false)

  const handleSave = async (values: {
    isActive: boolean
    startDate: Date | undefined
    endDate: Date | undefined
    adLinkUrl: string
    assets: AssetEntry[]
  }): Promise<void> => {
    const newFiles = values.assets.filter(
      (a): a is Extract<AssetEntry, { kind: "new" }> => a.kind === "new"
    )
    let uploadedUrls: string[] = []
    if (newFiles.length > 0) {
      const result = await uploadFiles(
        newFiles.map((a) => a.file),
        "active-ads"
      )
      uploadedUrls = result.files.map((f) => f.url)
    }
    let uploadIndex = 0
    const finalAssets = values.assets.map((a) =>
      a.kind === "existing"
        ? { fileUrl: a.fileUrl, assetType: a.assetType }
        : { fileUrl: uploadedUrls[uploadIndex++] ?? "", assetType: a.assetType }
    )
    await saveAd({
      activeAdId: ad.id,
      payload: {
        isActive: values.isActive,
        startDate: values.startDate?.toISOString(),
        endDate: values.endDate ? values.endDate.toISOString() : null,
        adLinkUrl: values.adLinkUrl.trim() || null,
        assets: finalAssets,
      },
    })
    setEditing(false)
  }

  const handleDelete = async () => {
    await deleteAd(ad.id)
    setDeleteConfirmOpen(false)
    setEditing(false)
  }

  if (!editing) {
    return (
      <CompanyActiveAdDisplayRow
        ad={ad}
        locale={locale}
        deleting={deleting}
        deleteConfirmOpen={deleteConfirmOpen}
        onDeleteConfirmOpenChange={setDeleteConfirmOpen}
        onDelete={handleDelete}
        onEdit={() => setEditing(true)}
      />
    )
  }

  return (
    <CompanyActiveAdEditRow
      ad={ad}
      lang={lang}
      saving={saving}
      deleting={deleting}
      onCancel={handleCancel}
      onSave={handleSave}
    />
  )
}
