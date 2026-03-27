"use client"

import { useDeleteActiveAd, useSaveActiveAd } from "@/api/active-ads/hooks"
import { uploadFiles } from "@/api/files/service"
import type { ChangeEvent } from "react"
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
  const [isActive, setIsActive] = useState(ad.isActive)
  const [startDate, setStartDate] = useState<Date | undefined>(
    ad.startDate ? new Date(ad.startDate) : undefined
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    ad.endDate ? new Date(ad.endDate) : undefined
  )
  const [adLinkUrl, setAdLinkUrl] = useState(ad.adLinkUrl ?? "")
  const [assets, setAssets] = useState<AssetEntry[]>(
    ad.assets.map((a) => ({ kind: "existing", fileUrl: a.fileUrl, assetType: a.assetType }))
  )
  const [startCalOpen, setStartCalOpen] = useState(false)
  const [endCalOpen, setEndCalOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const { mutateAsync: saveAd, isPending: saving } = useSaveActiveAd(companyId)
  const { mutateAsync: deleteAd, isPending: deleting } = useDeleteActiveAd(companyId)

  const handleCancel = () => {
    setIsActive(ad.isActive)
    setStartDate(ad.startDate ? new Date(ad.startDate) : undefined)
    setEndDate(ad.endDate ? new Date(ad.endDate) : undefined)
    setAdLinkUrl(ad.adLinkUrl ?? "")
    setAssets(
      ad.assets.map((a) => ({ kind: "existing", fileUrl: a.fileUrl, assetType: a.assetType }))
    )
    setEditing(false)
  }

  const handleSave = async () => {
    const newFiles = assets.filter(
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
    const finalAssets = assets.map((a) =>
      a.kind === "existing"
        ? { fileUrl: a.fileUrl, assetType: a.assetType }
        : { fileUrl: uploadedUrls[uploadIndex++] ?? "", assetType: a.assetType }
    )
    await saveAd({
      activeAdId: ad.id,
      payload: {
        isActive,
        startDate: startDate?.toISOString(),
        endDate: endDate ? endDate.toISOString() : null,
        adLinkUrl: adLinkUrl.trim() || null,
        assets: finalAssets,
      },
    })
    setEditing(false)
  }

  const handleFileAdd = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    setAssets((prev) => [
      ...prev,
      ...files.map((f) => ({
        kind: "new" as const,
        file: f,
        assetType: "banner",
        previewUrl: f.type.startsWith("image/") ? URL.createObjectURL(f) : "",
      })),
    ])
    e.target.value = ""
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
      saving={saving}
      deleting={deleting}
      onCancel={handleCancel}
      onSave={handleSave}
      onFileAdd={handleFileAdd}
    />
  )
}
