const HOST =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_BASE_URL
    ? process.env.NEXT_PUBLIC_API_BASE_URL
    : "http://localhost:3001"
const API_BASE =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_BASE
    ? process.env.NEXT_PUBLIC_API_BASE
    : "/api/v1"

function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {}
  const token = localStorage.getItem("token")
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}

const base = `${HOST.replace(/\/$/, "")}${API_BASE.startsWith("/") ? API_BASE : `/${API_BASE}`}`

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
    const res = await fetch(url, {
      ...init,
      headers: rawHeaders,
      ...(body !== undefined && {
        body: isFormData ? (body as FormData) : JSON.stringify(body),
      }),
    })
    const data = await res.json().catch(() => ({}))
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
}
