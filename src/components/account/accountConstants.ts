import type { LucideIcon } from "lucide-react"
import { Gift, ImageIcon } from "lucide-react"
import { REGION_KEYS_BY_COUNTRY, COUNTRY_NONE } from "@/constants/location"

export { REGION_KEYS_BY_COUNTRY, COUNTRY_NONE }

export const CONTRIBUTION_TYPE_CONFIG: Record<
  string,
  { label: string; icon: LucideIcon; color: string }
> = {
  registration: { label: "註冊禮包", icon: Gift, color: "text-primary bg-primary/10" },
  logo: { label: "上傳 Logo", icon: ImageIcon, color: "text-primary bg-primary/10" },
}
