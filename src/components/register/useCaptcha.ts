import { useState, useRef, useCallback, useEffect } from 'react'

const CAPTCHA_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const CAPTCHA_LENGTH = 5

function generateCode(): string {
  let code = ''
  for (let i = 0; i < CAPTCHA_LENGTH; i++) {
    code += CAPTCHA_CHARS.charAt(Math.floor(Math.random() * CAPTCHA_CHARS.length))
  }
  return code
}

function drawCaptchaOnCanvas(canvas: HTMLCanvasElement | null, text: string): void {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.fillStyle = '#f3f4f6'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = `rgba(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100}, 0.3)`
    ctx.beginPath()
    ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height)
    ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height)
    ctx.stroke()
  }

  for (let i = 0; i < 50; i++) {
    ctx.fillStyle = `rgba(${Math.random() * 150}, ${Math.random() * 150}, ${Math.random() * 150}, 0.5)`
    ctx.beginPath()
    ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.font = 'bold 28px Arial'
  ctx.fillStyle = '#333'
  ctx.textBaseline = 'middle'

  for (let i = 0; i < text.length; i++) {
    const x = 15 + i * 22
    const y = canvas.height / 2 + (Math.random() - 0.5) * 10
    const rotation = (Math.random() - 0.5) * 0.4
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rotation)
    ctx.fillText(text[i], 0, 0)
    ctx.restore()
  }
}

export function useCaptcha() {
  const [code, setCode] = useState('')
  const [input, setInput] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const refresh = useCallback(() => {
    const newCode = generateCode()
    setCode(newCode)
    setInput('')
    setTimeout(() => drawCaptchaOnCanvas(canvasRef.current, newCode), 0)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const isValid = input.toUpperCase() === code

  return { code, input, setInput, canvasRef, refresh, isValid }
}
