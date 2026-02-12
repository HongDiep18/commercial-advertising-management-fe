'use client'

import { useState, useRef, useEffect, type ReactNode, createContext, useContext, Children, isValidElement } from 'react'
import { ChevronDown } from 'lucide-react'

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
    const [selectedLabel, setSelectedLabel] = useState('')
    const selectRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    const contextValue: SelectContextType = {
        value,
        onValueChange,
        isOpen,
        setIsOpen: disabled ? () => { } : setIsOpen,
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
    let placeholder = 'Select...'

    if (isValidElement(children) && children.type === SelectValue) {
        placeholder = (children.props as SelectValueProps).placeholder || 'Select...'
    }

    return (
        <div
            onClick={() => !disabled && setIsOpen(!isOpen)}
            className={`flex h-10 w-full items-center justify-between rounded-md border border-border bg-body-bg-light px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${disabled ? 'cursor-not-allowed opacity-50 bg-gray-100' : 'cursor-pointer'} ${className || ''}`}
        >
            <span className={selectedLabel ? '' : 'text-muted-foreground'}>
                {selectedLabel || placeholder}
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
    )
}
SelectTrigger.displayName = 'SelectTrigger'

function SelectValue({ placeholder }: SelectValueProps) {
    return <span>{placeholder}</span>
}
SelectValue.displayName = 'SelectValue'

function SelectContent({ children }: SelectContentProps) {
    return (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-card shadow-lg">
            <div className="max-h-60 overflow-auto p-1">{children}</div>
        </div>
    )
}
SelectContent.displayName = 'SelectContent'

function SelectItem({ value, children }: SelectItemProps) {
    const context = useContext(SelectContext)
    if (!context) return null

    const { onValueChange, setIsOpen, setSelectedLabel } = context

    return (
        <div
            className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-secondary focus:bg-secondary"
            onClick={() => {
                const label = typeof children === 'string' ? children : (children as ReactNode)?.toString() || ''
                setSelectedLabel(label)
                setIsOpen(false)
                onValueChange?.(value)
            }}
        >
            {children}
        </div>
    )
}
SelectItem.displayName = 'SelectItem'

Select.Trigger = SelectTrigger
Select.Value = SelectValue
Select.Content = SelectContent
Select.Item = SelectItem

export default Select
