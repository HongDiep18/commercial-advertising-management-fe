import { type HTMLAttributes, forwardRef } from "react"

export type CardProps = HTMLAttributes<HTMLDivElement>

const Card = forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`rounded-lg border border-border bg-card shadow-sm ${className || ""}`}
      {...props}
    />
  )
})

Card.displayName = "Card"

export default Card
