import type { TFunction } from "i18next"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmailFormat(value: string): boolean {
  return EMAIL_REGEX.test(value.trim())
}

export type InvalidEmailHintKey =
  | "invalidEmailHintNoAt"
  | "invalidEmailHintMultipleAt"
  | "invalidEmailHintNoLocal"
  | "invalidEmailHintNoDomain"
  | "invalidEmailHintNoDot"
  | "invalidEmail"

const HINT_DEFAULTS: Record<InvalidEmailHintKey, string> = {
  invalidEmailHintNoAt: 'Add an "@" between your name and domain (e.g. name@company.com).',
  invalidEmailHintMultipleAt: 'Use only one "@" in the email address.',
  invalidEmailHintNoLocal: 'Add the part before "@" (e.g. your name or inbox).',
  invalidEmailHintNoDomain: 'Add the part after "@" (e.g. gmail.com).',
  invalidEmailHintNoDot: "Use a domain that includes a dot (e.g. name@mail.com).",
  invalidEmail: "Please enter a valid email address.",
}

export function getInvalidEmailHintKey(raw: string): InvalidEmailHintKey {
  const s = raw.trim()
  if (EMAIL_REGEX.test(s)) return "invalidEmail"

  const atCount = (s.match(/@/g) ?? []).length
  if (atCount === 0) return "invalidEmailHintNoAt"
  if (atCount > 1) return "invalidEmailHintMultipleAt"

  const [local, domain] = s.split("@", 2)
  if (!local.trim()) return "invalidEmailHintNoLocal"
  if (!domain?.trim()) return "invalidEmailHintNoDomain"
  if (!domain.includes(".")) return "invalidEmailHintNoDot"
  return "invalidEmail"
}

/** User-facing message for invalid email (contextual hint + i18n). */
export function translateInvalidEmailHint(t: TFunction, raw: string): string {
  const key = getInvalidEmailHintKey(raw)
  return t(`register.errors.${key}`, { defaultValue: HINT_DEFAULTS[key] })
}
