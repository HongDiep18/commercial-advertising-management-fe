import type { CompanyChannelContact } from "@/api/companies/types"

export type ChannelContactGroup = {
  id: string
  label: string
  items: CompanyChannelContact[]
}

export function groupChannelContactsByType(
  contacts: CompanyChannelContact[]
): ChannelContactGroup[] {
  const order: string[] = []
  const itemsById = new Map<string, CompanyChannelContact[]>()
  const labelById = new Map<string, string>()

  for (const c of contacts) {
    const raw = c.type?.trim() || "other"
    const id = raw.toLowerCase()
    if (!itemsById.has(id)) {
      order.push(id)
      itemsById.set(id, [])
      labelById.set(id, raw)
    }
    itemsById.get(id)!.push(c)
  }

  return order.map((id) => ({
    id,
    label: labelById.get(id)!,
    items: itemsById.get(id)!,
  }))
}
