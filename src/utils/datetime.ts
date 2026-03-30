import { format, isSameDay, isValid } from "date-fns"
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

export function formatRecentDateTimeForLocale(dateStr: string, locale: string): string {
  if (!dateStr?.trim()) return dateStr ?? ""

  const normalized = dateStr.trim().replace(" ", "T")
  const date = new Date(normalized)
  if (!isValid(date)) return dateStr

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()

  if (diffMs < 0 || diffMs >= 24 * 60 * 60 * 1000) {
    return formatDateTimeForLocale(dateStr, locale)
  }

  if (isSameDay(date, now)) {
    return getTodayLabel(locale, date)
  }

  return formatRelativeTime(diffMs, locale)
}

function getDateFnsLocale(locale: string): Locale {
  const localeMap: Record<string, Locale> = {
    "zh-TW": zhTW,
    "vi-VN": vi,
    "en-US": enUS,
  }

  return localeMap[locale] ?? enUS
}

function formatRelativeTime(diffMs: number, locale: string): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })
  const diffMinutes = Math.max(1, Math.round(diffMs / (60 * 1000)))

  if (diffMinutes < 60) {
    return rtf.format(-diffMinutes, "minute")
  }

  const diffHours = Math.max(1, Math.round(diffMs / (60 * 60 * 1000)))
  return rtf.format(-diffHours, "hour")
}

function getTodayLabel(locale: string, date: Date): string {
  const timeLabel = formatTimeForLocale(date, locale)

  if (locale === "zh-TW") return `今天 ${timeLabel}`
  if (locale === "vi-VN") return `Hôm nay lúc ${timeLabel}`
  return `Today at ${timeLabel}`
}

function formatTimeForLocale(date: Date, locale: string): string {
  if (locale === "zh-TW") {
    return new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date)
  }

  if (locale === "vi-VN") {
    return new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date)
  }

  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date)
}
