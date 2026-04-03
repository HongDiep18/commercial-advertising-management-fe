import type { AdPackageFormConfig } from "@/api/ads-pricing/types"
import { z } from "zod"

export type OrderItemValues = {
  startDate: string
  endDate: string
  adLink: string
  needDesign: boolean
  files: File[]
  quantity: number
}

export type OrderFormValues = {
  company: string
  contact: string
  phone: string
  email: string
  notes: string
  items: OrderItemValues[]
}

const DEFAULT_FORM_CONFIG: AdPackageFormConfig = {
  requiresStartDate: true,
  requiresAdLink: true,
  requiresDesignService: true,
  requiresAssets: true,
}

export function buildAdItemSchema(config: AdPackageFormConfig = DEFAULT_FORM_CONFIG) {
  return z.object({
    startDate: config.requiresStartDate
      ? z.string().min(1, "adContact.startDateRequired")
      : z.string(),
    endDate: z.string(),
    adLink: z.string(),
    needDesign: z.boolean(),
    files: z.array(z.custom<File>()),
    quantity: z.number().int().min(1),
  })
}
