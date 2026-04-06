/**
 * Package types that have a homepage visual preview (matches backend getAdOrderPreview).
 */
export const AD_ORDER_PREVIEW_PACKAGE_TYPES = [
  "POPUP_PRIORITY_SLOT",
  "POPUP_ROTATION_SLOT",
  "FEATURED_HOMEPAGE_DISPLAY",
] as const

export type AdOrderPreviewPackageType = (typeof AD_ORDER_PREVIEW_PACKAGE_TYPES)[number]

const PREVIEWABLE_SET = new Set<string>(AD_ORDER_PREVIEW_PACKAGE_TYPES)

/**
 * Returns true when any of the given values is a package type supported by /ad-preview.
 */
export function hasPreviewableAdOrderPackageType(
  packageTypes: readonly (string | null | undefined)[]
): boolean {
  return packageTypes.some((t) => t != null && t !== "" && PREVIEWABLE_SET.has(t))
}
