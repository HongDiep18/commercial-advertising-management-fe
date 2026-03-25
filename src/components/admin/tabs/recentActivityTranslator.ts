import type { RecentActivityItem } from "@/api/recent-activities/types"

type TranslateFn = (key: string, options?: Record<string, unknown>) => string
type Params = Record<string, string>

type ContentRule = {
  action?: string
  includes?: string[]
  contentKey: string
  parse: (activity: RecentActivityItem) => Params
}

const TITLE_KEY_BY_ACTION: Record<string, string> = {
  "ad_order.created": "adOrderCreated",
  "company.updated_by_admin": "companyUpdatedByAdmin",
  "profile_request.submitted": "profileRequestSubmitted",
  "user.password_changed": "userPasswordChanged",
  "auth.set_password_completed": "setPasswordCompleted",
  "loyalty.points_awarded": "loyaltyPointsAwarded",
  "loyalty.tier_recalculated": "loyaltyTierRecalculated",
  "profile_request.approved": "profileRequestApproved",
  "profile_request.status_changed": "profileRequestStatusChanged",
  "user.status_changed": "userStatusChanged",
  "user.soft_deleted": "userSoftDeleted",
}

const TITLE_KEY_BY_TEXT: Record<string, string> = {
  "set password completed": "setPasswordCompleted",
  "profile request submitted": "profileRequestSubmitted",
  "loyalty points awarded": "loyaltyPointsAwarded",
  "loyalty tier recalculated": "loyaltyTierRecalculated",
  "profile request approved": "profileRequestApproved",
  "profile request status changed": "profileRequestStatusChanged",
  "user status changed": "userStatusChanged",
  "user soft deleted": "userSoftDeleted",
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
    action: "ad_order.created",
    contentKey: "adOrderCreated",
    parse: (a) => ({
      orderId:
        extractWithRegex(a.content, /Created ad order\s+([a-zA-Z0-9-]+)\.?$/i) || a.entityId || "-",
    }),
  },
  {
    action: "company.updated_by_admin",
    contentKey: "companyUpdatedByAdmin",
    parse: (a) => ({ target: pick(a.content, /Updated company profile for\s+(.+?)\.?$/i) }),
  },
  {
    action: "profile_request.submitted",
    includes: ["new registration request from"],
    contentKey: "profileRequestSubmitted",
    parse: (a) => ({ target: pick(a.content, /New registration request from\s+(.+?)\.?$/i) }),
  },
  {
    action: "user.password_changed",
    contentKey: "userPasswordChanged",
    parse: (a) => ({ target: pick(a.content, /Password updated for\s+(.+?)\.?$/i) }),
  },
  {
    action: "auth.set_password_completed",
    includes: ["set-password completed for"],
    contentKey: "setPasswordCompleted",
    parse: (a) => ({ target: pick(a.content, /Set-password completed for\s+(.+?)\.?$/i) }),
  },
  {
    action: "loyalty.points_awarded",
    includes: ["points updated to"],
    contentKey: "loyaltyPointsAwarded",
    parse: (a) => ({
      target: pick(a.content, /^(.+?)\s+points updated to\s+([0-9,]+)\.?$/i),
      points: pick(a.content, /^.+?\s+points updated to\s+([0-9,]+)\.?$/i),
    }),
  },
  {
    action: "loyalty.tier_recalculated",
    contentKey: "loyaltyTierRecalculated",
    parse: (a) => ({ target: a.content.trim() || "-" }),
  },
  {
    action: "profile_request.approved",
    includes: ["approved registration for"],
    contentKey: "profileRequestApproved",
    parse: (a) => ({ target: pick(a.content, /Approved registration for\s+(.+?)\.?$/i) }),
  },
  {
    action: "profile_request.status_changed",
    includes: ["changed from", " to "],
    contentKey: "profileRequestStatusChanged",
    parse: (a) => parseStatusChange(a.content),
  },
  {
    action: "user.status_changed",
    includes: [" was enabled", " was disabled"],
    contentKey: "userStatusChanged",
    parse: (a) => ({
      target: pick(a.content, /^(.+?)\s+was\s+(enabled|disabled)\.?$/i),
      status: pick(a.content, /^.+?\s+was\s+(enabled|disabled)\.?$/i),
    }),
  },
  {
    action: "user.soft_deleted",
    includes: ["was soft deleted"],
    contentKey: "userSoftDeleted",
    parse: (a) => ({ target: pick(a.content, /^(.+?)\s+was soft deleted\.?$/i) }),
  },
]

function matchesIncludes(rule: ContentRule, normalizedContent: string): boolean {
  return (rule.includes ?? []).every((needle) => normalizedContent.includes(needle))
}

function translateContent(t: TranslateFn, activity: RecentActivityItem): string {
  const normalizedContent = activity.content.trim().toLowerCase()
  const matched =
    CONTENT_RULES.find((rule) => rule.action === activity.action) ??
    CONTENT_RULES.find((rule) => rule.includes && matchesIncludes(rule, normalizedContent))

  if (!matched) return activity.content
  return t(
    `admin.dashboard.recentActivityLogs.contents.${matched.contentKey}`,
    matched.parse(activity)
  )
}

export function translateRecentActivity(
  t: TranslateFn,
  activity: RecentActivityItem
): { title: string; content: string } {
  const normalizedTitle = activity.title.trim().toLowerCase()
  const titleKey = TITLE_KEY_BY_ACTION[activity.action] ?? TITLE_KEY_BY_TEXT[normalizedTitle]
  const title = titleKey
    ? t(`admin.dashboard.recentActivityLogs.actions.${titleKey}`, { defaultValue: activity.title })
    : activity.title

  return { title, content: translateContent(t, activity) }
}
