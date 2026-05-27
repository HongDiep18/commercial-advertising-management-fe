import type { RecentActivityItem } from "@/api/recent-activities/types"

type TranslateFn = (key: string, options?: Record<string, unknown>) => string
type Params = Record<string, string>

type ContentRule = {
  includes: string[]
  contentKey: string
  parse: (activity: RecentActivityItem) => Params
}

const TITLE_KEY_BY_TEXT: Record<string, string> = {
  "ad order created": "adOrderCreated",
  "ad order approved": "adOrderApproved",
  "active ad created": "activeAdCreated",
  "company updated by admin": "companyUpdatedByAdmin",
  "profile request submitted": "profileRequestSubmitted",
  "profile request approved": "profileRequestApproved",
  "profile request status changed": "profileRequestStatusChanged",
  "user password changed": "userPasswordChanged",
  "set password completed": "setPasswordCompleted",
  "loyalty points awarded": "loyaltyPointsAwarded",
  "loyalty tier recalculated": "loyaltyTierRecalculated",
  "user status changed": "userStatusChanged",
  "user soft deleted": "userSoftDeleted",
}

const DOT_COLOR_BY_TITLE_KEY: Record<string, string> = {
  userSoftDeleted: "bg-red-500",
  profileRequestRejected: "bg-red-500",
  userPasswordChanged: "bg-slate-500",
  setPasswordCompleted: "bg-slate-500",
  userStatusChanged: "bg-blue-500",
  profileRequestSubmitted: "bg-amber-500",
  profileRequestApproved: "bg-green-500",
  profileRequestStatusChanged: "bg-amber-500",
  loyaltyPointsAwarded: "bg-emerald-500",
  loyaltyTierRecalculated: "bg-teal-500",
  adOrderApproved: "bg-violet-500",
  adOrderCreated: "bg-purple-500",
  activeAdCreated: "bg-indigo-500",
  companyUpdatedByAdmin: "bg-orange-500",
}

function extractWithRegex(input: string, pattern: RegExp): string | null {
  const m = input.match(pattern)
  return m?.[1]?.trim() || null
}

function pick(input: string, pattern: RegExp): string {
  return extractWithRegex(input, pattern) || "-"
}

function parseStatusChange(content: string): Params {
  return {
    target: pick(content, /^(.+?)\s*-\s*changed from\s+(.+?)\s+to\s+(.+?)\.?$/i),
    fromStatus: pick(content, /^.+?\s*-\s*changed from\s+(.+?)\s+to\s+(.+?)\.?$/i),
    toStatus: pick(content, /^.+?\s*-\s*changed from\s+.+?\s+to\s+(.+?)\.?$/i),
  }
}

const CONTENT_RULES: ContentRule[] = [
  {
    includes: ["created ad order"],
    contentKey: "adOrderCreated",
    parse: (a) => ({
      orderId: extractWithRegex(a.content, /Created ad order\s+([a-zA-Z0-9-]+)\.?$/i) ?? "-",
    }),
  },
  {
    includes: ["updated company profile for"],
    contentKey: "companyUpdatedByAdmin",
    parse: (a) => ({ target: pick(a.content, /Updated company profile for\s+(.+?)\.?$/i) }),
  },
  {
    includes: ["new registration request from"],
    contentKey: "profileRequestSubmitted",
    parse: (a) => ({ target: pick(a.content, /New registration request from\s+(.+?)\.?$/i) }),
  },
  {
    includes: ["password updated for"],
    contentKey: "userPasswordChanged",
    parse: (a) => ({ target: pick(a.content, /Password updated for\s+(.+?)\.?$/i) }),
  },
  {
    includes: ["set-password completed for"],
    contentKey: "setPasswordCompleted",
    parse: (a) => ({ target: pick(a.content, /Set-password completed for\s+(.+?)\.?$/i) }),
  },
  {
    includes: ["points updated to"],
    contentKey: "loyaltyPointsAwarded",
    parse: (a) => ({
      target: pick(a.content, /^(.+?)\s+points updated to\s+([0-9,]+)\.?$/i),
      points: pick(a.content, /^.+?\s+points updated to\s+([0-9,]+)\.?$/i),
    }),
  },
  {
    includes: ["approved registration for"],
    contentKey: "profileRequestApproved",
    parse: (a) => ({ target: pick(a.content, /Approved registration for\s+(.+?)\.?$/i) }),
  },
  {
    includes: ["changed from", " to "],
    contentKey: "profileRequestStatusChanged",
    parse: (a) => parseStatusChange(a.content),
  },
  {
    includes: [" was enabled"],
    contentKey: "userStatusChanged",
    parse: (a) => ({
      target: pick(a.content, /^(.+?)\s+was\s+(enabled|disabled)\.?$/i),
      status: pick(a.content, /^.+?\s+was\s+(enabled|disabled)\.?$/i),
    }),
  },
  {
    includes: [" was disabled"],
    contentKey: "userStatusChanged",
    parse: (a) => ({
      target: pick(a.content, /^(.+?)\s+was\s+(enabled|disabled)\.?$/i),
      status: pick(a.content, /^.+?\s+was\s+(enabled|disabled)\.?$/i),
    }),
  },
  {
    includes: ["was soft deleted"],
    contentKey: "userSoftDeleted",
    parse: (a) => ({ target: pick(a.content, /^(.+?)\s+was soft deleted\.?$/i) }),
  },
]

function translateContent(t: TranslateFn, activity: RecentActivityItem): string {
  const normalizedContent = activity.content.trim().toLowerCase()
  const matched = CONTENT_RULES.find((rule) =>
    rule.includes.every((needle) => normalizedContent.includes(needle))
  )
  if (!matched) return activity.content
  return t(
    `admin.dashboard.recentActivityLogs.contents.${matched.contentKey}`,
    matched.parse(activity)
  )
}

export function resolveRecentActivityTitleKey(activity: RecentActivityItem): string | undefined {
  const normalizedTitle = activity.title.trim().toLowerCase()
  let titleKey = TITLE_KEY_BY_TEXT[normalizedTitle]

  if (normalizedTitle === "profile request status changed") {
    const parsed = parseStatusChange(activity.content)
    if (parsed.toStatus?.trim().toUpperCase() === "REJECTED") {
      titleKey = "profileRequestRejected"
    }
  }

  return titleKey
}

export function getRecentActivityDotColor(activity: RecentActivityItem): string {
  const titleKey = resolveRecentActivityTitleKey(activity)
  return (titleKey && DOT_COLOR_BY_TITLE_KEY[titleKey]) ?? "bg-primary"
}

export function translateRecentActivity(
  t: TranslateFn,
  activity: RecentActivityItem
): { title: string; content: string } {
  const titleKey = resolveRecentActivityTitleKey(activity)

  const title = titleKey
    ? t(`admin.dashboard.recentActivityLogs.actions.${titleKey}`, {
        defaultValue: activity.title,
      })
    : activity.title

  return { title, content: translateContent(t, activity) }
}
