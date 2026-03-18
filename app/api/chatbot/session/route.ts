import { NextRequest, NextResponse } from "next/server"

const getBackendBase = () =>
  (process.env.API_BASE_URL ?? "").replace(/\/$/, "") +
  (process.env.API_BASE_PATH ?? "/api/v1").replace(/^\//, "/")

function buildHeaders(request: NextRequest): Record<string, string> {
  const chatbotKey = process.env.CHATBOT_API_KEY ?? ""
  const headers: Record<string, string> = { "x-chatbot-key": chatbotKey }
  const auth = request.headers.get("authorization")
  if (auth) headers["authorization"] = auth
  return headers
}

export async function GET(request: NextRequest) {
  const search = request.nextUrl.search
  const res = await fetch(`${getBackendBase()}/chatbot/session${search}`, {
    method: "GET",
    headers: buildHeaders(request),
  })
  const data = await res.json().catch(() => [])
  return NextResponse.json(data, { status: res.status })
}

export async function DELETE(request: NextRequest) {
  const body = await request.text()
  const res = await fetch(`${getBackendBase()}/chatbot/session`, {
    method: "DELETE",
    headers: { ...buildHeaders(request), "Content-Type": "application/json" },
    body,
  })
  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}
