"use client"

import { useEditActiveAd } from "@/api/ad-orders-admin/hooks"
import type { ActiveAdAddOnDto } from "@/api/ad-orders-admin/types"
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
import { X } from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

type Props = {
  orderId: string
  addOn: ActiveAdAddOnDto
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AdOrderAddOnEditDialog({ orderId, addOn, open, onOpenChange, onSuccess }: Props) {
  const { t } = useTranslation()
  const { edit, isPending } = useEditActiveAd()
  const [adLinkUrl, setAdLinkUrl] = useState(addOn.adLinkUrl ?? "")

  useEffect(() => {
    if (open) setAdLinkUrl(addOn.adLinkUrl ?? "")
  }, [open, addOn])

  const linkChanged = adLinkUrl !== (addOn.adLinkUrl ?? "")

  const isValidUrl = (val: string) => {
    if (!val.trim()) return true // empty is allowed (clears the link)
    try { return Boolean(new URL(val)) } catch { return false }
  }
  const urlError = adLinkUrl.trim() !== "" && !isValidUrl(adLinkUrl.trim())

  const handleSave = async () => {
    if (!linkChanged || urlError) return
    await edit({ orderId, activeAdId: addOn.id, body: { adLinkUrl } })
    onSuccess?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-body-bg-dark max-w-sm px-6 pt-8 pb-6">
        <button
          onClick={() => onOpenChange(false)}
          className="text-muted-foreground hover:text-foreground absolute top-3 right-3 rounded p-1"
        >
          <X className="h-4 w-4" />
        </button>

        <DialogHeader className="border-0 p-0 pb-2">
          <DialogTitle className="text-base">
            {t("admin.advertising.editActiveAd") || "Edit"}
          </DialogTitle>
          <DialogDescription className="text-xs">{addOn.packageName}</DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              {t("adContact.adLink") || "Advertising Link URL"}
            </Label>
            <Input
              value={adLinkUrl}
              onChange={(e) => setAdLinkUrl(e.target.value)}
              placeholder={addOn.adLinkUrl || t("adContact.adLinkPlaceholder") || "Enter the destination URL"}
              className={`text-sm ${urlError ? "border-red-500 focus:ring-red-500" : ""}`}
            />
            {urlError && (
              <p className="text-xs text-red-500">
                {t("admin.advertising.addOnDetailsPageUrlError") || "Please enter a valid URL (e.g. https://...)"}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            {t("common.cancel") || "Cancel"}
          </Button>
          <Button
            variant="primary"
            disabled={!linkChanged || urlError || isPending}
            onClick={() => void handleSave()}
          >
            {isPending ? t("common.saving") || "Saving..." : t("common.save") || "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
