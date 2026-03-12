"use client"

import type { CSSProperties, ReactNode } from "react"
import Badge from "./Badge"

type TextColorBadgeProps = {
  colorKey: string
  children: ReactNode
  className?: string
  variant?: "default" | "secondary" | "outline" | "body-bg-light"
}

function getColorStylesFromText(text: string): CSSProperties {
  let hash = 0
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) | 0
  }
  const hue = Math.abs(hash) % 360
  const backgroundColor = `hsl(${hue} 90% 95%)`
  const color = `hsl(${hue} 60% 25%)`
  return { backgroundColor, color }
}

export default function TextColorBadge({
  colorKey,
  children,
  className,
  variant = "default",
}: TextColorBadgeProps) {
  return (
    <Badge
      variant={variant}
      className={`justify-center font-semibold ${className || ""}`}
      style={getColorStylesFromText(colorKey)}
    >
      {children}
    </Badge>
  )
}

