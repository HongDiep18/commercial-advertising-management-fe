"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import Button from "../ui/Button"
import { VALID_INDUSTRIES } from "@/types/industry.enum"
import type { TFunction } from "i18next"

interface AccountIndustrySelectionModalProps {
  open: boolean
  onClose: () => void
  primaryIndustry: string | null
  selectedIndustries: string[]
  onSave: (selected: string[]) => Promise<void>
  t: TFunction
}

export function AccountIndustrySelectionModal({
  open,
  onClose,
  primaryIndustry,
  selectedIndustries,
  onSave,
  t,
}: AccountIndustrySelectionModalProps) {
  const [localSelected, setLocalSelected] = useState<string[]>(selectedIndustries)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setLocalSelected(selectedIndustries)
    }
  }, [open, selectedIndustries])

  if (!open) return null

  const handleToggleIndustry = (industry: string) => {
    if (localSelected.includes(industry)) {
      setLocalSelected(localSelected.filter((i) => i !== industry))
    } else {
      if (localSelected.length < 3) {
        setLocalSelected([...localSelected, industry])
      }
    }
  }

  const handleSave = async () => {
    if (localSelected.length !== 3) {
      // Show error: must select exactly 3 industries
      return
    }
    setIsSaving(true)
    try {
      await onSave(localSelected)
      onClose()
    } catch (error) {
      console.error("Failed to save industry selection:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const availableForSelection = VALID_INDUSTRIES.filter((ind) => ind !== primaryIndustry)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card border-border mt-12 max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-lg border shadow-xl">
        <div className="border-border flex items-center justify-between border-b p-6">
          <h2 className="text-foreground text-xl font-semibold">
            {t("account.industrySelection.title", { defaultValue: "選擇產業" })}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            disabled={isSaving}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {/* Industry Selection */}
          <div>
            <label className="text-foreground mb-2 block text-sm font-medium">
              {t("account.industrySelection.additionalIndustries", {
                defaultValue: "選擇3個產業",
              })}
            </label>
            <p className="text-muted-foreground mb-3 text-xs">
              {t("account.industrySelection.selectedCount", {
                defaultValue: `已選擇 ${localSelected.length}/3`,
                count: localSelected.length,
              })}
            </p>

            <div className="grid grid-cols-2 gap-2">
              {availableForSelection.map((industry) => {
                const isSelected = localSelected.includes(industry)
                const isDisabled = !isSelected && localSelected.length >= 3

                return (
                  <button
                    key={industry}
                    onClick={() => handleToggleIndustry(industry)}
                    disabled={isDisabled}
                    className={`rounded-md border px-3 py-2 text-left text-sm transition-all ${isSelected
                        ? "bg-primary/10 text-primary border-primary"
                        : isDisabled
                          ? "border-border text-muted-foreground/40 cursor-not-allowed opacity-50"
                          : "border-border text-foreground hover:border-primary/50 hover:bg-primary/5"
                      }`}
                  >
                    {t(`directory.categories.${industry}`, { defaultValue: industry })}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="border-border flex justify-end gap-3 border-t p-6">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            {t("common.cancel", { defaultValue: "取消" })}
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={localSelected.length !== 3 || isSaving}>
            {isSaving
              ? t("common.saving", { defaultValue: "儲存中..." })
              : t("common.save", { defaultValue: "儲存" })}
          </Button>
        </div>
      </div>
    </div>
  )
}
