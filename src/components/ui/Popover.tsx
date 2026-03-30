'use client'

import React, { useState, useRef, useEffect, useCallback, ReactNode, cloneElement, isValidElement, createContext, useContext } from 'react'
import { createPortal } from 'react-dom'

export interface PopoverProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: ReactNode
}

export interface PopoverTriggerProps {
  asChild?: boolean
  children: ReactNode
}

export interface PopoverContentProps {
  children: ReactNode
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'bottom' | 'left' | 'right'
  sideOffset?: number
  collisionPadding?: number
  className?: string
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

interface PopoverContextType {
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLElement | null>
}

const PopoverContext = createContext<PopoverContextType | null>(null)

export function Popover({ open: controlledOpen, onOpenChange, children }: PopoverProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const triggerRef = useRef<HTMLElement | null>(null)
  
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = (newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(newOpen)
    }
    onOpenChange?.(newOpen)
  }

  return (
    <PopoverContext.Provider value={{ open, setOpen, triggerRef }}>
      {children}
    </PopoverContext.Provider>
  )
}

export function PopoverTrigger({ asChild, children }: PopoverTriggerProps) {
  const context = useContext(PopoverContext)
  if (!context) throw new Error('PopoverTrigger must be used within Popover')

  const { open, setOpen, triggerRef } = context

  const handleClick = useCallback(() => {
    setOpen(!open)
  }, [open, setOpen])

  
  
  const createRefCallback = useCallback((originalRef: any) => {
    return (el: HTMLElement | null) => {
      
      if (triggerRef) {
        (triggerRef as React.MutableRefObject<HTMLElement | null>).current = el
      }
      
      if (typeof originalRef === 'function') {
        originalRef(el)
      }
    }
  }, [triggerRef])

  if (asChild && isValidElement(children)) {
    const childElement = children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>
    
    const originalRef = (childElement as any).ref
    
    const childProps: { onClick: (e: React.MouseEvent) => void; ref?: (el: HTMLElement | null) => void } = {
      onClick: (e: React.MouseEvent) => {
        handleClick()
        childElement.props.onClick?.(e)
      },
    }
    
    
    if (originalRef) {
      childProps.ref = createRefCallback(originalRef)
    } else {
      childProps.ref = (el: HTMLElement | null) => {
        if (triggerRef) {
          (triggerRef as React.MutableRefObject<HTMLElement | null>).current = el
        }
      }
    }
    
    return cloneElement(childElement, childProps)
  }

  return (
    <div ref={triggerRef as React.RefObject<HTMLDivElement>} onClick={handleClick} className="inline-block">
      {children}
    </div>
  )
}

export function PopoverContent({
  children,
  align = 'center',
  side = 'bottom',
  sideOffset = 4,
  collisionPadding = 8,
  className = '',
  onMouseEnter,
  onMouseLeave,
}: PopoverContentProps) {
  const context = useContext(PopoverContext)
  if (!context) throw new Error('PopoverContent must be used within Popover')

  const { open, triggerRef, setOpen } = context
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const updatePosition = () => {
      if (!triggerRef.current || !contentRef.current) return

      const triggerRect = triggerRef.current.getBoundingClientRect()
      const contentRect = contentRef.current.getBoundingClientRect()

      let top = 0
      let left = 0

      if (side === 'bottom') {
        top = triggerRect.bottom + sideOffset
        if (align === 'start') {
          left = triggerRect.left
        } else if (align === 'end') {
          left = triggerRect.right - contentRect.width
        } else {
          left = triggerRect.left + (triggerRect.width - contentRect.width) / 2
        }
      } else if (side === 'top') {
        top = triggerRect.top - contentRect.height - sideOffset
        if (align === 'start') {
          left = triggerRect.left
        } else if (align === 'end') {
          left = triggerRect.right - contentRect.width
        } else {
          left = triggerRect.left + (triggerRect.width - contentRect.width) / 2
        }
      } else if (side === 'right') {
        left = triggerRect.right + sideOffset
        if (align === 'start') {
          top = triggerRect.top
        } else if (align === 'end') {
          top = triggerRect.bottom - contentRect.height
        } else {
          top = triggerRect.top + (triggerRect.height - contentRect.height) / 2
        }
      } else {
        left = triggerRect.left - contentRect.width - sideOffset
        if (align === 'start') {
          top = triggerRect.top
        } else if (align === 'end') {
          top = triggerRect.bottom - contentRect.height
        } else {
          top = triggerRect.top + (triggerRect.height - contentRect.height) / 2
        }
      }

      
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      if (left < collisionPadding) left = collisionPadding
      if (left + contentRect.width > viewportWidth - collisionPadding) {
        left = viewportWidth - contentRect.width - collisionPadding
      }
      if (top < collisionPadding) top = collisionPadding
      if (top + contentRect.height > viewportHeight - collisionPadding) {
        top = viewportHeight - contentRect.height - collisionPadding
      }

      setPosition({ top, left })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    
    const handleClickOutside = (event: MouseEvent) => {
      if (!contentRef.current || !triggerRef.current) return
      
      const target = event.target as Node
      if (
        !contentRef.current.contains(target) &&
        !triggerRef.current.contains(target)
      ) {
        setOpen(false)
      }
    }

    
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 0)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, align, side, sideOffset, collisionPadding, triggerRef, setOpen])

  if (!open) return null

  return createPortal(
    <div
      ref={contentRef}
      className={`fixed z-50 bg-background border border-border rounded-md shadow-lg p-1 ${className}`}
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>,
    document.body
  )
}
