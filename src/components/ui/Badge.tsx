import { type HTMLAttributes } from "react"

type BadgeVariant = "default" | "secondary" | "outline" | "body-bg-light"

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant
}

export default function Badge({ variant = "default", className, ...props }: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-foreground",
    outline: "border border-border bg-transparent",
    "body-bg-light": "bg-body-bg-dark-foreground text-foreground",
  }

  return (
    <div
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-normal transition-colors ${variants[variant]} ${className || ""}`}
      {...props}
    />
  )
}
