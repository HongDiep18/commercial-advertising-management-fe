"use client"

import { PERSISTENT_FALSE_QUERY, PERSISTENT_EMPTY_STRING_QUERY } from "@/lib/persistentUiQuery"
import { useQuery } from "@tanstack/react-query"
import type { RefObject } from "react"
import type { CompanyChannelContact } from "@/api/companies/types"

export type ContactGroup = { contactName: string; contactPhones: string[] }
export type SocialContactItem = { type: string; value: string; contactName: string }

export const COPY_FEEDBACK_MS = 2000
export const EMAIL_LIST_CLOSE_DELAY_MS = 160
export const INDUSTRY_TAG_VISIBLE_DEFAULT = 1

const SOCIAL_CONTACT_TYPES = ["zalo", "wechat", "line", "skype", "facebook", "viber"] as const
const SOCIAL_CONTACT_TYPE_SET = new Set<string>(SOCIAL_CONTACT_TYPES)
const OTHER_CONTACT_TYPES = ["tel", "hotline", "fax"] as const
const OTHER_CONTACT_TYPE_SET = new Set<string>(OTHER_CONTACT_TYPES)

export function usePersistentStringQuery(queryKey: readonly unknown[]): string {
  const { data = "" } = useQuery({
    queryKey,
    ...PERSISTENT_EMPTY_STRING_QUERY,
  })
  return data
}

export function usePersistentBooleanQuery(queryKey: readonly unknown[]): boolean {
  const { data = false } = useQuery({
    queryKey,
    ...PERSISTENT_FALSE_QUERY,
  })
  return data
}

export function pickSelectedByType<T extends { type: string }>(
  items: T[],
  selectedType: string
): T | undefined {
  return items.find((item) => item.type === selectedType) ?? items[0]
}

export function getDeterministicHash(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 31 + seed.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

export function normalizeEmails(emails: string[]): string[] {
  return [...new Set(emails.map((v) => v.trim()).filter(Boolean))]
}

export function normalizeAddressList(addresses: string[]): string[] {
  return addresses.map((v) => v.trim()).filter(Boolean)
}

function extractContactValuesByType(contacts: CompanyChannelContact[] | undefined, type: string): string[] {
  if (!Array.isArray(contacts)) return []
  return normalizeAddressList(
    contacts
      .filter(
        (contact) =>
          String(contact?.type ?? "")
            .trim()
            .toLowerCase() === type
      )
      .map((contact) => String(contact?.value ?? ""))
  )
}

export function getCompanyAddressesFromApi(company: {
  addresses?: string[] | null
  address?: string | null
  contacts?: CompanyChannelContact[] | null
  channelContacts?: CompanyChannelContact[] | null
}): string[] {
  const contactAddresses = extractContactValuesByType(company.contacts ?? undefined, "address")
  if (contactAddresses.length > 0) return contactAddresses

  const baseAddresses = Array.isArray(company.addresses) ? normalizeAddressList(company.addresses) : []
  if (baseAddresses.length > 0) return baseAddresses

  const channelAddresses = extractContactValuesByType(company.channelContacts ?? undefined, "address")
  if (channelAddresses.length > 0) return channelAddresses

  return normalizeAddressList([String(company.address ?? "")])
}

export function getCompanyWebsitesFromApi(company: {
  website?: string | null
  contacts?: CompanyChannelContact[] | null
  channelContacts?: CompanyChannelContact[] | null
}): string[] {
  const contactWebsites = extractContactValuesByType(company.contacts ?? undefined, "website")
  if (contactWebsites.length > 0) return contactWebsites

  const channelWebsites = extractContactValuesByType(company.channelContacts ?? undefined, "website")
  if (channelWebsites.length > 0) return channelWebsites

  return normalizeAddressList([String(company.website ?? "")])
}

function getTypedContactsFromApi(
  company: {
    contacts?: CompanyChannelContact[] | null
    channelContacts?: CompanyChannelContact[] | null
  },
  allowedTypes: Set<string>
): SocialContactItem[] {
  const source = Array.isArray(company.contacts) ? company.contacts : (company.channelContacts ?? [])
  return source
    .map((item) => ({
      type: String(item?.type ?? "")
        .trim()
        .toLowerCase(),
      value: String(item?.value ?? "").trim(),
      contactName: String(item?.contactName ?? "").trim(),
    }))
    .filter((item) => allowedTypes.has(item.type) && item.value.length > 0)
}

export function getSocialContactsFromApi(company: {
  contacts?: CompanyChannelContact[] | null
  channelContacts?: CompanyChannelContact[] | null
}): SocialContactItem[] {
  return getTypedContactsFromApi(company, SOCIAL_CONTACT_TYPE_SET)
}

export function getOtherContactsFromApi(company: {
  contacts?: CompanyChannelContact[] | null
  channelContacts?: CompanyChannelContact[] | null
}): SocialContactItem[] {
  return getTypedContactsFromApi(company, OTHER_CONTACT_TYPE_SET)
}

export function toWebsiteHref(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return "#"
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

export function normalizeContactGroups(contacts: ContactGroup[]): ContactGroup[] {
  return contacts
    .map((item) => ({
      contactName: item.contactName?.trim() ?? "",
      contactPhones: normalizeEmails(item.contactPhones ?? []),
    }))
    .filter((item) => item.contactName || item.contactPhones.length > 0)
}

export function clearCloseTimer(timerRef: RefObject<ReturnType<typeof setTimeout> | null>) {
  if (timerRef.current) {
    clearTimeout(timerRef.current)
    timerRef.current = null
  }
}
