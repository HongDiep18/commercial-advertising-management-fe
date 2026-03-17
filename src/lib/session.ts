import { AUTH_TOKEN_KEY, USER_STORAGE_KEY } from "./storage-keys"

export function clearSessionAndRedirectToLogin(reason?: string): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(USER_STORAGE_KEY)
  const query = reason ? `?reason=${encodeURIComponent(reason)}` : ""
  window.location.href = `/login${query}`
}
