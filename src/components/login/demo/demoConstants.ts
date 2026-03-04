export const DEMO_ACCOUNTS: Array<{ tier: string; email: string; password: string }> = [
  { tier: "bronze", email: "bronze@example.com", password: "demo123" },
  { tier: "silver", email: "silver@example.com", password: "demo123" },
  { tier: "gold", email: "gold@example.com", password: "demo123" },
  { tier: "diamond", email: "diamond@example.com", password: "demo123" },
  { tier: "admin", email: "admin@example.com", password: "demo123" },
]

export const DEMO_TITLE_FALLBACKS: Record<string, string> = {
  bronze: "銅牌會員",
  silver: "銀牌會員",
  gold: "金牌會員",
  diamond: "鑽石會員",
  admin: "管理員",
}
