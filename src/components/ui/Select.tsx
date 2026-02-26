"use client"

import {
  useState,
  useRef,
  useEffect,
  type ReactNode,
  createContext,
  useContext,
  Children,
  isValidElement,
} from "react"
import { ChevronDown } from "lucide-react"

interface SelectContextType {
  value?: string
  onValueChange?: (value: string) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  selectedLabel: string
  setSelectedLabel: (label: string) => void
  disabled?: boolean
}

const SelectContext = createContext<SelectContextType | null>(null)

export interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: ReactNode
  disabled?: boolean
  required?: boolean
}

export interface SelectTriggerProps {
  className?: string
  children: ReactNode
}

export interface SelectValueProps {
  placeholder?: string
}

export interface SelectContentProps {
  children: ReactNode
}

export interface SelectItemProps {
  value: string
  children: ReactNode
}

function Select({ value, onValueChange, children, disabled }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedLabel, setSelectedLabel] = useState("")
  const selectRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const contextValue: SelectContextType = {
    value,
    onValueChange,
    isOpen,
    setIsOpen: disabled ? () => {} : setIsOpen,
    selectedLabel,
    setSelectedLabel,
    disabled,
  }

  return (
    <SelectContext.Provider value={contextValue}>
      <div ref={selectRef} className="relative">
        {Children.map(children, (child) => {
          if (isValidElement(child)) {
            if (child.type === SelectTrigger) {
              return child
            }
            if (child.type === SelectContent && isOpen && !disabled) {
              return child
            }
          }
          return null
        })}
      </div>
    </SelectContext.Provider>
  )
}

function SelectTrigger({ className, children }: SelectTriggerProps) {
  const context = useContext(SelectContext)
  if (!context) return null

  const { isOpen, selectedLabel, setIsOpen, disabled } = context
  let placeholder = "Select..."

  if (isValidElement(children) && children.type === SelectValue) {
    placeholder = (children.props as SelectValueProps).placeholder || "Select..."
  }

  return (
    <div
      onClick={() => !disabled && setIsOpen(!isOpen)}
      className={`border-border bg-body-bg-light ring-offset-background placeholder:text-muted-foreground focus:ring-primary flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none ${disabled ? "cursor-not-allowed bg-gray-100 opacity-50" : "cursor-pointer"} ${className || ""}`}
    >
      <span
        className={`min-w-0 flex-1 truncate text-left ${selectedLabel ? "" : "text-muted-foreground"}`}
      >
        {selectedLabel || placeholder}
      </span>
      <ChevronDown
        className={`h-4 w-4 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
      />
    </div>
  )
}
SelectTrigger.displayName = "SelectTrigger"

function SelectValue({ placeholder }: SelectValueProps) {
  return <span>{placeholder}</span>
}
SelectValue.displayName = "SelectValue"

function SelectContent({ children }: SelectContentProps) {
  return (
    <div className="border-border bg-card absolute z-50 mt-1 w-full rounded-md border shadow-lg">
      <div className="max-h-60 overflow-auto p-1">{children}</div>
    </div>
  )
}
SelectContent.displayName = "SelectContent"

function SelectItem({ value, children }: SelectItemProps) {
  const context = useContext(SelectContext)
  if (!context) return null

  const { onValueChange, setIsOpen, setSelectedLabel } = context

  return (
    <div
      className="hover:bg-secondary focus:bg-secondary relative flex w-full cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none"
      onClick={() => {
        const label =
          typeof children === "string" ? children : (children as ReactNode)?.toString() || ""
        setSelectedLabel(label)
        setIsOpen(false)
        onValueChange?.(value)
      }}
    >
      {children}
    </div>
  )
}
SelectItem.displayName = "SelectItem"

Select.Trigger = SelectTrigger
Select.Value = SelectValue
Select.Content = SelectContent
Select.Item = SelectItem

export default Select
