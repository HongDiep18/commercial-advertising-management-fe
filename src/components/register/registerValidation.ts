import type { RegisterFormData } from "./registerConstants"
import type { ProfileFormData } from "@/types/account"
import { getRegionValuesForCountry } from "./registerOptions"
import { isValidPhone } from "@/utils/validation/phone"

const PHONE_FIELDS = ["phone", "contactPhone"] as const
const EMAIL_FIELD = "email" as const
const REQUIRED_KEYS: (keyof RegisterFormData)[] = [
  "companyNameVi",
  "companyNameCn",
  "phone",
  "taxId",
  "contactPerson",
  "contactPhone",
  "companyAddress",
  "email",
  "country",
  "region",
  "industry",
  "website",
  "introduction",
]
const PROFILE_REQUIRED_KEYS: (keyof ProfileFormData)[] = [
  "companyNameVi",
  "companyNameCn",
  "phone",
  "taxId",
  "contactName",
  "contactPhone",
  "address",
  "email",
  "country",
  "region",
  "industry",
  "website",
  "description",
]

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function filled(v: unknown): boolean {
  return typeof v === "string" && v.trim().length > 0
}

function isEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim())
}

export type RegisterErrorKind = "required" | "invalidEmail" | "invalidPhone" | "invalidRegion"

export type RegisterValidationResult =
  | { valid: true }
  | { valid: false; errors: Array<{ field: keyof RegisterFormData; kind: RegisterErrorKind }> }

export type ProfileValidationResult =
  | { valid: true }
  | { valid: false; errors: Array<{ field: keyof ProfileFormData; kind: RegisterErrorKind }> }

export const REGISTER_ERROR_KEYS: Record<RegisterErrorKind, string> = {
  required: "register.errors.requiredField",
  invalidEmail: "register.errors.invalidEmail",
  invalidPhone: "register.errors.invalidPhone",
  invalidRegion: "register.errors.invalidRegion",
}

export const PROFILE_ERROR_KEYS = REGISTER_ERROR_KEYS

function runValidation(
  data: Record<string, unknown>,
  requiredKeys: string[]
): Array<{ field: string; kind: RegisterErrorKind }> {
  const errors: Array<{ field: string; kind: RegisterErrorKind }> = []
  for (const key of requiredKeys) {
    if (!filled(data[key])) errors.push({ field: key, kind: "required" })
  }
  const emailVal = data[EMAIL_FIELD]
  if (filled(emailVal) && !isEmail(String(emailVal))) {
    errors.push({ field: EMAIL_FIELD, kind: "invalidEmail" })
  }
  for (const key of PHONE_FIELDS) {
    const val = data[key]
    if (filled(val) && !isValidPhone(String(val))) {
      errors.push({ field: key, kind: "invalidPhone" })
    }
  }
  return errors
}

export function validateRegisterForm(data: RegisterFormData): RegisterValidationResult {
  const errors = runValidation(data as unknown as Record<string, unknown>, REQUIRED_KEYS) as Array<{
    field: keyof RegisterFormData
    kind: RegisterErrorKind
  }>

  if (filled(data.country) && filled(data.region)) {
    const allowedRegions = getRegionValuesForCountry(data.country)
    if (!allowedRegions.includes(data.region)) {
      errors.push({ field: "region", kind: "invalidRegion" })
    }
  }
  if (errors.length === 0) return { valid: true }
  return { valid: false, errors }
}

export function validateProfileForm(data: ProfileFormData): ProfileValidationResult {
  const errors = runValidation(
    data as unknown as Record<string, unknown>,
    PROFILE_REQUIRED_KEYS
  ) as Array<{
    field: keyof ProfileFormData
    kind: RegisterErrorKind
  }>
  if (errors.length === 0) return { valid: true }
  return { valid: false, errors }
}
