import { Monitor, BookOpen, ShoppingBag } from "lucide-react"
import { tabConfigBase } from "../data/contactMockData"

export type TabType = "platform" | "directory" | "product"

export const getTabConfig = (t: (key: string) => string) => ({
  platform: {
    title: t("adContact.tabs.platform.title"),
    description: t("adContact.tabs.platform.description"),
    icon: Monitor,
    contact: {
      phone: tabConfigBase.platform.contact.phone,
      email: tabConfigBase.platform.contact.email,
    },
  },
  directory: {
    title: t("adContact.tabs.directory.title"),
    description: t("adContact.tabs.directory.description"),
    icon: BookOpen,
    contact: {
      phone: tabConfigBase.directory.contact.phone,
      email: tabConfigBase.directory.contact.email,
    },
  },
  product: {
    title: t("adContact.tabs.product.title"),
    description: t("adContact.tabs.product.description"),
    icon: ShoppingBag,
    contact: {
      phone: tabConfigBase.product.contact.phone,
      email: tabConfigBase.product.contact.email,
    },
  },
})
