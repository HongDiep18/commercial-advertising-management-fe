"use client"

import { AlertCircle, CheckCircle2, Loader2, X, XCircle } from "lucide-react"
import { useTheme } from "next-themes"
import type { CSSProperties } from "react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const toastShell =
  "group relative flex w-full items-start gap-3 rounded-xl border border-slate-200/80 border-l-4 px-4 py-3 pr-10 shadow-[0_8px_30px_rgba(0,0,0,0.25)] dark:border-slate-700 dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)]"

const sonnerClassNames: NonNullable<ToasterProps["toastOptions"]>["classNames"] = {
  toast: toastShell,
  success: "border-l-emerald-500 bg-emerald-50 dark:border-l-emerald-400 dark:bg-emerald-950/90",
  error: "border-l-red-500 bg-red-50 dark:border-l-red-400 dark:bg-red-950/90",
  warning: "border-l-amber-500 bg-amber-50 dark:border-l-amber-400 dark:bg-amber-950/90",
  info: "border-l-sky-500 bg-sky-50 dark:border-l-sky-400 dark:bg-sky-950/90",
  default: "border-l-sky-500 bg-sky-50 dark:border-l-sky-400 dark:bg-sky-950/90",
  loading: "border-l-sky-500 bg-sky-50 dark:border-l-sky-400 dark:bg-sky-950/90",
  icon: "mt-0.5 shrink-0 [&_svg]:h-5 [&_svg]:w-5",
  content: "min-w-0 flex-1",
  title: "text-sm font-semibold text-slate-800 dark:text-slate-100",
  description: "text-xs font-normal text-slate-600 dark:text-slate-400",
  closeButton:
    "focus:ring-primary/30 absolute top-2 right-2 z-10 shrink-0 rounded bg-transparent p-1 text-slate-500 transition-colors hover:bg-transparent hover:text-slate-800 focus:ring-2 focus:outline-none dark:text-slate-400 dark:hover:bg-transparent dark:hover:text-slate-100",
  actionButton:
    "mt-1 inline-flex h-auto rounded px-0 py-0 text-xs font-medium text-slate-600 underline-offset-2 hover:underline dark:text-slate-300",
  cancelButton:
    "mt-1 inline-flex h-auto rounded border border-slate-300 bg-transparent px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800",
  loader: "",
}

const toasterWidthStyle: CSSProperties = {
  ["--width" as string]: "min(20rem, calc(100vw - 2rem))",
}

const Toaster = ({ toastOptions: toastOptionsFromProps, style, ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()
  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      richColors={false}
      offset={{ top: "4rem", right: "1rem" }}
      style={{ ...toasterWidthStyle, ...style }}
      icons={{
        success: <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" aria-hidden />,
        info: <AlertCircle className="text-sky-600 dark:text-sky-400" aria-hidden />,
        warning: <AlertCircle className="text-amber-600 dark:text-amber-400" aria-hidden />,
        error: <XCircle className="text-red-600 dark:text-red-400" aria-hidden />,
        loading: <Loader2 className="animate-spin text-sky-600 dark:text-sky-400" aria-hidden />,
        close: <X className="h-4 w-4" aria-hidden />,
      }}
      toastOptions={{
        ...toastOptionsFromProps,
        classNames: {
          ...sonnerClassNames,
          ...toastOptionsFromProps?.classNames,
        },
        unstyled: true,
      }}
      {...props}
    />
  )
}

export { Toaster }
