import { cloneElement, isValidElement, type ButtonHTMLAttributes, type ReactElement } from "react"

type Variant = "default" | "outline" | "ghost" | "primary"
type Size = "sm" | "default" | "lg" | "icon"

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  asChild?: boolean
}

function classesFor(variant: Variant, size: Size) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-black/20 disabled:opacity-50 disabled:pointer-events-none"

  const variants: Record<Variant, string> = {
    default: "bg-slate-900 text-white hover:bg-slate-800",
    outline: "border border-slate-200 bg-transparent text-slate-900 hover:bg-slate-50",
    ghost: "bg-transparent text-slate-900 hover:bg-primary hover:text-white",
    primary: "bg-primary text-white hover:bg-primary/90",
  }

  const sizes: Record<Size, string> = {
    sm: "h-9 px-3 text-sm",
    default: "h-10 px-4 text-sm",
    lg: "h-12 px-5 text-base",
    icon: "h-10 w-10",
  }

  return `${base} ${variants[variant]} ${sizes[size]}`
}

export default function Button({
  variant = "default",
  size = "default",
  asChild,
  className,
  ...props
}: ButtonProps) {
  const cls = className ? `${classesFor(variant, size)} ${className}` : classesFor(variant, size)

  if (asChild) {
    const child = (props as unknown as { children: ReactElement }).children
    if (!isValidElement(child)) return null
    const prev = (child.props as { className?: string }).className ?? ""
    return cloneElement(child as ReactElement<{ className?: string }>, {
      className: `${prev} ${cls}`.trim(),
    })
  }

  return <button {...props} className={cls} />
}
