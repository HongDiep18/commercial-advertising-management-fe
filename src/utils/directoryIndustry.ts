import { industryFromUnknown } from "@/api/companies/adminCompany.mapper"

/** Normalize directory API `industry` (string | string[] | JSON) to slug ids. */
export function getDirectoryIndustryIds(industry: unknown): string[] {
  return industryFromUnknown(industry)
}

/**
 * Whether a company row matches the sidebar selection (OR: any selected id appears in the company's industries).
 */
export function directoryCompanyMatchesSelectedCategories(
  selectedCategories: string[],
  industry: unknown
): boolean {
  if (selectedCategories.length === 0) return true
  const ids = getDirectoryIndustryIds(industry)
  return selectedCategories.some((id) => ids.includes(id))
}
