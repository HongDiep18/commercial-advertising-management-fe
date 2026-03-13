import { clearSessionAndRedirectToLogin } from "@/lib/session"
import { AUTH_TOKEN_KEY } from "@/lib/storage-keys"

const PROXY_PREFIX = "/api/proxy"

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
    console.log("url", url)
    const res = await fetch(url, {
      ...init,
      headers: rawHeaders,
      ...(body !== undefined && {
        body: isFormData ? (body as FormData) : JSON.stringify(body),
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      const isAuthPublicPath =
        path.startsWith("/auth/login") ||
        path.startsWith("/auth/register") ||
        path.startsWith("/auth/forgot-password") ||
        path.startsWith("/auth/set-password")
      if (res.status === 401 && typeof window !== "undefined" && !isAuthPublicPath) {
        const reason = (data as { message?: string; code?: string }).message
          ?.toLowerCase()
          .includes("disabled")
          ? "disabled"
          : undefined
        clearSessionAndRedirectToLogin(reason ?? "unauthorized")
      }
      if (typeof window !== "undefined") {
        console.error("[API Error]", {
          url,
          status: res.status,
          statusText: res.statusText,
          data,
        })
      }
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
}
