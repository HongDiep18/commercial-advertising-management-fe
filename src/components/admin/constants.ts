import type { LucideIcon } from "lucide-react"
import {
  LayoutDashboard,
  Building2,
  ShoppingBag,
  Newspaper,
  Megaphone,
  MapPin,
  UserCog,
} from "lucide-react"

export const ADMIN_TABS: Array<{ id: string; icon: LucideIcon }> = [
  { id: "dashboard", icon: LayoutDashboard },
  { id: "companies", icon: Building2 },
  { id: "store", icon: ShoppingBag },
  { id: "news", icon: Newspaper },
  { id: "advertising", icon: Megaphone },
  { id: "property", icon: MapPin },
  { id: "users", icon: UserCog },
]
