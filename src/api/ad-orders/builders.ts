import type { CreateAdOrderInput, CreateAdOrderItemInput } from "../../types/types"

export type UiSelectedAdItem = {
  id: string
  name: string
  category: string
  duration?: string
  price: string
  quantity?: number
  packageId?: string
  pricingId?: string
}

export type UiAdItemDetails = {
  startDate: string
  endDate: string
  needDesign: boolean
  adLink: string
  files: File[]
  quantity?: number
}

function parseVndToBigIntString(v: string): string {
  const normalized = v.replace(/[^\d]/g, "")
  const n = normalized ? BigInt(normalized) : BigInt(0)
  return n.toString()
}

export function buildCreateAdOrderInput(params: {
  notes?: string
  companyId?: string | null
  selectedItems: UiSelectedAdItem[]
  itemDetailsById: Record<string, UiAdItemDetails>
}): { input: CreateAdOrderInput; subtotal: string } {
  const items: CreateAdOrderItemInput[] = params.selectedItems.map((item) => {
    const details = params.itemDetailsById[item.id]
    const unitPrice = parseVndToBigIntString(item.price)
    const quantity = Math.max(1, details?.quantity ?? item.quantity ?? 1)

    return {
      packageId: item.packageId || item.id,
      pricingId: item.pricingId || item.id,
      durationValue: null,
      durationUnit: null,
      startDate: details?.startDate || "",
      designServiceRequired: Boolean(details?.needDesign),
      adLinkUrl: details?.adLink || "",
      unitPrice,
      quantity,
    }
  })

  const subtotalBigInt = items.reduce((acc, it) => {
    const line = BigInt(it.unitPrice) * BigInt(it.quantity)
    return acc + line
  }, BigInt(0))

  const input: CreateAdOrderInput = {
    companyId: params.companyId ?? null,
    notes: params.notes ?? null,
    items,
  }

  return { input, subtotal: subtotalBigInt.toString() }
}
