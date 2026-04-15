import { cn } from "@/lib/utils"

type ReadOnlyFieldValueProps = {
  value: string
  emptyLabel: string
  multiline?: boolean
  className?: string
}

export function ReadOnlyFieldValue({
  value,
  emptyLabel,
  multiline = false,
  className,
}: ReadOnlyFieldValueProps) {
  const trimmed = String(value ?? "").trim()
  if (!trimmed) {
    return (
      <p className={cn("text-muted-foreground text-sm", className)} aria-label={emptyLabel}>
        {emptyLabel}
      </p>
    )
  }
  return (
    <p
      className={cn(
        "text-foreground text-sm font-medium break-words",
        multiline && "whitespace-pre-wrap",
        className
      )}
    >
      {trimmed}
    </p>
  )
}

type ReadOnlyFieldBoxProps = ReadOnlyFieldValueProps & {
  boxed?: boolean
}

export function ReadOnlyFieldBox({
  boxed = true,
  multiline,
  className,
  ...rest
}: ReadOnlyFieldBoxProps) {
  return (
    <div
      className={cn(
        boxed && "border-border bg-body-bg-light/30 w-full min-w-0 rounded-md border px-3 py-2",
        boxed && !multiline && "flex min-h-10 items-center",
        boxed && multiline && "min-h-[4.5rem]"
      )}
    >
      <ReadOnlyFieldValue {...rest} multiline={multiline} className={className} />
    </div>
  )
}
