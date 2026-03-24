import { NextRequest, NextResponse } from "next/server"
import { getBackendBase } from "../../_utils"

function buildHeaders(request: NextRequest): Record<string, string> {
  const chatbotKey = process.env.CHATBOT_API_KEY ?? ""
  const headers: Record<string, string> = { "x-chatbot-key": chatbotKey }
  const auth = request.headers.get("authorization")
  if (auth) headers["authorization"] = auth
  return headers
}

export async function GET(request: NextRequest) {
  const chatbotKey = process.env.CHATBOT_API_KEY
  if (!chatbotKey) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 })
  }

  const search = request.nextUrl.search
  let res: Response
  try {
    res = await fetch(`${getBackendBase()}/chatbot/session${search}`, {
      method: "GET",
      headers: buildHeaders(request),
    })
  } catch (err) {
    console.error("[Chatbot] session GET failed:", err)
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 })
  }
  const data = await res.json().catch(() => [])
  return NextResponse.json(data, { status: res.status })
}

export async function DELETE(request: NextRequest) {
  const chatbotKey = process.env.CHATBOT_API_KEY
  if (!chatbotKey) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 })
  }

  const body = await request.text()
  let res: Response
  try {
    res = await fetch(`${getBackendBase()}/chatbot/session`, {
      method: "DELETE",
      headers: { ...buildHeaders(request), "Content-Type": "application/json" },
      body,
    })
  } catch (err) {
    console.error("[Chatbot] session DELETE failed:", err)
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 })
  }
  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}
