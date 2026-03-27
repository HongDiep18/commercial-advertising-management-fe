"use client"

import { useEditActiveAd, useUploadOrderItemAssets } from "@/api/ad-orders-admin/hooks"
import type { ActiveAdDto, AdminOrderDetailItemDto } from "@/api/ad-orders-admin/types"
import Button from "@/components/ui/Button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog"
import Input from "@/components/ui/Input"
import Label from "@/components/ui/Label"
import { AlertTriangle, Upload, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

type Props = {
  orderId: string
  item: AdminOrderDetailItemDto & { activeAd: ActiveAdDto }
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

type Step = "edit" | "confirm"

export function AdOrderItemEditDialog({ orderId, item, open, onOpenChange, onSuccess }: Props) {
  const { t } = useTranslation()
  const { edit, isPending: isEditingLink } = useEditActiveAd()
  const { upload, isPending: isUploadingAssets } = useUploadOrderItemAssets()
  const isPending = isEditingLink || isUploadingAssets

  const [step, setStep] = useState<Step>("edit")
  const [adLinkUrl, setAdLinkUrl] = useState(item.activeAd.adLinkUrl ?? "")
  const [newFiles, setNewFiles] = useState<Array<{ file: File; assetType: string }>>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setStep("edit")
      setAdLinkUrl(item.activeAd.adLinkUrl ?? "")
      setNewFiles([])
    }
  }, [open, item])

  const linkChanged = adLinkUrl !== (item.activeAd.adLinkUrl ?? "")
  const hasChanges = linkChanged || newFiles.length > 0
  const assetsChanged = newFiles.length > 0
  const currentAssetsCount = item.activeAd.assets.length

  const formatAssetTypeLabel = (assetType: string) =>
    assetType.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setNewFiles(
      files.map((file, i) => ({
        file,
        assetType: item.activeAd.assets[i]?.assetType ?? "main_image",
      }))
    )
  }

  const handleConfirm = async () => {
    // Assets → PATCH .../items/:itemId/assets (works on any status, syncs ActiveAd automatically if APPROVED)
    if (assetsChanged) {
      await upload({ orderId, itemId: item.id, files: newFiles })
    }
    // Link URL → PATCH .../active-ads/:activeAdId (APPROVED only, adLinkUrl field)
    if (linkChanged) {
      await edit({ orderId, activeAdId: item.activeAd.id, body: { adLinkUrl } })
    }
    onSuccess?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-body-bg-dark max-w-3xl px-4 pt-5 pb-4">
        <button
          onClick={() => onOpenChange(false)}
          className="text-muted-foreground hover:text-foreground absolute top-3 right-3 rounded p-1"
        >
          <X className="h-4 w-4" />
        </button>

        <DialogHeader className="border-0 p-0 pb-2">
          <DialogTitle className="text-base">
            {t("admin.advertising.editActiveAd") || "Edit Active Ad"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {item.packageName}
          </DialogDescription>
        </DialogHeader>

        {step === "edit" ? (
          <>
            <div className="space-y-4 py-1">
              {/* Ad link URL */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  {t("adContact.adLink") || "Ad link URL"}
                </Label>
                <Input
                  value={adLinkUrl}
                  onChange={(e) => setAdLinkUrl(e.target.value)}
                  placeholder={item.activeAd.adLinkUrl || t("adContact.adLinkPlaceholder") || "Enter the destination URL"}
                  className="text-sm"
                />
              </div>

              {/* Assets */}
              <div className="space-y-2.5">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <Label className="text-sm font-medium">
                      {t("admin.advertising.uploadMaterial") || "Upload Advertising Material"}
                    </Label>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {t("admin.advertising.assetsReplaceNote") ||
                        "Uploading new files will replace all existing assets."}
                    </p>
                  </div>
                  {currentAssetsCount > 0 && (
                    <span className="text-muted-foreground shrink-0 text-xs">
                      {currentAssetsCount} {currentAssetsCount === 1 ? "file" : "files"}
                    </span>
                  )}
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {currentAssetsCount > 0 && (
                    <div className="bg-body-bg-dark-foreground border-border space-y-2 rounded-xl border p-3">
                      <p className="text-foreground text-sm font-medium">Current assets</p>
                      <div className="grid grid-cols-1 gap-2">
                        {item.activeAd.assets.map((asset) => (
                          <div
                            key={asset.id}
                            className="bg-background border-border overflow-hidden rounded-lg border"
                          >
                            <div className="bg-body-bg-dark-foreground aspect-[16/8] overflow-hidden">
                              <img
                                src={asset.fileUrl}
                                alt={asset.assetType}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  const el = e.target as HTMLImageElement
                                  el.style.display = "none"
                                  el.parentElement!.classList.add(
                                    "flex",
                                    "items-center",
                                    "justify-center"
                                  )
                                  const icon = document.createElement("span")
                                  icon.textContent = "?"
                                  icon.className = "text-muted-foreground text-xs"
                                  el.parentElement!.appendChild(icon)
                                }}
                              />
                            </div>
                            <div className="px-3 py-1.5">
                              <span className="text-foreground truncate text-xs font-medium">
                                {formatAssetTypeLabel(asset.assetType)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-border hover:border-primary/60 hover:bg-primary/5 w-full rounded-xl border-2 border-dashed px-5 py-5 text-center transition-colors ${
                        newFiles.length > 0 ? "border-primary/60 bg-primary/5" : ""
                      }`}
                    >
                      <Upload className="text-muted-foreground mx-auto mb-1.5 h-5 w-5" />
                      {newFiles.length > 0 ? (
                        <>
                          <p className="text-primary text-sm font-medium">
                            {newFiles.length} {t("admin.advertising.filesSelected") || "file(s) selected"}
                          </p>
                          <p className="text-muted-foreground mt-1 text-xs">
                            {t("admin.advertising.chooseFiles") || "Choose new files"}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-medium">
                            {t("admin.advertising.chooseFiles") || "Choose new files"}
                          </p>
                          <p className="text-muted-foreground mt-1 text-xs">
                            {t("admin.advertising.assetsReplaceNote") ||
                              "Uploading new files will replace all existing assets."}
                          </p>
                        </>
                      )}
                    </button>

                    {newFiles.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-foreground text-sm font-medium">Selected replacement files</p>
                        <div className="space-y-1">
                          {newFiles.map(({ file, assetType }, i) => (
                            <div
                              key={i}
                              className="bg-body-bg-dark-foreground flex items-center justify-between gap-3 rounded-lg px-3 py-1.5 text-sm"
                            >
                              <span className="text-foreground min-w-0 flex-1 truncate">{file.name}</span>
                              <span className="text-muted-foreground shrink-0 text-xs">
                                {formatAssetTypeLabel(assetType)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {t("common.cancel") || "Cancel"}
              </Button>
              <Button
                variant="primary"
                disabled={!hasChanges}
                onClick={() => setStep("confirm")}
              >
                {t("common.save") || "Save"}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex gap-3 py-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {t("admin.advertising.confirmEditTitle") || "Confirm changes"}
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {assetsChanged
                    ? t("admin.advertising.confirmEditAssetsDesc") ||
                      "This will update the ad and permanently replace all existing assets. This cannot be undone."
                    : t("admin.advertising.confirmEditLinkDesc") ||
                      "This will update the click-through URL on the live ad."}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep("edit")} disabled={isPending}>
                {t("common.back") || "Back"}
              </Button>
              <Button
                variant="primary"
                onClick={() => void handleConfirm()}
                disabled={isPending}
              >
                {isPending
                  ? t("common.saving") || "Saving..."
                  : t("common.confirmSave") || "Yes, save changes"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
