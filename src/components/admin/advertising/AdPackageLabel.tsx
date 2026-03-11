"use client"

import clsx from "clsx"
import type { ReactElement } from "react"
import { useTranslation } from "react-i18next"

type PrintPlacementMetadata = {
  page_position?: string | null
  page_side?: string | null
  page_size?: string | null
  color_type?: string | null
  dimensions_cm?: string | null
}

type AdPackageLabelProps = {
  packageType: string
  packageMetadata?: Record<string, unknown> | null
  fallbackLabel?: string
  className?: string
}

function buildPrintPlacementKey(metadata: Record<string, unknown> | null | undefined): string {
  const meta = (metadata ?? {}) as PrintPlacementMetadata
  const position = meta.page_position ?? ""
  const side = meta.page_side ?? ""
  const size = meta.page_size ?? ""
  const color = meta.color_type ?? ""
  const dimensions = (meta.dimensions_cm ?? "").replace(/\s+/g, "")
  const keyParts: string[] = []
  if (position) keyParts.push(position)
  if (side) keyParts.push(side)
  if (size) keyParts.push(size)
  if (color) keyParts.push(color)
  if (dimensions) keyParts.push(dimensions)
  return keyParts.join("_")
}

export function getAdPackageLabelText(input: {
  packageType: string
  packageMetadata?: Record<string, unknown> | null
  fallbackLabel?: string
  t: (key: string) => string
}): string {
  const { packageType, packageMetadata, fallbackLabel, t } = input
  if (packageType === "PRINT_PLACEMENT") {
    const key = buildPrintPlacementKey(packageMetadata)
    if (key) {
      const translated = t(`admin.advertising.adPackageType.PRINT_PLACEMENT.${key}`)
      if (translated) return translated
    }
  }
  const generic = t(`admin.advertising.adPackageType.${packageType}`)
  return generic || fallbackLabel || packageType
}

export function AdPackageLabel({
  packageType,
  packageMetadata,
  fallbackLabel,
  className,
}: AdPackageLabelProps): ReactElement {
  const { t } = useTranslation()
  const label = getAdPackageLabelText({ packageType, packageMetadata, fallbackLabel, t })

  return <span className={clsx(className)}>{label}</span>
}

