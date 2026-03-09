export const MIN_PASSWORD_LENGTH = 8
export const MAX_PASSWORD_LENGTH = 128

export type SetPasswordValidationResult = { valid: true } | { valid: false; errorKey: string }

const ERROR_KEYS = {
  required: "setPassword.errors.required",
  minLength: "setPassword.errors.minLength",
  maxLength: "setPassword.errors.maxLength",
  letterAndNumber: "setPassword.errors.letterAndNumber",
  uppercase: "setPassword.errors.uppercase",
  lowercase: "setPassword.errors.lowercase",
  specialChar: "setPassword.errors.specialChar",
  mismatch: "setPassword.errors.mismatch",
} as const

const PATTERN_RULES: ReadonlyArray<{ test: RegExp; errorKey: string }> = [
  { test: /^(?=.*[a-zA-Z])(?=.*[0-9])/, errorKey: ERROR_KEYS.letterAndNumber },
  { test: /^(?=.*[A-Z])/, errorKey: ERROR_KEYS.uppercase },
  { test: /^(?=.*[a-z])/, errorKey: ERROR_KEYS.lowercase },
  { test: /^(?=.*[!@#$%^&*()_+\-=[\]{}|;:'",.<>?/\\`~])/, errorKey: ERROR_KEYS.specialChar },
]

function fail(errorKey: string): SetPasswordValidationResult {
  return { valid: false, errorKey }
}

export function validateSetPassword(
  password: string,
  confirmPassword: string
): SetPasswordValidationResult {
  const p = password.trim()
  const c = confirmPassword.trim()

  if (!p) return fail(ERROR_KEYS.required)
  if (p.length < MIN_PASSWORD_LENGTH) return fail(ERROR_KEYS.minLength)
  if (p.length > MAX_PASSWORD_LENGTH) return fail(ERROR_KEYS.maxLength)

  for (const { test, errorKey } of PATTERN_RULES) {
    if (!test.test(p)) return fail(errorKey)
  }

  if (p !== c) return fail(ERROR_KEYS.mismatch)
  return { valid: true }
}
