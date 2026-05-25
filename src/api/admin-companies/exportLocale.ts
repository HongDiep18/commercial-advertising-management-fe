import type { AdminCompanyExportLocale } from "./types"

/** Maps app i18n language to backend export `locale` (en | vi | zh). */
export function i18nLanguageToAdminCompanyExportLocale(language: string): AdminCompanyExportLocale {
  const lang = language.toLowerCase()
  if (lang.startsWith("vi")) return "vi"
  if (lang.startsWith("zh")) return "zh"
  return "en"
}
