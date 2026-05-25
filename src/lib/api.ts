import { clearSessionAndRedirectToLogin } from "@/lib/session"
import { AUTH_TOKEN_KEY } from "@/lib/storage-keys"

const PROXY_PREFIX = "/api/proxy"

// Track if we're currently refreshing to avoid multiple simultaneous refreshes
let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

function onRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token))
  refreshSubscribers = []
}

function addRefreshSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback)
}

function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {}
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}

const base = PROXY_PREFIX

export const api = {
  base,
  async request<T>(
    path: string,
    options: Omit<RequestInit, "body"> & { body?: object | FormData } = {}
  ): Promise<T> {
    const { body, ...init } = options
    const url = `${this.base}${path.startsWith("/") ? path : `/${path}`}`
    const isFormData = body instanceof FormData
    const rawHeaders = { ...getAuthHeader(), ...(init.headers as Record<string, string>) }

    if (isFormData) {
      delete rawHeaders["Content-Type"]
      delete rawHeaders["content-type"]
    } else {
      rawHeaders["Content-Type"] = "application/json"
    }

    const makeRequest = async (headers: Record<string, string>) => {
      return fetch(url, {
        ...init,
        credentials: "include", // ✅ Send cookies with requests (per protect.md line 170)
        headers,
        ...(body !== undefined && {
          body: isFormData ? (body as FormData) : JSON.stringify(body),
        }),
      })
    }

    let res = await makeRequest(rawHeaders)
    let data = await res.json().catch(() => ({}))

    // Handle 401 - try to refresh token (per protect.md lines 177-183)
    if (res.status === 401) {
      const isAuthPublicPath =
        path.startsWith("/auth/login") ||
        path.startsWith("/auth/register") ||
        path.startsWith("/auth/forgot-password") ||
        path.startsWith("/auth/set-password") ||
        path.startsWith("/auth/refresh")

      if (!isAuthPublicPath && typeof window !== "undefined") {
        // Try to refresh token
        if (!isRefreshing) {
          isRefreshing = true

          try {
            const refreshRes = await fetch(`${this.base}/auth/refresh`, {
              method: "POST",
              credentials: "include", // Send refresh token cookie
            })

            if (refreshRes.ok) {
              const refreshData = await refreshRes.json()
              const newToken = refreshData.accessToken

              // Store new access token
              localStorage.setItem(AUTH_TOKEN_KEY, newToken)

              // Notify all waiting requests
              onRefreshed(newToken)

              // Retry original request with new token
              const newHeaders = { ...rawHeaders, Authorization: `Bearer ${newToken}` }
              res = await makeRequest(newHeaders)
              data = await res.json().catch(() => ({}))

              if (res.ok) {
                isRefreshing = false
                return data as T
              }
            }
          } catch (error) {
            console.error("[Token Refresh Failed]", error)
          }

          isRefreshing = false
          refreshSubscribers = []

          // Refresh failed - logout
          const reason = (data as { message?: string; code?: string }).message
            ?.toLowerCase()
            .includes("disabled")
            ? "disabled"
            : "session_expired"
          clearSessionAndRedirectToLogin(reason)
          throw new Error("Session expired")
        } else {
          // Another request is refreshing - wait for it
          return new Promise<T>((resolve, reject) => {
            addRefreshSubscriber(async (newToken: string) => {
              try {
                const newHeaders = { ...rawHeaders, Authorization: `Bearer ${newToken}` }
                const retryRes = await makeRequest(newHeaders)
                const retryData = await retryRes.json().catch(() => ({}))

                if (retryRes.ok) {
                  resolve(retryData as T)
                } else {
                  reject(
                    new Error((retryData as { message?: string }).message ?? retryRes.statusText)
                  )
                }
              } catch (error) {
                reject(error)
              }
            })
          })
        }
      } else {
        // Public path or refresh failed - don't retry
        const reason = (data as { message?: string; code?: string }).message
          ?.toLowerCase()
          .includes("disabled")
          ? "disabled"
          : "unauthorized"
        if (!isAuthPublicPath) {
          clearSessionAndRedirectToLogin(reason)
        }
      }
    }

    if (!res.ok) {
      const err = new Error((data as { message?: string }).message ?? res.statusText) as Error & {
        status: number
        data: unknown
      }
      err.status = res.status
      err.data = data
      throw err
    }

    return data as T
  },

  async requestBlob(
    path: string,
    options: Omit<RequestInit, "body"> = {}
  ): Promise<{ blob: Blob; filename: string }> {
    const url = `${this.base}${path.startsWith("/") ? path : `/${path}`}`
    const rawHeaders = { ...getAuthHeader(), ...(options.headers as Record<string, string>) }

    const makeRequest = async (headers: Record<string, string>) =>
      fetch(url, {
        ...options,
        credentials: "include",
        headers,
      })

    const throwApiError = async (res: Response) => {
      const contentType = res.headers.get("content-type") ?? ""
      let data: unknown = {}
      let message = res.statusText

      if (contentType.includes("json")) {
        data = await res.json().catch(() => ({}))
      } else {
        const text = await res.text().catch(() => "")
        if (text) {
          try {
            data = JSON.parse(text) as unknown
          } catch {
            data = { message: text }
          }
        }
      }

      message = (data as { message?: string }).message ?? message
      const err = new Error(message) as Error & { status: number; data: unknown }
      err.status = res.status
      err.data = data
      throw err
    }

    let res = await makeRequest(rawHeaders)

    if (res.status === 401) {
      const isAuthPublicPath =
        path.startsWith("/auth/login") ||
        path.startsWith("/auth/register") ||
        path.startsWith("/auth/forgot-password") ||
        path.startsWith("/auth/set-password") ||
        path.startsWith("/auth/refresh")

      if (!isAuthPublicPath && typeof window !== "undefined") {
        if (!isRefreshing) {
          isRefreshing = true
          try {
            const refreshRes = await fetch(`${this.base}/auth/refresh`, {
              method: "POST",
              credentials: "include",
            })
            if (refreshRes.ok) {
              const refreshData = await refreshRes.json()
              const newToken = refreshData.accessToken as string
              localStorage.setItem(AUTH_TOKEN_KEY, newToken)
              onRefreshed(newToken)
              const newHeaders = { ...rawHeaders, Authorization: `Bearer ${newToken}` }
              res = await makeRequest(newHeaders)
              if (res.ok) {
                isRefreshing = false
                const blob = await res.blob()
                const okContentType = res.headers.get("content-type") ?? ""
                const okDefaultFilename = okContentType.includes("csv")
                  ? "companies-export.csv"
                  : "companies-export.xlsx"
                const filename =
                  parseFilenameFromContentDisposition(res.headers.get("Content-Disposition")) ??
                  okDefaultFilename
                return { blob, filename }
              }
            }
          } catch (error) {
            console.error("[Token Refresh Failed]", error)
          }
          isRefreshing = false
          refreshSubscribers = []
          clearSessionAndRedirectToLogin("session_expired")
          throw new Error("Session expired")
        }

        return new Promise<{ blob: Blob; filename: string }>((resolve, reject) => {
          addRefreshSubscriber(async (newToken: string) => {
            try {
              const newHeaders = { ...rawHeaders, Authorization: `Bearer ${newToken}` }
              const retryRes = await makeRequest(newHeaders)
              if (retryRes.ok) {
                const blob = await retryRes.blob()
                const retryContentType = retryRes.headers.get("content-type") ?? ""
                const retryDefaultFilename = retryContentType.includes("csv")
                  ? "companies-export.csv"
                  : "companies-export.xlsx"
                const filename =
                  parseFilenameFromContentDisposition(
                    retryRes.headers.get("Content-Disposition")
                  ) ?? retryDefaultFilename
                resolve({ blob, filename })
              } else {
                try {
                  await throwApiError(retryRes)
                } catch (error) {
                  reject(error)
                }
              }
            } catch (error) {
              reject(error)
            }
          })
        })
      } else if (!isAuthPublicPath) {
        clearSessionAndRedirectToLogin("unauthorized")
      }
    }

    if (!res.ok) {
      await throwApiError(res)
    }

    const blob = await res.blob()
    const contentType = res.headers.get("content-type") ?? ""
    const defaultFilename = contentType.includes("csv")
      ? "companies-export.csv"
      : "companies-export.xlsx"
    const filename =
      parseFilenameFromContentDisposition(res.headers.get("Content-Disposition")) ??
      defaultFilename
    return { blob, filename }
  },
}

function parseFilenameFromContentDisposition(header: string | null): string | undefined {
  if (!header) return undefined
  const utf8Match = /filename\*=UTF-8''([^;\s]+)/i.exec(header)
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].replace(/"/g, ""))
    } catch {
      return utf8Match[1]
    }
  }
  const quoted = /filename="([^"]+)"/i.exec(header)
  if (quoted?.[1]) return quoted[1]
  const plain = /filename=([^;\s]+)/i.exec(header)
  if (plain?.[1]) return plain[1].replace(/"/g, "")
  return undefined
}
