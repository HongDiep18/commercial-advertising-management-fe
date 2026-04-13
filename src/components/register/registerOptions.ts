import countries from "i18n-iso-countries"
import en from "i18n-iso-countries/langs/en.json"
import vi from "i18n-iso-countries/langs/vi.json"
import zh from "i18n-iso-countries/langs/zh.json"

export type RegionOption = { value: string; labelKey: string; fallback: string }

export const REGION_OPTIONS_BY_COUNTRY: Record<string, RegionOption[]> = {
  vietnam: [
    { value: "hcm", labelKey: "register.regions.hcm", fallback: "胡志明市" },
    { value: "hanoi", labelKey: "register.regions.hanoi", fallback: "河內" },
    { value: "binhduong", labelKey: "register.regions.binhduong", fallback: "平陽" },
    { value: "dongnai", labelKey: "register.regions.dongnai", fallback: "同奈" },
    { value: "danang", labelKey: "register.regions.danang", fallback: "峴港" },
    { value: "haiphong", labelKey: "register.regions.haiphong", fallback: "海防" },
  ],
  taiwan: [
    { value: "taipei", labelKey: "register.regions.taipei", fallback: "台北" },
    { value: "taichung", labelKey: "register.regions.taichung", fallback: "台中" },
    { value: "kaohsiung", labelKey: "register.regions.kaohsiung", fallback: "高雄" },
  ],
  china: [
    { value: "beijing", labelKey: "register.regions.beijing", fallback: "北京" },
    { value: "shanghai", labelKey: "register.regions.shanghai", fallback: "上海" },
    { value: "guangzhou", labelKey: "register.regions.guangzhou", fallback: "廣州" },
  ],
  singapore: [{ value: "singapore", labelKey: "register.regions.singapore", fallback: "新加坡" }],
  other: [{ value: "other", labelKey: "register.regions.other", fallback: "其他" }],
}

const COUNTRY_REGION_GROUPS: Record<string, keyof typeof REGION_OPTIONS_BY_COUNTRY> = {
  VN: "vietnam",
  TW: "taiwan",
  CN: "china",
  SG: "singapore",
}

countries.registerLocale(en)
countries.registerLocale(vi)
countries.registerLocale(zh)

export function getCountryOptions(language: string): Array<{ value: string; label: string }> {
  const lang = language.toLowerCase()
  const isoLang = lang.startsWith("vi") ? "vi" : lang.startsWith("zh") ? "zh" : "en"
  const names = countries.getNames(isoLang, { select: "official" }) as Record<string, string>
  return Object.entries(names)
    .map(([code, label]) => ({ value: code, label }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

/** Stored country value when the user picks "Other" (not an ISO alpha-2 code). */
export const REGISTER_COUNTRY_OTHER_VALUE = "other"

/**
 * ISO country list from `i18n-iso-countries` plus a final **Other** row (translated label).
 */
export function getRegisterCountryOptions(
  language: string,
  otherCountryLabel: string
): Array<{ value: string; label: string }> {
  const base = getCountryOptions(language)
  return [...base, { value: REGISTER_COUNTRY_OTHER_VALUE, label: otherCountryLabel }]
}

export function getRegionGroupForCountry(country: string): keyof typeof REGION_OPTIONS_BY_COUNTRY {
  return COUNTRY_REGION_GROUPS[country.toUpperCase()] ?? "other"
}

export function getRegionValuesForCountry(country: string): string[] {
  const key = getRegionGroupForCountry(country)
  const list = REGION_OPTIONS_BY_COUNTRY[key] ?? []
  return list.map((o) => o.value)
}

export function getRegionOptions(
  country: string,
  t: (key: string) => string
): Array<{ value: string; label: string }> {
  const key = getRegionGroupForCountry(country)
  const list = REGION_OPTIONS_BY_COUNTRY[key] ?? []
  return list.map((o) => ({ value: o.value, label: t(o.labelKey) || o.fallback }))
}
