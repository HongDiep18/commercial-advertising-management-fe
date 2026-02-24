'use client'

import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Upload, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/Popover'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Label from '../ui/Label'
import Checkbox from '../ui/Checkbox'
import Calendar from '../ui/Calendar'
import { isDateDisabled, getDisabledDates } from '../../data/contactMockData'

interface AdItemFormProps {
  item: {
    id: string
    name: string
    category: string
    duration?: string
    price: string
  }
  itemDetails: {
    startDate: string
    endDate: string
    needDesign: boolean
    adLink: string
    files: File[]
  }
  openCalendar: string | null
  onStartDateChange: (date: Date | undefined) => void
  onDetailChange: (field: string, value: string | boolean) => void
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveFile: (index: number) => void
  onCalendarOpenChange: (open: boolean) => void
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
}: AdItemFormProps) {
  const { t, i18n } = useTranslation()

  const formatDate = (date: Date) => {
    if (i18n.language === 'zh-TW') return format(date, 'yyyy年M月d日')
    if (i18n.language === 'vi-VN') return format(date, 'dd/MM/yyyy')
    return format(date, 'MMM d, yyyy')
  }

  return (
    <div className="bg-card rounded-lg p-5 shadow-sm">
      <div className="flex justify-between items-start mb-4 border-b border-border pb-3">
        <div>
          <p className="text-xs text-primary font-medium mb-1">{item.category}</p>
          <p className="font-semibold text-foreground">{item.name}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {item.duration} - {item.price} VND
          </p>
        </div>
      </div>

      {/* Date Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <Label>{t('adContact.startDate')} *</Label>
          <Popover open={openCalendar === item.id} onOpenChange={onCalendarOpenChange}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-full justify-start text-left font-normal bg-transparent ${
                  !itemDetails.startDate && 'text-muted-foreground'
                }`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {itemDetails.startDate
                  ? formatDate(new Date(itemDetails.startDate))
                  : t('adContact.selectStartDate')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0 z-[60]" align="start" sideOffset={5} collisionPadding={20}>
              <div className="p-3 border-b border-border">
                <p key={i18n.language} className="text-xs text-muted-foreground">
                  {t('adContact.bookedDatesNote')}
                </p>
              </div>
              <Calendar
                mode="single"
                selected={itemDetails.startDate ? new Date(itemDetails.startDate) : undefined}
                onSelect={onStartDateChange}
                disabled={(date) => {
                  if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true
                  return isDateDisabled(item.id, date)
                }}
                modifiers={{
                  booked: getDisabledDates(item.id),
                }}
                modifiersClassNames={{
                  booked: 'bg-muted text-muted-foreground line-through',
                }}
                className="w-full"
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label>{t('adContact.endDate')}</Label>
          <Input
            value={itemDetails.endDate ? formatDate(new Date(itemDetails.endDate)) : ''}
            disabled
            placeholder={t('adContact.autoCalculated')}
            className="bg-muted/50"
          />
        </div>
      </div>

      {/* Ad Link */}
      <div className="space-y-2 mb-4">
        <Label>{t('adContact.adLink')}</Label>
        <Input
          type="url"
          placeholder="https://"
          value={itemDetails.adLink || ''}
          onChange={(e) => onDetailChange('adLink', e.target.value)}
        />
      </div>

      {/* Design Service */}
      <div className="flex items-center space-x-2 mb-4">
        <Checkbox
          id={`need-design-${item.id}`}
          checked={itemDetails.needDesign || false}
          onCheckedChange={(checked) => onDetailChange('needDesign', checked as boolean)}
        />
        <Label htmlFor={`need-design-${item.id}`} className="cursor-pointer text-sm">
          {t('adContact.needDesign')}
        </Label>
      </div>

      {/* File Upload */}
      <div className="space-y-2">
        <Label className="text-sm">{t('adContact.uploadAdMaterial')}</Label>
        <div
          className="border border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => {
            const input = document.getElementById(`file-input-${item.id}`) as HTMLInputElement
            input?.click()
          }}
        >
          <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-1" />
          <p key={i18n.language} className="text-xs text-muted-foreground">
            {t('adContact.clickToUpload')}
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
              <li key={index} className="flex items-center justify-between text-sm bg-muted/50 rounded px-3 py-2">
                <span className="truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => onRemoveFile(index)}
                  className="text-muted-foreground hover:text-foreground ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
