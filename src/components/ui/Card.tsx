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

export type CardHeaderProps = HTMLAttributes<HTMLDivElement>

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`flex flex-col space-y-1.5 p-6 ${className || ""}`}
      {...props}
    />
  )
})
CardHeader.displayName = "CardHeader"

export type CardTitleProps = HTMLAttributes<HTMLHeadingElement>

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(({ className, ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={`text-2xl font-semibold leading-none tracking-tight ${className || ""}`}
      {...props}
    />
  )
})
CardTitle.displayName = "CardTitle"

export type CardContentProps = HTMLAttributes<HTMLDivElement>

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`p-6 pt-0 ${className || ""}`}
      {...props}
    />
  )
})
CardContent.displayName = "CardContent"

const CardWithSubComponents = Card as typeof Card & {
  Header: typeof CardHeader
  Title: typeof CardTitle
  Content: typeof CardContent
}

CardWithSubComponents.Header = CardHeader
CardWithSubComponents.Title = CardTitle
CardWithSubComponents.Content = CardContent

export default CardWithSubComponents
export { CardHeader, CardTitle, CardContent }
