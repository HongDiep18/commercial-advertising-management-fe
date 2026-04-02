"use client"

import { isSlotPackageType } from "@/api/active-ads/bookedDates"
import { useBookedDates } from "@/api/active-ads/hooks"
import Button from "@/components/ui/Button"
import Calendar from "@/components/ui/Calendar"
import Checkbox from "@/components/ui/Checkbox"
import Input from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover"
import { addDuration, getDisabledDates, isDateDisabled } from "@/data/contactMockData"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Upload, X } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef } from "react"
import { useTranslation } from "react-i18next"

type AdPackageFormConfig = {
  requiresStartDate: boolean
  requiresAdLink: boolean
  requiresDesignService: boolean
  requiresAssets: boolean
}

const DEFAULT_FORM_CONFIG: AdPackageFormConfig = {
  requiresStartDate: true,
  requiresAdLink: true,
  requiresDesignService: true,
  requiresAssets: true,
}

interface AdItemFormProps {
  item: {
    id: string
    name: string
    category: string
    duration?: string
    price: string
    quantity?: number
    packageType?: string
    durationValue?: number | null
    durationUnit?: string | null
  }
  itemDetails: {
    startDate: string
    endDate: string
    needDesign: boolean
    adLink: string
    files: File[]
    quantity?: number
  }
  openCalendar: string | null
  onStartDateChange: (date: Date | undefined) => void
  onDetailChange: (field: string, value: string | boolean | number) => void
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveFile: (index: number) => void
  onCalendarOpenChange: (open: boolean) => void
  slotError?: string | null
  calendarDefaultMonth?: Date
  formConfig?: AdPackageFormConfig
}

