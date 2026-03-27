import type { i18n, TFunction } from "i18next"

import { REGION_KEYS_BY_COUNTRY } from "@/constants/location"

export const REGION_LABEL_LANGS = ["en-US", "vi-VN", "zh-TW"] as const

export const ALL_REGION_KEYS = Array.from(new Set(Object.values(REGION_KEYS_BY_COUNTRY).flat()))

const MIN_PREFIX_LEN = 2

export function normalizeRegionKey(region: string): string {
  return region
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[\s_-]+/g, "")
}

export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export function compactSearchText(value: string): string {
  return normalizeSearchText(value).replace(/\s+/g, "")
}

export function resolveCanonicalRegionKey(raw: string, i18n: i18n): string | null {
  const nr = normalizeRegionKey(raw)
  if (!nr) return null

  for (const key of ALL_REGION_KEYS) {
    if (normalizeRegionKey(key) === nr) return key
  }

  for (const key of ALL_REGION_KEYS) {
    for (const lng of REGION_LABEL_LANGS) {
      const registerLabel = i18n.t(`register.regions.${key}`, { lng, defaultValue: "" })
      const detailLabel = i18n.t(`companyDetail.regions.${key}`, { lng, defaultValue: "" })
      for (const label of [registerLabel, detailLabel]) {
        if (label && normalizeRegionKey(label) === nr) return key
      }
    }
  }

  return null
}

export function getRegionSearchSynonyms(regionKey: string, i18n: i18n): string[] {
  const out = new Set<string>()
  out.add(regionKey)
  for (const lng of REGION_LABEL_LANGS) {
    const registerLabel = i18n.t(`register.regions.${regionKey}`, { lng, defaultValue: "" })
    const detailLabel = i18n.t(`companyDetail.regions.${regionKey}`, { lng, defaultValue: "" })
    if (registerLabel) out.add(registerLabel)
    if (detailLabel) out.add(detailLabel)
  }
  return [...out]
}

export function regionSynonymMatchesQuery(query: string, synonym: string): boolean {
  const qn = normalizeSearchText(query)
  const qc = compactSearchText(query)
  if (!qn) return false

  const sn = normalizeSearchText(synonym)
  const sc = compactSearchText(synonym)
  if (sn === qn || sc === qc) return true

  if (qc.length >= MIN_PREFIX_LEN && sc.startsWith(qc)) return true

  if (qn.length >= MIN_PREFIX_LEN) {
    if (sn.startsWith(qn) && (sn.length === qn.length || sn[qn.length] === " ")) return true
    const firstWord = sn.split(/\s+/)[0] ?? ""
    if (firstWord.startsWith(qn)) return true
    if (!sn.includes(" ") && sn.startsWith(qn)) return true
  }

  return false
}

export function regionQueryMatchesSynonymsPrefix(
  query: string,
  regionKey: string,
  i18n: i18n
): boolean {
  const qn = normalizeSearchText(query)
  if (!qn) return false
  if (normalizeRegionKey(regionKey) === normalizeRegionKey(query)) return true

  const syns = getRegionSearchSynonyms(regionKey, i18n)
  return syns.some((s) => regionSynonymMatchesQuery(query, s))
}

export function findRegionKeyForSearchQuery(trimmedSearch: string, i18n: i18n): string | null {
  const direct = resolveCanonicalRegionKey(trimmedSearch, i18n)
  if (direct) return direct

  const matches = ALL_REGION_KEYS.filter((key) =>
    regionQueryMatchesSynonymsPrefix(trimmedSearch, key, i18n)
  )
  if (matches.length === 1) return matches[0]
  return null
}

export function isWholeQueryRegionMatch(query: string, key: string, i18n: i18n): boolean {
  return regionQueryMatchesSynonymsPrefix(query, key, i18n)
}

export function getDirectorySearchAndRegionParams(
  trimmedSearch: string,
  selectedRegions: string[],
  i18n: i18n
): { search?: string; region?: string[] } {
  const regionKey = trimmedSearch ? findRegionKeyForSearchQuery(trimmedSearch, i18n) : null
  const mergedRegion = [...new Set([...selectedRegions, ...(regionKey ? [regionKey] : [])])]

  let search: string | undefined = trimmedSearch || undefined
  if (regionKey && isWholeQueryRegionMatch(trimmedSearch, regionKey, i18n)) {
    search = undefined
  }

  return {
    search,
    region: mergedRegion.length > 0 ? mergedRegion : undefined,
  }
}

export function translateRegionLabel(region: string, t: TFunction, i18n: i18n): string {
  const normalizedRegion = normalizeRegionKey(region)
  if (!normalizedRegion) return region
  return (
    (i18n.exists(`companyDetail.regions.${normalizedRegion}`)
      ? t(`companyDetail.regions.${normalizedRegion}`)
      : "") ||
    (i18n.exists(`register.regions.${normalizedRegion}`)
      ? t(`register.regions.${normalizedRegion}`)
      : "") ||
    region
  )
}

export function companyRegionMatchesSearch(
  rawRegion: string | undefined,
  query: string,
  i18n: i18n
): boolean {
  if (!rawRegion?.trim()) return false
  const qn = normalizeSearchText(query)
  if (!qn) return false

  if (regionSynonymMatchesQuery(query, rawRegion)) return true
  if (normalizeRegionKey(rawRegion) === normalizeRegionKey(query)) return true

  const key = resolveCanonicalRegionKey(rawRegion, i18n)
  if (!key) return false
  return regionQueryMatchesSynonymsPrefix(query, key, i18n)
}

export function companyDirectoryRowMatchesSearch(
  row: {
    name: string
    industry: string
    region?: string
    address?: string
    description?: string
    contactName?: string
    email?: string
    phone?: string
  },
  searchValue: string,
  i18n: i18n
): boolean {
  const qn = normalizeSearchText(searchValue)
  const qc = compactSearchText(searchValue)
  if (!qn) return true

  const baseParts = [
    row.name,
    row.industry,
    row.address,
    row.description,
    row.contactName,
    row.email,
    row.phone,
  ].filter(Boolean) as string[]

  const joined = baseParts.join(" ")
  const hay = normalizeSearchText(joined)
  const hayC = compactSearchText(joined)
  const baseMatch = hay.includes(qn) || hayC.includes(qc)

  const regionMatch = row.region ? companyRegionMatchesSearch(row.region, searchValue, i18n) : false

  return baseMatch || regionMatch
}
