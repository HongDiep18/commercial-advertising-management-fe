"use client"

import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  type ReactNode,
  createContext,
  useContext,
  Children,
  isValidElement,
} from "react"
import { createPortal } from "react-dom"
import { ChevronDown } from "lucide-react"

interface SelectContextType {
  value?: string
  onValueChange?: (value: string) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  selectedLabel: string
  setSelectedLabel: (label: string) => void
  disabled?: boolean
  triggerRect: DOMRect | null
  contentRef: React.RefObject<HTMLDivElement | null>
}

const SelectContext = createContext<SelectContextType | null>(null)

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: ReactNode
  disabled?: boolean
  required?: boolean
  options?: SelectOption[]
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

function Select({ value, onValueChange, children, disabled, options }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedLabel, setSelectedLabel] = useState("")
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null)
  const selectRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!options || value === undefined) return
    const match = options.find((o) => o.value === value)
    const label = match?.label ?? ""
    const rafId = requestAnimationFrame(() => setSelectedLabel(label))
    return () => cancelAnimationFrame(rafId)
  }, [value, options])

  useLayoutEffect(() => {
    if (isOpen && !disabled && selectRef.current) {
      setTriggerRect(selectRef.current.getBoundingClientRect())
    } else {
      setTriggerRect(null)
    }
  }, [isOpen, disabled])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (selectRef.current?.contains(target) || contentRef.current?.contains(target)) {
        return
      }
      setIsOpen(false)
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
    triggerRect,
    contentRef,
  }

  const contentChild = Children.toArray(children).find(
    (child) => isValidElement(child) && child.type === SelectContent
  )

  return (
    <SelectContext.Provider value={contextValue}>
      <div ref={selectRef} className="relative">
        {Children.map(children, (child) => {
          if (isValidElement(child)) {
            if (child.type === SelectTrigger) {
              return child
            }
            if (child.type === SelectContent) {
              return null
            }
          }
          return null
        })}
        {isOpen &&
          !disabled &&
          triggerRect &&
          contentChild &&
          typeof document !== "undefined" &&
          createPortal(contentChild, document.body)}
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
      className={`border-border bg-body-bg-light ring-offset-background placeholder:text-muted-foreground focus:ring-primary flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none ${disabled ? "pointer-events-none cursor-not-allowed bg-gray-100 opacity-60" : "cursor-pointer"} ${className || ""}`}
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
  const context = useContext(SelectContext)
  if (!context) return null
  const { triggerRect, contentRef } = context

  const style: React.CSSProperties = triggerRect
    ? {
        position: "fixed",
        top: triggerRect.bottom + 4,
        left: triggerRect.left,
        width: triggerRect.width,
        zIndex: 9999,
      }
    : {}

  return (
    <div
      ref={contentRef as React.RefObject<HTMLDivElement>}
      className="border-border bg-card rounded-md border shadow-lg"
      style={style}
    >
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