export default function AdItemForm({
  item,
  itemDetails,
  openCalendar,
  onStartDateChange,
  onDetailChange,
  onFileChange,
  onRemoveFile,
  onCalendarOpenChange,
  slotError,
  calendarDefaultMonth,
  formConfig,
}: AdItemFormProps) {
  const { t, i18n } = useTranslation()
  const slotErrorRef = useRef<HTMLParagraphElement>(null)
  const isSlot = isSlotPackageType(item.packageType)
  const config = formConfig ?? DEFAULT_FORM_CONFIG

  useEffect(() => {
    if (!config.requiresStartDate) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      onStartDateChange(today)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (slotError && slotErrorRef.current) {
      slotErrorRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [slotError])
  const { data: bookedDatesData } = useBookedDates(item.packageType)

  const formatDate = (date: Date) => {
    if (i18n.language === "zh-TW") return format(date, "yyyy年M月d日")
    if (i18n.language === "vi-VN") return format(date, "dd/MM/yyyy")
    return format(date, "MMM d, yyyy")
  }

  const isDateDisabledBySlot = useCallback(
    (date: Date): boolean => {
      if (!bookedDatesData?.fullyBookedRanges?.length) return false
      if (!item.durationValue || !item.durationUnit) return false
      const endDate = addDuration(date, item.durationValue, item.durationUnit)
      return bookedDatesData.fullyBookedRanges.some((range) => {
        const rangeStart = new Date(range.startDate)
        const rangeEnd = range.endDate ? new Date(range.endDate) : null
        return (rangeEnd === null || date < rangeEnd) && endDate > rangeStart
      })
    },
    [bookedDatesData, item.durationValue, item.durationUnit]
  )

  const firstAvailableDate = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    for (let i = 0; i < 365; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      const disabled = isSlot ? isDateDisabledBySlot(date) : isDateDisabled(item.id, date)
      if (!disabled) return date
    }
    return today
  }, [isDateDisabledBySlot, item.id, isSlot])

  return (
    <div className="bg-card rounded-lg p-5 shadow-sm">
      <div className="border-border mb-4 flex items-start justify-between border-b pb-3">
        <div>
          <p className="text-primary mb-1 text-xs font-medium">{item.category}</p>
          <p className="text-foreground font-semibold">{item.name}</p>
          <p className="text-muted-foreground mt-1 text-sm">
            {item.duration} - {item.price} VND
          </p>
        </div>
      </div>

      {config.requiresStartDate && (
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("adContact.startDate")} *</Label>
            <Popover open={openCalendar === item.id} onOpenChange={onCalendarOpenChange}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={`w-full justify-start bg-transparent text-left font-normal ${
                    !itemDetails.startDate && "text-muted-foreground"
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {itemDetails.startDate
                    ? formatDate(new Date(itemDetails.startDate))
                    : t("adContact.selectStartDate")}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="z-90 w-[280px] p-0"
                align="start"
                sideOffset={5}
                collisionPadding={20}
              >
                <div className="border-border border-b p-3">
                  <p key={i18n.language} className="text-muted-foreground text-xs">
                    {t("adContact.bookedDatesNote")}
                  </p>
                </div>
                <Calendar
                  key={(calendarDefaultMonth ?? firstAvailableDate).toISOString()}
                  mode="single"
                  selected={itemDetails.startDate ? new Date(itemDetails.startDate) : undefined}
                  onSelect={onStartDateChange}
                  disabled={(date) => {
                    if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true
                    if (isSlot) return isDateDisabledBySlot(date)
                    return isDateDisabled(item.id, date)
                  }}
                  modifiers={{
                    booked: isSlot ? [] : getDisabledDates(item.id),
                  }}
                  modifiersClassNames={{
                    booked: "bg-muted text-muted-foreground line-through",
                  }}
                  className="w-full"
                  initialFocus
                  localeCode={i18n.language}
                  defaultMonth={calendarDefaultMonth ?? firstAvailableDate}
                />
              </PopoverContent>
            </Popover>
            {slotError && (
              <p ref={slotErrorRef} className="text-sm text-red-500">
                {slotError}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>{t("adContact.endDate")}</Label>
            <Input
              value={itemDetails.endDate ? formatDate(new Date(itemDetails.endDate)) : ""}
              disabled
              placeholder={t("adContact.autoCalculated")}
              className="bg-muted/50"
            />
          </div>
        </div>
      )}

      {config.requiresAdLink && (
        <div className="mb-4 space-y-2">
          <Label>{t("adContact.adLink")}</Label>
          <Input
            type="url"
            placeholder="https://"
            value={itemDetails.adLink || ""}
            onChange={(e) => onDetailChange("adLink", e.target.value)}
          />
        </div>
      )}

      {config.requiresDesignService && (
        <div className="mb-4 flex items-center space-x-2">
          <Checkbox
            id={`need-design-${item.id}`}
            checked={itemDetails.needDesign || false}
            onCheckedChange={(checked) => onDetailChange("needDesign", checked as boolean)}
          />
          <Label htmlFor={`need-design-${item.id}`} className="cursor-pointer text-sm">
            {t("adContact.needDesign")}
          </Label>
        </div>
      )}

      {config.requiresAssets && (
        <div className="space-y-2">
          <Label className="text-sm">{t("adContact.uploadAdMaterial")}</Label>
          <div
            className="border-border hover:border-primary/50 cursor-pointer rounded-lg border border-dashed p-4 text-center transition-colors"
            onClick={() => {
              const input = document.getElementById(`file-input-${item.id}`) as HTMLInputElement
              input?.click()
            }}
          >
            <Upload className="text-muted-foreground mx-auto mb-1 h-6 w-6" />
            <p key={i18n.language} className="text-muted-foreground text-xs">
              {t("adContact.clickToUpload")}
            </p>
          </div>
          <input
            id={`file-input-${item.id}`}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.pdf,.ai"
            className="hidden"
            onChange={onFileChange}
          />
          {itemDetails.files?.length > 0 && (
            <ul className="mt-2 space-y-1">
              {itemDetails.files.map((file, index) => (
                <li
                  key={index}
                  className="bg-muted/50 flex items-center justify-between rounded px-3 py-2 text-sm"
                >
                  <span className="truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveFile(index)}
                    className="text-muted-foreground hover:text-foreground ml-2"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
