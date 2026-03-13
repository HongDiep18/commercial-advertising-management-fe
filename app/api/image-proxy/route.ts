import { NextRequest } from "next/server"
import sharp from "sharp"

// Block private/internal IP ranges to prevent SSRF attacks
const BLOCKED_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,   // cloud metadata (AWS, GCP, Azure)
  /^::1$/,         // IPv6 loopback
  /^fc00:/i,       // IPv6 private
  /^fe80:/i,       // IPv6 link-local
]

function isBlockedHost(hostname: string): boolean {
  return BLOCKED_PATTERNS.some((pattern) => pattern.test(hostname))
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const url = searchParams.get("url")
  if (!url) return new Response("Missing url", { status: 400 })

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return new Response("Invalid url", { status: 400 })
  }

  if (parsed.protocol !== "https:") {
    return new Response("Only HTTPS URLs are allowed", { status: 403 })
  }

  if (isBlockedHost(parsed.hostname)) {
    return new Response("Domain not allowed", { status: 403 })
  }

  const width = Math.min(Number(searchParams.get("w") ?? "800") || 800, 1200)
  const quality = Math.min(Number(searchParams.get("q") ?? "75") || 75, 100)

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    })
    if (!res.ok) return new Response("Failed to fetch image", { status: 502 })

    const contentType = res.headers.get("Content-Type") ?? ""
    if (!contentType.startsWith("image/")) {
      return new Response("Not an image", { status: 400 })
    }

    const buffer = await res.arrayBuffer()
    const webp = await sharp(Buffer.from(buffer))
      .resize(width, undefined, { withoutEnlargement: true })
      .webp({ quality })
      .toBuffer()

    return new Response(new Uint8Array(webp), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
      },
    })
  } catch {
    return new Response("Failed to fetch image", { status: 502 })
  }
}
