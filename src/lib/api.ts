const API_BASE =
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE_URL
    ? process.env.NEXT_PUBLIC_API_BASE_URL
    : 'http://localhost:3001'

export const api = {
  base: API_BASE.replace(/\/$/, ''),
  async request<T>(
    path: string,
    options: Omit<RequestInit, 'body'> & { body?: object } = {}
  ): Promise<T> {
    const { body, ...init } = options
    const url = `${this.base}${path.startsWith('/') ? path : `/${path}`}`
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(init.headers as Record<string, string>),
    }
    const res = await fetch(url, {
      ...init,
      headers,
      ...(body !== undefined && { body: JSON.stringify(body) }),
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
