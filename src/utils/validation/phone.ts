const PHONE_REGEX = /^[\d\s\-+()]+$/
const MIN_PHONE_DIGITS = 8

export function isValidPhone(value: string): boolean {
  const t = value.trim()
  return t.length > 0 && PHONE_REGEX.test(t) && (t.match(/\d/g) ?? []).length >= MIN_PHONE_DIGITS
}

