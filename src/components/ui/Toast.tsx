"use client"

import { useEffect } from "react"
import { CheckCircle2, XCircle, AlertCircle, X } from "lucide-react"

export type ToastVariant = "success" | "error" | "warning" | "info"

export type ToastProps = {
  message: string
  variant?: ToastVariant
  visible: boolean
  onClose: () => void
  duration?: number
}

const variantStyles: Record<
  ToastVariant,
  { accent: string; border: string; icon: typeof CheckCircle2; iconColor: string }
> = {
  success: {
    accent: "border-l-emerald-500 bg-emerald-50 dark:border-l-emerald-400 dark:bg-emerald-950/90",
    border: "border border-slate-200/80 border-l-4 dark:border-slate-700",
    icon: CheckCircle2,
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  error: {
    accent: "border-l-red-500 bg-red-50 dark:border-l-red-400 dark:bg-red-950/90",
    border: "border border-slate-200/80 border-l-4 dark:border-slate-700",
    icon: XCircle,
    iconColor: "text-red-600 dark:text-red-400",
  },
  warning: {
    accent: "border-l-amber-500 bg-amber-50 dark:border-l-amber-400 dark:bg-amber-950/90",
    border: "border border-slate-200/80 border-l-4 dark:border-slate-700",
    icon: AlertCircle,
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  info: {
    accent: "border-l-sky-500 bg-sky-50 dark:border-l-sky-400 dark:bg-sky-950/90",
    border: "border border-slate-200/80 border-l-4 dark:border-slate-700",
    icon: AlertCircle,
    iconColor: "text-sky-600 dark:text-sky-400",
  },
}

export function Toast({
  message,
  variant = "info",
  visible,
  onClose,
  duration = 3500,
}: ToastProps) {
  const style = variantStyles[variant]
  const Icon = style.icon

  useEffect(() => {
    if (!visible || duration <= 0) return
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [visible, duration, onClose])

  if (!visible) return null

  return (
    <div
      role="alert"
      className="animate-in fade-in slide-in-from-right-4 fixed top-16 right-4 z-[100] w-full max-w-xs duration-300 sm:top-[4.5rem] sm:right-6"
    >
      <div
        className={`flex items-center gap-3 rounded-xl px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.25)] ${style.accent} ${style.border} dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)]`}
      >
        <Icon className={`h-5 w-5 flex-shrink-0 ${style.iconColor}`} aria-hidden />
        <p className="min-w-0 flex-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
          {message}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="focus:ring-primary/30 flex-shrink-0 rounded p-1 text-slate-500 transition-colors hover:text-slate-800 focus:ring-2 focus:outline-none dark:text-slate-400 dark:hover:text-slate-100"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
