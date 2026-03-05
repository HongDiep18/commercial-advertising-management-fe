import type { RegisterFormData } from "./registerConstants"

const PHONE_REGEX = /^[\d\s\-+()]+$/
const MIN_PHONE_DIGITS = 8

const PHONE_FIELDS: (keyof RegisterFormData)[] = ["phone", "contactPhone"]

function isPhoneNumber(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed.length) return false
  if (!PHONE_REGEX.test(trimmed)) return false
  const digitCount = (trimmed.match(/\d/g) ?? []).length
  return digitCount >= MIN_PHONE_DIGITS
}

export const REGISTER_REQUIRED_FIELDS: { key: keyof RegisterFormData; isEmail: boolean }[] = [
  { key: "companyNameVi", isEmail: false },
  { key: "companyNameCn", isEmail: false },
  { key: "phone", isEmail: false },
  { key: "taxId", isEmail: false },
  { key: "contactPerson", isEmail: false },
  { key: "contactPhone", isEmail: false },
  { key: "companyAddress", isEmail: false },
  { key: "email", isEmail: true },
  { key: "country", isEmail: false },
  { key: "region", isEmail: false },
  { key: "industry", isEmail: false },
  { key: "website", isEmail: false },
  { key: "introduction", isEmail: false },
]

export type RegisterValidationResult =
  | { valid: true }
  | { valid: false; field: keyof RegisterFormData; isEmail: boolean }
  | { valid: false; field: keyof RegisterFormData; invalidPhone: true }

export function validateRegisterForm(data: RegisterFormData): RegisterValidationResult {
  for (const { key, isEmail } of REGISTER_REQUIRED_FIELDS) {
    const value = data[key]
    const filled = typeof value === "string" ? value.trim().length > 0 : false
    if (!filled) {
      return { valid: false, field: key, isEmail }
    }
  }
  for (const key of PHONE_FIELDS) {
    const value = data[key]
    if (typeof value === "string" && !isPhoneNumber(value)) {
      return { valid: false, field: key, invalidPhone: true }
    }
  }
  return { valid: true }
}
