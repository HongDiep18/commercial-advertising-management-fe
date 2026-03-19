import { format, isValid } from "date-fns"

export function formatDateTimeForLocale(dateStr: string, locale: string): string {
  if (!dateStr?.trim()) return dateStr ?? ""

  const normalized = dateStr.trim().replace(" ", "T")
  const date = new Date(normalized)
  if (!isValid(date)) return dateStr

  const hasTime = /T\d| \d{1,2}:/.test(dateStr.trim())

  if (locale === "zh-TW") {
    return hasTime ? format(date, "yyyy年M月d日 HH:mm") : format(date, "yyyy年M月d日")
  }
  if (locale === "vi-VN") {
    return hasTime ? format(date, "dd/MM/yyyy HH:mm") : format(date, "dd/MM/yyyy")
  }

  return hasTime ? format(date, "MMM d, yyyy 'at' h:mm a") : format(date, "MMM d, yyyy")
}
