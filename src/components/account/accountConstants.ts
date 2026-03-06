import type { LucideIcon } from "lucide-react"
import { Gift, ImageIcon } from "lucide-react"

export const COUNTRY_VALUES = [
  "vietnam",
  "taiwan",
  "china",
  "singapore",
  "malaysia",
  "thailand",
  "other",
] as const

export const REGION_KEYS_BY_COUNTRY: Record<string, readonly string[]> = {
  vietnam: ["hcm", "hanoi", "danang", "binhduong", "dongnai", "other-vn"],
  taiwan: ["taipei", "taichung", "kaohsiung", "other-tw"],
  china: ["shanghai", "shenzhen", "guangzhou", "other-cn"],
  other: ["other-region"],
}

export const CONTRIBUTION_TYPE_CONFIG: Record<
  string,
  { label: string; icon: LucideIcon; color: string }
> = {
  registration: { label: "註冊禮包", icon: Gift, color: "text-primary bg-primary/10" },
  logo: { label: "上傳 Logo", icon: ImageIcon, color: "text-primary bg-primary/10" },
}

export const COUNTRY_NONE = "__none__"
