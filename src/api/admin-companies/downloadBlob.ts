export function parseFilenameFromContentDisposition(header: string | null): string | undefined {
  if (!header) return undefined

  const utf8Match = /filename\*=UTF-8''([^;\s]+)/i.exec(header)
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].replace(/"/g, ""))
    } catch {
      return utf8Match[1]
    }
  }

  const quoted = /filename="([^"]+)"/i.exec(header)
  if (quoted?.[1]) return quoted[1]

  const plain = /filename=([^;\s]+)/i.exec(header)
  if (plain?.[1]) return plain[1].replace(/"/g, "")

  return undefined
}

export function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.rel = "noopener"
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
