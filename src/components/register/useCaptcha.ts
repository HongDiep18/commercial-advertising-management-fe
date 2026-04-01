import { useState, useRef, useCallback, useEffect } from "react"
import { api } from "@/lib/api"

type CaptchaChallengeResponse = {
  captchaId?: string
  captchaText?: string
  expiresInMs?: number
}
type CaptchaRefreshResult = "ok" | "failed" | "rate_limited"

function drawCaptchaOnCanvas(canvas: HTMLCanvasElement | null, text: string): void {
  if (!canvas) return
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)
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

function getCaptchaChallengePath(): string {
  const value = process.env.NEXT_PUBLIC_REGISTER_CAPTCHA_PATH?.trim()
  return value && value.startsWith("/") ? value : "/auth/captcha"
}

function isRateLimitedError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false
  const e = err as { status?: number; data?: { statusCode?: number } }
  return e.status === 429 || e.data?.statusCode === 429
}

export function useCaptcha() {
  const [input, setInput] = useState("")
  const [captchaId, setCaptchaId] = useState<string | null>(null)
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
      const payload = await api.request<CaptchaChallengeResponse>(getCaptchaChallengePath(), {
        method: "GET",
      })
      const nextCaptchaId = payload.captchaId?.trim()
      const nextCaptchaText = payload.captchaText?.trim()
      if (!nextCaptchaId || !nextCaptchaText) {
        setLoadFailed(true)
        setCaptchaId(null)
        drawCaptchaOnCanvas(canvasRef.current, "")
        return "failed"
      }
      setCaptchaId(nextCaptchaId)
      drawCaptchaOnCanvas(canvasRef.current, nextCaptchaText)
      return "ok"
    } catch (err) {
      setLoadFailed(true)
      setCaptchaId(null)
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
    canvasRef,
    refresh,
    isValid,
    isLoading,
    loadFailed,
    isRateLimited,
  }
}
