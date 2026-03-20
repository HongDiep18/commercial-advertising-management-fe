"use client"

import Button from "@/components/ui/Button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog"

type AdOrderStatusActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  label: string
  value: string
  maxLength: number
  required: boolean
  confirmLabel: string
  cancelLabel: string
  isSubmitting: boolean
  onValueChange: (value: string) => void
  onConfirm: () => void
}

export function AdOrderStatusActionDialog({
  open,
  onOpenChange,
  title,
  description,
  label,
  value,
  maxLength,
  required,
  confirmLabel,
  cancelLabel,
  isSubmitting,
  onValueChange,
  onConfirm,
}: AdOrderStatusActionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-body-bg-dark max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 p-6 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              {label} {required && <span className="text-destructive">*</span>}
            </label>
            <span className="text-muted-foreground text-xs">
              {value.length}/{maxLength}
            </span>
          </div>
          <textarea
            value={value}
            onChange={(e) => onValueChange(e.target.value.slice(0, maxLength))}
            className="border-border/60 focus:ring-primary/40 min-h-28 w-full rounded-md border bg-transparent p-3 text-sm outline-none focus:ring-2"
          />
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              {cancelLabel}
            </Button>
            <Button
              variant="primary"
              disabled={isSubmitting || (required && value.trim().length === 0)}
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
