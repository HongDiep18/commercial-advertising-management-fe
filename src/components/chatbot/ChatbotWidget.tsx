"use client"

import { AUTH_TOKEN_KEY } from "@/lib/storage-keys"
import { useUser } from "@/contexts/user-context"
import { Bot, MessageCircle, Send, X, RotateCcw, Copy, Check, Zap } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import ReactMarkdown from "react-markdown"

const GUEST_ID_KEY = "chatbot_guest_id"
const TOOLTIP_SEEN_KEY = "chatbot_tooltip_seen"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: string
  isGreeting?: boolean
}

function getOrCreateGuestId(): string {
  if (typeof window === "undefined") return ""
  let id = localStorage.getItem(GUEST_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(GUEST_ID_KEY, id)
  }
  return id
}

export default function ChatbotWidget() {
  const { t, i18n } = useTranslation()
  const { isLoggedIn } = useUser()

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [pingActive, setPingActive] = useState(true)
  const [showBadge, setShowBadge] = useState(true)
  const [isWiggling, setIsWiggling] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const openRef = useRef(false)

  const allQuickQuestions = [
    t("chatbot.quickQ1"),
    t("chatbot.quickQ2"),
    t("chatbot.quickQ3"),
    t("chatbot.quickQ4"),
    t("chatbot.quickQ5"),
    t("chatbot.quickQ6"),
    t("chatbot.quickQ7"),
    t("chatbot.quickQ8"),
    t("chatbot.quickQ9"),
  ]

  // Pick 5 random questions — re-randomise each time the panel opens or language changes
  const quickQuestions = useMemo(() => {
    const shuffled = [...allQuickQuestions].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 5)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, i18n.language])

  // Entrance: slide up after first paint
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(t)
  }, [])

  // Tooltip: appear after 3.5s (once per session); ping stops after 10s
  useEffect(() => {
    const alreadySeen = sessionStorage.getItem(TOOLTIP_SEEN_KEY)
    const tooltipTimer = setTimeout(() => {
      if (!alreadySeen) setShowTooltip(true)
    }, 3500)
    const pingTimer = setTimeout(() => setPingActive(false), 10000)
    return () => {
      clearTimeout(tooltipTimer)
      clearTimeout(pingTimer)
    }
  }, [])

  // Keep openRef in sync so wiggle interval can read it without re-registering
  useEffect(() => { openRef.current = open }, [open])

  // Close tooltip, badge and stop ping when chat opens
  useEffect(() => {
    if (open) {
      setShowTooltip(false)
      setPingActive(false)
      setShowBadge(false)
      sessionStorage.setItem(TOOLTIP_SEEN_KEY, "1")
    }
  }, [open])

  // Micro-wiggle every 15s, stops after 3 cycles
  useEffect(() => {
    let cycles = 0
    const interval = setInterval(() => {
      if (openRef.current || cycles >= 3) {
        clearInterval(interval)
        return
      }
      setIsWiggling(true)
      setTimeout(() => setIsWiggling(false), 700)
      cycles++
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  // Load session history on first open
  useEffect(() => {
    if (!open || historyLoaded) return
    loadHistory()
  }, [open])

  // Reload session when auth state changes (e.g. user logs in mid-session)
  useEffect(() => {
    if (!historyLoaded) return
    if (streaming) abortRef.current?.abort()
    setHistoryLoaded(false)
    setMessages([])
    setError(null)
    setInput("")
    // If panel is open, load the new session immediately; otherwise it loads on next open
    if (open) loadHistory()
  }, [isLoggedIn])

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  function getAuthToken(): string | null {
    if (!isLoggedIn || typeof window === "undefined") return null
    return localStorage.getItem(AUTH_TOKEN_KEY)
  }

  function getHeaders(): Record<string, string> {
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    const token = getAuthToken()
    if (token) headers["Authorization"] = `Bearer ${token}`
    return headers
  }

  // True when we have no valid auth token and must identify as a guest
  function isGuest(): boolean {
    return !getAuthToken()
  }

  async function loadHistory() {
    try {
      const params = new URLSearchParams()
      if (isGuest()) params.set("guestId", getOrCreateGuestId())
      const res = await fetch(`/api/chatbot/session?${params}`, { headers: getHeaders() })
      if (res.ok) {
        const data: Message[] = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          setMessages(data)
        } else {
          setMessages([{ role: "assistant", content: "", isGreeting: true, timestamp: new Date().toISOString() }])
        }
      } else {
        setMessages([{ role: "assistant", content: "", isGreeting: true, timestamp: new Date().toISOString() }])
      }
    } catch {
      setMessages([{ role: "assistant", content: "", isGreeting: true, timestamp: new Date().toISOString() }])
    } finally {
      setHistoryLoaded(true)
    }
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || streaming || trimmed.length > 200) return

    setError(null)
    setInput("")
    setMessages((prev) => [
      ...prev,
      { role: "user", content: trimmed, timestamp: new Date().toISOString() },
      { role: "assistant", content: "", timestamp: new Date().toISOString() },
    ])
    setStreaming(true)

    const body: Record<string, string> = { message: trimmed }
    if (isGuest()) body.guestId = getOrCreateGuestId()

    abortRef.current = new AbortController()

    try {
      const res = await fetch("/api/chatbot/message", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(body),
        signal: abortRef.current.signal,
      })

      if (res.status === 429) {
        const retryAfter = res.headers.get("Retry-After")
        setMessages((prev) => prev.slice(0, -1))
        setError(t("chatbot.errorRateLimit") + (retryAfter ? ` (${retryAfter}s)` : ""))
        return
      }
      if (!res.ok) {
        setMessages((prev) => prev.slice(0, -1))
        setError(t("chatbot.errorGeneric"))
        return
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let tokenCount = 0
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""

        for (const line of lines) {
          if (!line.startsWith("data:")) continue
          const raw = line.slice(5).trim()
          if (raw === "[DONE]") {
            if (tokenCount === 0) {
              setMessages((prev) => prev.slice(0, -1))
              setError(t("chatbot.errorEmpty"))
            }
            return
          }
          try {
            const parsed = JSON.parse(raw)
            if (parsed.error) {
              setMessages((prev) => prev.slice(0, -1))
              setError(parsed.error)
              return
            }
            if (parsed.token) {
              tokenCount++
              setMessages((prev) => {
                const updated = [...prev]
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: updated[updated.length - 1].content + parsed.token,
                }
                return updated
              })
            }
          } catch {
            // skip malformed line
          }
        }
      }

      if (tokenCount === 0) {
        setMessages((prev) => prev.slice(0, -1))
        setError(t("chatbot.errorEmpty"))
      }
    } catch (err: unknown) {
      if ((err as Error).name !== "AbortError") {
        setMessages((prev) => prev.slice(0, -1))
        setError(t("chatbot.errorGeneric"))
      }
    } finally {
      setStreaming(false)
      abortRef.current = null
    }
  }

  async function handleNewChat() {
    if (streaming) abortRef.current?.abort()
    try {
      const body: Record<string, string> = {}
      if (isGuest()) body.guestId = getOrCreateGuestId()
      await fetch("/api/chatbot/session", {
        method: "DELETE",
        headers: getHeaders(),
        body: JSON.stringify(body),
      })
    } catch {
      // ignore
    }
    setMessages([{ role: "assistant", content: "", isGreeting: true, timestamp: new Date().toISOString() }])
    setError(null)
    setInput("")
    setStreaming(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  // Active conversation = user has sent at least one message
  const hasConversation = messages.some((m) => m.role === "user")
  const showQuickQuestions = !hasConversation && !streaming

  return (
    <>
      {/* Chat Panel — sits directly above the FAB */}
      {open && (
        <div
          className="fixed right-4 z-50 flex w-[calc(100vw-2rem)] max-w-[380px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
          style={{ bottom: "76px", height: "clamp(420px, 65vh, 680px)", maxHeight: "calc(100vh - 6rem)" }}
        >
          {/* ── Header ── */}
          <div className="bg-primary flex shrink-0 items-center gap-3 px-4 py-3">
            {/* Avatar + online dot */}
            <div className="relative shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <span className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-[#a20519] bg-green-400" />
            </div>
            {/* Title + status */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-white">{t("chatbot.title")}</p>
                <Zap className="h-3.5 w-3.5 text-white/80" />
              </div>
              <p className="text-xs text-white/75">{t("chatbot.subtitle")}</p>
            </div>
            {/* Actions */}
            <button
              onClick={handleNewChat}
              className="rounded-full p-1.5 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
              title={t("chatbot.newChat")}
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-1.5 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* ── Messages — sizes to content; scrolls once conversation grows ── */}
          <div
            className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4"
          >
            {/* Loading skeleton */}
            {!historyLoaded && messages.length === 0 && (
              <div className="flex flex-col gap-3">
                {/* Bot skeleton message */}
                <div className="flex items-end gap-2">
                  <div className="mb-0.5 h-7 w-7 shrink-0 animate-pulse rounded-full bg-gray-200" />
                  <div className="flex flex-col gap-1.5">
                    <div className="h-3 w-48 animate-pulse rounded-full bg-gray-200" />
                    <div className="h-3 w-36 animate-pulse rounded-full bg-gray-200" />
                    <div className="h-3 w-28 animate-pulse rounded-full bg-gray-200" />
                  </div>
                </div>
                {/* User skeleton message */}
                <div className="flex items-end justify-end gap-2">
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="h-3 w-32 animate-pulse rounded-full bg-gray-200" />
                    <div className="h-3 w-20 animate-pulse rounded-full bg-gray-200" />
                  </div>
                </div>
                {/* Bot skeleton message */}
                <div className="flex items-end gap-2">
                  <div className="mb-0.5 h-7 w-7 shrink-0 animate-pulse rounded-full bg-gray-200" />
                  <div className="flex flex-col gap-1.5">
                    <div className="h-3 w-40 animate-pulse rounded-full bg-gray-200" />
                    <div className="h-3 w-52 animate-pulse rounded-full bg-gray-200" />
                  </div>
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className="animate-[messageSlideIn_0.25s_ease-out]">

                {msg.isGreeting ? (
                  <div className="group flex items-end gap-2">
                    <div className="bg-primary mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
                      <Bot className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="border-primary/20 max-w-[88%] rounded-2xl rounded-bl-sm border bg-primary/5 px-3.5 py-2.5 text-sm leading-relaxed text-gray-700">
                      {t("chatbot.greeting")}
                    </div>
                  </div>
                ) : (

                <div
                  className={`group flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="bg-primary mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
                      <Bot className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                  <div className={`relative max-w-[88%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary rounded-br-sm text-white"
                          : "rounded-bl-sm bg-gray-100 text-gray-800"
                      }`}
                    >
                    {msg.role === "assistant" ? (
                      msg.content === "" && streaming && i === messages.length - 1 ? (
                        /* Typing indicator */
                        <span className="flex items-center gap-1 py-0.5">
                          <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                        </span>
                      ) : (
                        <div className="prose prose-sm max-w-none prose-p:my-0 prose-ul:my-1 prose-li:my-0">
                          <ReactMarkdown
                            key={i18n.language}
                            components={{
                              a: ({ href, children }) => (
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary font-medium underline underline-offset-2 hover:opacity-75"
                                >
                                  {children}
                                </a>
                              ),
                            }}
                          >
                            {msg.content || "…"}
                          </ReactMarkdown>
                        </div>
                      )
                    ) : (
                      <span>{msg.content}</span>
                    )}
                    </div>
                    {/* Copy button + timestamp row — fades in on hover */}
                    <div className={`flex items-center gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${msg.role === "user" ? "self-end flex-row-reverse" : "self-start"}`}>
                      {msg.role === "assistant" && msg.content && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(msg.content)
                            setCopiedIndex(i)
                            setTimeout(() => setCopiedIndex(null), 2000)
                          }}
                          className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                        >
                          {copiedIndex === i ? (
                            <><Check className="h-3 w-3 text-green-500" /><span className="text-green-500">Copied</span></>
                          ) : (
                            <><Copy className="h-3 w-3" /><span>Copy</span></>
                          )}
                        </button>
                      )}
                      {msg.timestamp && (
                        <span className="text-[10px] text-gray-400">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                )} {/* end non-greeting branch */}

              </div>
            ))}

            {error && <p className="text-center text-xs text-red-500">{error}</p>}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Suggested replies (shown above input until user sends first message) ── */}
          {showQuickQuestions && (
            <div className="shrink-0 border-t border-gray-100 bg-white px-4 pt-3 pb-2">
              <p className="mb-2 text-[11px] font-medium text-gray-400">{t("chatbot.quickQuestions")}</p>
              <div className="flex flex-wrap gap-1.5">
                {quickQuestions.slice(0, 3).map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="border-primary/40 text-primary hover:bg-primary rounded-full border px-3 py-1.5 text-xs transition-colors hover:text-white"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Input bar ── */}
          {(() => {
            const MAX = 200
            const len = input.length
            const isOver = len > MAX
            const isNear = len >= MAX * 0.85 && !isOver
            return (
              <div className="shrink-0 border-t border-gray-100 bg-white px-5 pt-3 pb-1">
                <div className="flex items-end gap-3">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t("chatbot.placeholder")}
                    disabled={streaming}
                    rows={1}
                    className={`flex-1 resize-none rounded-xl border px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                      isOver
                        ? "border-red-400 bg-red-50 focus:border-red-400 focus:ring-red-200"
                        : isNear
                          ? "border-amber-400 bg-amber-50 focus:border-amber-400 focus:ring-amber-200"
                          : "border-gray-200 bg-gray-50 focus:border-primary/40 focus:ring-primary/20"
                    }`}
                    style={{ maxHeight: "88px", overflowY: "auto" }}
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={streaming || !input.trim() || isOver}
                    className="bg-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-35"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                {/* Character counter — shown when near/over limit */}
                {(isNear || isOver) && (
                  <p className={`mt-1 text-right text-[11px] font-medium ${isOver ? "text-red-500" : "text-amber-500"}`}>
                    {isOver ? t("chatbot.charOver", { over: len - MAX }) : `${len} / ${MAX}`}
                  </p>
                )}
              </div>
            )
          })()}
          {/* ── AI disclaimer ── */}
          <p className="shrink-0 pb-2 text-center text-[10px] text-gray-400">
            {t("chatbot.aiDisclaimer")}
          </p>
        </div>
      )}

      {/* ── Floating toggle button + tooltip ── */}
      <div
        className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-2 transition-all duration-500 ease-out"
        style={{ transform: mounted ? "translateY(0)" : "translateY(80px)", opacity: mounted ? 1 : 0 }}
      >
        {/* Tooltip bubble */}
        {showTooltip && !open && (
          <div className="relative mr-1 w-[min(14rem,calc(100vw-5rem))] animate-[fadeSlideUp_0.3s_ease-out]">
            <div className="rounded-2xl rounded-br-sm bg-white px-4 py-3 shadow-xl ring-1 ring-gray-200">
              <button
                onClick={() => { setShowTooltip(false); sessionStorage.setItem(TOOLTIP_SEEN_KEY, "1") }}
                className="absolute top-2 right-2 rounded-full p-0.5 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3 w-3" />
              </button>
              <p
                className="cursor-pointer pr-4 text-sm leading-snug text-gray-700"
                onClick={() => { setOpen(true); setShowTooltip(false); sessionStorage.setItem(TOOLTIP_SEEN_KEY, "1") }}
              >
                {t("chatbot.tooltipMessage")}
              </p>
            </div>
            {/* Triangle pointer → bottom-right */}
            <div className="absolute right-4 -bottom-2 h-0 w-0 border-t-8 border-r-8 border-t-white border-r-transparent" style={{ filter: "drop-shadow(0 1px 1px rgb(0 0 0 / 0.08))" }} />
          </div>
        )}

        {/* FAB */}
        <div className="relative">
          {!open && pingActive && (
            <span className="bg-primary absolute inset-0 animate-ping rounded-full opacity-40" />
          )}
          <button
            onClick={() => setOpen((v) => !v)}
            className="bg-primary relative flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-transform hover:scale-105 active:scale-95"
            style={isWiggling ? { animation: "wiggle 0.7s ease-in-out" } : undefined}
            aria-label={t("chatbot.title")}
          >
            {open ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <MessageCircle className="h-6 w-6 text-white" />
            )}
          </button>
        </div>
      </div>
    </>
  )
}
