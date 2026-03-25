import { format, isValid } from "date-fns"
import { enUS, vi, zhTW, type Locale } from "date-fns/locale"

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

export function formatDate(dateStr: string, locale: string): string {
  if (!dateStr?.trim()) return dateStr ?? ""

  const normalized = dateStr.trim().replace(" ", "T")
  const date = new Date(normalized)
  if (!isValid(date)) return dateStr

  if (locale === "zh-TW") {
    return format(date, "yyyy年M月d日", { locale: getDateFnsLocale(locale) })
  }

  if (locale === "vi-VN") {
    return format(date, "dd/MM/yyyy", { locale: getDateFnsLocale(locale) })
  }

  return format(date, "MMM d, yyyy", { locale: getDateFnsLocale(locale) })
}

function getDateFnsLocale(locale: string): Locale {
  const localeMap: Record<string, Locale> = {
    "zh-TW": zhTW,
    "vi-VN": vi,
    "en-US": enUS,
  }

  return localeMap[locale] ?? enUS
}