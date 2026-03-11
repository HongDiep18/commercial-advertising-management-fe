"use client"

import { useState } from "react"

export interface CalendarProps {
  mode?: "single" | "range"
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  disabled?: (date: Date) => boolean
  modifiers?: {
    booked?: Date[]
    [key: string]: Date[] | undefined
  }
  modifiersClassNames?: {
    booked?: string
    [key: string]: string | undefined
  }
  className?: string
  initialFocus?: boolean
}

const Calendar = ({
  mode = "single",
  selected,
  onSelect,
  disabled,
  modifiers,
  modifiersClassNames,
  className = "",
  initialFocus = false,
}: CalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const today = new Date()
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay()

  const weeks: Date[][] = []
  let week: Date[] = []

  for (let i = 0; i < startingDayOfWeek; i++) {
    const date = new Date(year, month, -i)
    week.unshift(date)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    week.push(date)

    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
  }

  const remainingDays = 7 - week.length
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day)
    week.push(date)
  }
  if (week.length > 0) {
    weeks.push(week)
  }

  const isDateDisabled = (date: Date): boolean => {
    if (disabled) return disabled(date)
    return false
  }

  const isDateBooked = (date: Date): boolean => {
    if (!modifiers?.booked) return false
    return modifiers.booked.some((bookedDate) => bookedDate.toDateString() === date.toDateString())
  }

  const getDateClassName = (date: Date): string => {
    const isToday = date.toDateString() === today.toDateString()
    const isSelected = selected && date.toDateString() === selected.toDateString()
    const isDisabled = isDateDisabled(date)
    const isBooked = isDateBooked(date)
    const isOtherMonth = date.getMonth() !== month

    let classes =
      "w-9 h-9 flex items-center justify-center rounded-md text-sm cursor-pointer transition-colors "

    if (isOtherMonth) {
      classes += "text-muted-foreground/30 "
    } else if (isDisabled || isBooked) {
      classes += "text-muted-foreground cursor-not-allowed opacity-50 "
      if (isBooked && modifiersClassNames?.booked) {
        classes += modifiersClassNames.booked + " "
      }
    } else {
      classes += "hover:!bg-header-red-dark hover:!text-white "
    }

    if (isToday && !isSelected && !isDisabled && !isBooked) {
      classes += "font-semibold text-primary "
    }

    if (isSelected && !isDisabled && !isBooked) {
      classes += "bg-primary text-primary-foreground "
    }

    return classes
  }

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date) || isDateBooked(date)) return
    if (date.getMonth() !== month) {
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1))
    }
    onSelect?.(date)
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const monthNames = [
    "一月",
    "二月",
    "三月",
    "四月",
    "五月",
    "六月",
    "七月",
    "八月",
    "九月",
    "十月",
    "十一月",
    "十二月",
  ]
  const dayNames = ["日", "一", "二", "三", "四", "五", "六"]

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-4 flex items-center justify-between pt-7">
        <button type="button" onClick={goToPreviousMonth} className="hover:bg-muted rounded-md p-1">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div className="font-semibold">
          {year}年{month + 1}月
        </div>
        <button type="button" onClick={goToNextMonth} className="hover:bg-muted rounded-md p-1">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1">
        {dayNames.map((day) => (
          <div key={day} className="text-muted-foreground py-1 text-center text-xs font-medium">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weeks.map((week, weekIndex) =>
          week.map((date, dayIndex) => (
            <button
              key={`${weekIndex}-${dayIndex}`}
              type="button"
              onClick={() => handleDateClick(date)}
              className={getDateClassName(date)}
            >
              {date.getDate()}
            </button>
          ))
        )}
      </div>
    </div>
  )
}

export default Calendar
