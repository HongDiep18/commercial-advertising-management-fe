import { useState, useRef, useCallback, useEffect } from "react"
import { api } from "@/lib/api"

/** GET /auth/captcha — supports image/SVG from backend or legacy plain text for canvas. */
type CaptchaChallengeResponse = {
  captchaId?: string
  captchaText?: string
  /** Image: data URL, raw base64, or backend-specific field names */
  captchaImage?: string
  captchaSvg?: string
  imageDataUrl?: string
  imageBase64?: string
  imageSvg?: string
  expiresInMs?: number
}

export type CaptchaVisual =
  | { kind: "image"; src: string }
  | { kind: "canvas"; text: string }

type CaptchaRefreshResult = "ok" | "failed" | "rate_limited"

function getCaptchaChallengePath(): string {
  const value = process.env.NEXT_PUBLIC_REGISTER_CAPTCHA_PATH?.trim()
  return value && value.startsWith("/") ? value : "/auth/captcha"
}

function isRateLimitedError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false
  const e = err as { status?: number; data?: { statusCode?: number } }
  return e.status === 429 || e.data?.statusCode === 429
}

/** Normalize API payload to a single displayable image URL (prefer SVG / data URLs). */
function captchaPayloadToImageSrc(payload: CaptchaChallengeResponse): string | null {
  const rawCandidates = [
    payload.captchaImage,
    payload.imageDataUrl,
    payload.captchaSvg,
    payload.imageSvg,
    payload.imageBase64,
  ]
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    .map((s) => s.trim())

  for (const raw of rawCandidates) {
    if (raw.startsWith("data:")) return raw
    if (raw.startsWith("<svg") || raw.includes("<svg")) {
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(raw)}`
    }
    if (/^[A-Za-z0-9+/=\s]+$/.test(raw) && raw.replace(/\s/g, "").length >= 16) {
      return `data:image/png;base64,${raw.replace(/\s/g, "")}`
    }
  }

  return null
}

function buildCaptchaVisual(payload: CaptchaChallengeResponse): CaptchaVisual | null {
  const imageSrc = captchaPayloadToImageSrc(payload)
  if (imageSrc) return { kind: "image", src: imageSrc }

  const text = payload.captchaText?.trim()
  if (text) return { kind: "canvas", text }

  return null
}

function drawCaptchaOnCanvas(canvas: HTMLCanvasElement | null, text: string): void {
  if (!canvas) return
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  if (!text) return

  ctx.fillStyle = "#f3f4f6"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = `rgba(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100}, 0.3)`
    ctx.beginPath()
    ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height)
    ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height)
    ctx.stroke()
  }

  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = `rgba(${Math.random() * 150}, ${Math.random() * 150}, ${Math.random() * 150}, 0.45)`
    ctx.beginPath()
    ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.font = "bold 28px Arial"
  ctx.fillStyle = "#333"
  ctx.textBaseline = "middle"

  for (let i = 0; i < text.length; i++) {
    const x = 14 + i * 22
    const y = canvas.height / 2 + (Math.random() - 0.5) * 8
    const rotation = (Math.random() - 0.5) * 0.35
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rotation)
    ctx.fillText(text[i], 0, 0)
    ctx.restore()
  }
}

export function useCaptcha() {
  const [input, setInput] = useState("")
  const [captchaId, setCaptchaId] = useState<string | null>(null)
  const [visual, setVisual] = useState<CaptchaVisual | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const refresh = useCallback(async (): Promise<CaptchaRefreshResult> => {
    setIsLoading(true)
    setLoadFailed(false)
    setIsRateLimited(false)
    setInput("")
    try {
      const res = await api.request<CaptchaChallengeResponse | { data: CaptchaChallengeResponse }>(
        getCaptchaChallengePath(),
        { method: "GET" }
      )
      const payload =
        res && typeof res === "object" && "data" in res && res.data && typeof res.data === "object"
          ? (res as { data: CaptchaChallengeResponse }).data
          : (res as CaptchaChallengeResponse)
      const nextId = payload.captchaId?.trim()
      const nextVisual = buildCaptchaVisual(payload)

      if (!nextId || !nextVisual) {
        setLoadFailed(true)
        setCaptchaId(null)
        setVisual(null)
        drawCaptchaOnCanvas(canvasRef.current, "")
        return "failed"
      }

      setCaptchaId(nextId)
      setVisual(nextVisual)

      if (nextVisual.kind === "canvas") {
        drawCaptchaOnCanvas(canvasRef.current, nextVisual.text)
      } else {
        drawCaptchaOnCanvas(canvasRef.current, "")
      }
      return "ok"
    } catch (err) {
      setLoadFailed(true)
      setCaptchaId(null)
      setVisual(null)
      drawCaptchaOnCanvas(canvasRef.current, "")
      if (isRateLimitedError(err)) {
        setIsRateLimited(true)
        return "rate_limited"
      }
      return "failed"
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const isValid = input.trim().length > 0

  return {
    input,
    setInput,
    captchaId,
    visual,
    canvasRef,
    refresh,
    isValid,
    isLoading,
    loadFailed,
    isRateLimited,
  }
}
