import { AUTH_TOKEN_KEY, USER_STORAGE_KEY } from "./storage-keys"

export async function clearSessionAndRedirectToLogin(reason?: string): Promise<void> {
  if (typeof window === "undefined") return

  // Clear access token from localStorage
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(USER_STORAGE_KEY)

  // Call backend to clear refresh token cookie
  try {
    await fetch("/api/proxy/auth/logout", {
      method: "POST",
      credentials: "include", // Send cookies with request
    })
  } catch (error) {
    console.error("Logout request failed:", error)
    // Continue with redirect even if logout call fails
  }

  const query = reason ? `?reason=${encodeURIComponent(reason)}` : ""
  window.location.href = `/login${query}`
}
