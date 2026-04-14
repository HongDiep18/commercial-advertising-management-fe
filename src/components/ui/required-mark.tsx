export function stripTrailingAsterisk(text: string): string {
  return text.replace(/\s*\*\s*$/, "").trimEnd()
}

export function RequiredMark() {
  return (
    <span className="ml-[-1px] !text-red-600" aria-hidden="true">
      *
    </span>
  )
}
