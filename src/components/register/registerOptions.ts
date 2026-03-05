import type { RegisterMembershipTier } from "./registerConstants"

export type CountryOption = { value: string; labelKey: string; fallback: string }

export type RegionOption = { value: string; labelKey: string; fallback: string }

export const COUNTRY_OPTIONS: CountryOption[] = [
  { value: "vietnam", labelKey: "register.countries.vietnam", fallback: "越南" },
  { value: "taiwan", labelKey: "register.countries.taiwan", fallback: "台灣" },
  { value: "china", labelKey: "register.countries.china", fallback: "中國" },
  { value: "singapore", labelKey: "register.countries.singapore", fallback: "新加坡" },
  { value: "other", labelKey: "register.countries.other", fallback: "其他" },
]

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

export const MEMBERSHIP_TIER_OPTIONS: { value: RegisterMembershipTier; labelKey: string }[] = [
  { value: "bronze", labelKey: "register.tiers.bronze" },
  { value: "silver", labelKey: "register.tiers.silver" },
  { value: "gold", labelKey: "register.tiers.gold" },
  { value: "diamond", labelKey: "register.tiers.diamond" },
]

export function getCountryOptions(
  t: (key: string) => string
): Array<{ value: string; label: string }> {
  return COUNTRY_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) || o.fallback }))
}

export function getRegionOptions(
  country: string,
  t: (key: string) => string
): Array<{ value: string; label: string }> {
  const list = REGION_OPTIONS_BY_COUNTRY[country] ?? []
  return list.map((o) => ({ value: o.value, label: t(o.labelKey) || o.fallback }))
}
