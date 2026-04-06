"use client"

import { AD_ORDER_PREVIEW_STORAGE_KEY } from "@/components/shared/ad-order-preview.constants"
import { hasPreviewableAdOrderPackageType } from "@/components/shared/AdOrderPreviewButton/helper"
import Button, { type ButtonProps } from "@/components/ui/Button"
import { Eye } from "lucide-react"
import { useTranslation } from "react-i18next"

type AdOrderPreviewButtonProps = {
  orderId: string
  /** Line-item package types; button is hidden when none support homepage preview. */
  itemPackageTypes: readonly (string | null | undefined)[]
  labelKey: string
  labelDefault?: string
} & Omit<ButtonProps, "type" | "onClick" | "children">

/**
 * Opens the ad order preview route in a new tab and sets the storage token the preview page expects.
 */
export function AdOrderPreviewButton({
  orderId,
  itemPackageTypes,
  labelKey,
  labelDefault,
  disabled,
  ...buttonProps
}: AdOrderPreviewButtonProps) {
  const { t } = useTranslation()
  if (!hasPreviewableAdOrderPackageType(itemPackageTypes)) {
    return null
  }
  const openAdOrderPreview = (): void => {
    localStorage.setItem(AD_ORDER_PREVIEW_STORAGE_KEY, orderId)
    window.open(`/ad-preview/${orderId}`, "_blank")
  }
  const label: string =
    labelDefault !== undefined ? t(labelKey, { defaultValue: labelDefault }) : t(labelKey)
  return (
    <Button
      type="button"
      disabled={disabled ?? orderId === ""}
      onClick={openAdOrderPreview}
      {...buttonProps}
    >
      <Eye className="mr-2 h-4 w-4" />
      {label}
    </Button>
  )
}
