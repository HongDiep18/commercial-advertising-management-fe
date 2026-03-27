"use client"

import {
  createContext,
  useContext,
  useEffect,
  useId,
  type HTMLAttributes,
  type ReactNode,
} from "react"
import { createPortal } from "react-dom"

type DialogContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  titleId: string
  descriptionId: string
}

const DialogContext = createContext<DialogContextValue | null>(null)

export type DialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const rid = useId()
  const value: DialogContextValue = {
    open,
    setOpen: onOpenChange,
    titleId: `dialog-title-${rid}`,
    descriptionId: `dialog-desc-${rid}`,
  }
  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>
}

export type DialogContentProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

export function DialogContent({ className, children, ...props }: DialogContentProps) {
  const ctx = useContext(DialogContext)
  if (!ctx) throw new Error("DialogContent must be used within Dialog")
  const { open, setOpen, titleId, descriptionId } = ctx

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open, setOpen])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          className={`bg-background border-border mt-12 max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl border shadow-xl ${className || ""}`}
          {...props}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}

export function DialogHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`space-y-1.5 border-b p-6 ${className || ""}`} {...props} />
}

export function DialogTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  const ctx = useContext(DialogContext)
  const id = ctx?.titleId
  return (
    <h2 id={id} className={`text-foreground text-lg font-semibold ${className || ""}`} {...props} />
  )
}

export function DialogDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  const ctx = useContext(DialogContext)
  const id = ctx?.descriptionId
  return <p id={id} className={`text-muted-foreground text-sm ${className || ""}`} {...props} />
}
