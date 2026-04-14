import type { TFunction } from "i18next"
import { normalizeWebsiteHttpScheme } from "@/types/auth"
import { isValidPhone } from "@/utils/validation/phone"

export const SOCIAL_MESSAGING_TYPES = [
  "zalo",
  "wechat",
  "line",
  "skype",
  "facebook",
  "viber",
] as const

export type SocialMessagingType = (typeof SOCIAL_MESSAGING_TYPES)[number]

const SOCIAL_SET = new Set<string>(SOCIAL_MESSAGING_TYPES)

function isValidHttpUrl(value: string): boolean {
  const raw = value.trim()
  if (!raw) return false
  try {
    const normalized = /^https?:\/\//i.test(raw)
      ? normalizeWebsiteHttpScheme(raw)
      : `https://${raw}`
    const url = new URL(normalized)
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      Boolean(url.hostname.trim()) &&
      /[a-z0-9]/i.test(url.hostname)
    )
  } catch {
    return false
  }
}

export function getSocialMessagingInvalidErrorKey(
  typeKey: string,
  value: string
): "invalidWebsite" | "invalidSocialPhoneOrUrl" | "invalidSocialId" | null {
  if (!SOCIAL_SET.has(typeKey)) return null
  const v = value.trim()
  if (!v) return null

  switch (typeKey) {
    case "facebook":
      return isValidHttpUrl(v) ? null : "invalidWebsite"
    case "zalo":
      if (isValidHttpUrl(v) || isValidPhone(v)) return null
      if (/^[\w./-]{3,}$/i.test(v)) return null
      return "invalidSocialId"
    case "viber":
      return isValidPhone(v) || isValidHttpUrl(v) ? null : "invalidSocialPhoneOrUrl"
    case "line":
      return v.length >= 2 && /^[\w@.-]+$/.test(v) ? null : "invalidSocialId"
    case "wechat":
    case "skype":
      return v.length >= 2 && /^[\w.@:\-_]+$/i.test(v) ? null : "invalidSocialId"
    default:
      return null
  }
}

export function translateSocialMessagingValueError(
  t: TFunction,
  typeKey: string,
  value: string
): string | undefined {
  const key = getSocialMessagingInvalidErrorKey(typeKey, value)
  if (!key) return undefined
  const defaults: Record<"invalidWebsite" | "invalidSocialPhoneOrUrl" | "invalidSocialId", string> =
    {
      invalidWebsite: "Please enter a valid website URL.",
      invalidSocialPhoneOrUrl: "Enter a valid phone number or a link (e.g. https://…).",
      invalidSocialId: "Enter a valid ID using letters, numbers, and common symbols.",
    }
  return t(`register.errors.${key}`, { defaultValue: defaults[key] })
}
