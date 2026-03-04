export const LOGIN_TAGS = {
  success: "login.success",
  failed: "login.errors.failed",
  processing: "login.processing",
} as const

export const LOGIN_TAG_FALLBACKS: Record<keyof typeof LOGIN_TAGS, string> = {
  success: "登入成功！",
  failed: "登入失敗，請檢查您的帳號密碼",
  processing: "登入中...",
}
