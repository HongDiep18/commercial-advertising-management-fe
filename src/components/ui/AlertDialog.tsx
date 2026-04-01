"use client"

import { AlertCircle, CheckCircle2, X, XCircle } from "lucide-react"
import { useEffect, type ReactNode } from "react"
import { createPortal } from "react-dom"

export type AlertDialogVariant = "success" | "error" | "warning" | "info"

type VariantConfig = {
  icon: typeof CheckCircle2
  iconColor: string
  iconBg: string
  borderColor: string
}

const variantConfig: Record<AlertDialogVariant, VariantConfig> = {
  success: {
    icon: CheckCircle2,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/60",
    borderColor: "border-t-emerald-500 dark:border-t-emerald-400",
  },
  error: {
    icon: XCircle,
    iconColor: "text-red-600 dark:text-red-400",
    iconBg: "bg-red-50 dark:bg-red-950/60",
    borderColor: "border-t-red-500 dark:border-t-red-400",
  },
  warning: {
    icon: AlertCircle,
    iconColor: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-50 dark:bg-amber-950/60",
    borderColor: "border-t-amber-500 dark:border-t-amber-400",
  },
  info: {
    icon: AlertCircle,
    iconColor: "text-sky-600 dark:text-sky-400",
    iconBg: "bg-sky-50 dark:bg-sky-950/60",
    borderColor: "border-t-sky-500 dark:border-t-sky-400",
  },
}

export type AlertDialogProps = {
  open: boolean
  onClose: () => void
  variant?: AlertDialogVariant
  title: string
  description?: string
  children?: ReactNode
}

export function AlertDialog({
  open,
  onClose,
  variant = "info",
  title,
  description,
  children,
}: AlertDialogProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-90 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alert-dialog-title"
        aria-describedby={description ? "alert-dialog-desc" : undefined}
        className={`bg-background border-border relative w-full max-w-md rounded-xl border border-t-4 shadow-[0_8px_30px_rgba(0,0,0,0.25)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] ${config.borderColor}`}
      >
        <button
          type="button"
          onClick={onClose}
          className="focus:ring-primary/30 text-muted-foreground hover:text-foreground absolute top-3 right-3 rounded p-1 transition-colors focus:ring-2 focus:outline-none"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-6 pt-6 pb-5">
          <div className={`mb-4 inline-flex rounded-full p-3 ${config.iconBg}`}>
            <Icon className={`h-6 w-6 ${config.iconColor}`} aria-hidden />
          </div>

          <h2
            id="alert-dialog-title"
            className="text-foreground mb-1 text-base font-semibold"
          >
            {title}
          </h2>

          {description && (
            <p
              id="alert-dialog-desc"
              className="text-muted-foreground text-sm"
            >
              {description}
            </p>
          )}

          {children && <div className="mt-4">{children}</div>}
        </div>
      </div>
    </div>,
    document.body
  )
}
