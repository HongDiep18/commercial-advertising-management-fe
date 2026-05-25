import { NextRequest, NextResponse } from "next/server"

const getBackendBase = () =>
  (process.env.API_BASE_URL ?? "").replace(/\/$/, "") +
  (process.env.API_BASE_PATH ?? "/api/v1").replace(/^\//, "/")

const FORWARD_HEADERS = ["authorization", "content-type", "cookie"] as const

export async function GET(request: NextRequest) {
  return forward(request)
}
export async function POST(request: NextRequest) {
  return forward(request)
}
export async function PATCH(request: NextRequest) {
  return forward(request)
}
export async function PUT(request: NextRequest) {
  return forward(request)
}
export async function DELETE(request: NextRequest) {
  return forward(request)
}

async function forward(request: NextRequest) {
  const path = (request.nextUrl.pathname.match(/^\/api\/proxy(?:\/(.*))?$/)?.[1] ?? "").replace(
    /^\/+/,
    ""
  )
  const backendUrl = `${getBackendBase()}/${path}${request.nextUrl.search}`

  const headers: Record<string, string> = {}
  FORWARD_HEADERS.forEach((h) => {
    const v = request.headers.get(h)
    if (v) headers[h] = v
  })

  const hasBody = !["GET", "HEAD"].includes(request.method)
  const fetchOpts: RequestInit = {
    method: request.method,
    headers: Object.keys(headers).length ? headers : undefined,
    body: hasBody ? request.body : undefined,
  }
  if (hasBody && fetchOpts.body) (fetchOpts as RequestInit & { duplex?: string }).duplex = "half"

  const res = await fetch(backendUrl, fetchOpts)

  const contentType = res.headers.get("content-type") ?? ""
  const isJson =
    contentType.includes("application/json") || contentType.includes("+json")

  const setCookie = res.headers.get("set-cookie")

  if (!isJson) {
    const buffer = await res.arrayBuffer()
    const response = new NextResponse(buffer, { status: res.status })
    if (contentType) response.headers.set("content-type", contentType)
    const disposition = res.headers.get("content-disposition")
    if (disposition) response.headers.set("content-disposition", disposition)
    if (setCookie) response.headers.set("set-cookie", setCookie)
    return response
  }

  const data = await res.json().catch(() => ({}))
  const response = NextResponse.json(data, { status: res.status })
  if (setCookie) {
    response.headers.set("set-cookie", setCookie)
  }

  return response
}
