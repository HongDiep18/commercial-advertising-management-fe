import { NextRequest, NextResponse } from "next/server"
import { getBackendBase } from "../../_utils"

export async function POST(request: NextRequest) {
  const chatbotKey = process.env.CHATBOT_API_KEY
  if (!chatbotKey) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 })
  }

  const body = await request.text()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "text/event-stream",
    "x-chatbot-key": chatbotKey,
    "Cache-Control": "no-cache",
  }
  const auth = request.headers.get("authorization")
  if (auth) headers["authorization"] = auth

  let res: Response
  try {
    res = await fetch(`${getBackendBase()}/chatbot/message`, {
      method: "POST",
      headers,
      body,
      // @ts-expect-error — Node.js requires duplex for streaming fetch
      duplex: "half",
    })
  } catch (err) {
    console.error("[Chatbot] fetch failed:", err)
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 })
  }

  if (!res.ok || !res.body) {
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  }

  return new Response(res.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
