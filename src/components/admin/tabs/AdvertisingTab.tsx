"use client"

import Card, { CardContent } from "@/components/ui/Card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser } from "@/contexts/user-context"
import { FeatureKey } from "@/types"
import { DollarSign, Megaphone, TrendingUp } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { AdPackageManagement } from "../ad-package-management"
import { useAdminData } from "../AdminDataContext"
import { AdOrdersManagement } from "../ad-orders-management/AdOrdersManagement"

export function AdvertisingTab() {
  const { t } = useTranslation()
  const { canUseFeature } = useUser()
  const { adSubmissions } = useAdminData()
  const [viewMode, setViewMode] = useState<"orders" | "packages">("orders")
  const canUseAdPackageManagement = canUseFeature(FeatureKey.AdPackageManagement)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 pt-6">
            <DollarSign className="mb-2 h-5 w-5 text-green-600" />
            <p className="text-xl font-bold">NT$2,450,000</p>
            <p className="text-muted-foreground text-xs">{t("admin.advertising.monthlyRevenue")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 pt-6">
            <Megaphone className="text-primary mb-2 h-5 w-5" />
            <p className="text-xl font-bold">{adSubmissions.length}</p>
            <p className="text-muted-foreground text-xs">{t("admin.advertising.adOrders")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 pt-6">
            <TrendingUp className="mb-2 h-5 w-5 text-blue-600" />
            <p className="text-xl font-bold">+18%</p>
            <p className="text-muted-foreground text-xs">{t("admin.advertising.monthlyGrowth")}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={viewMode}
        onValueChange={(val) => setViewMode(val as "orders" | "packages")}
        className="mt-2"
      >
        <TabsList variant="line">
          <TabsTrigger value="orders">
            {t("admin.advertising.orderHistory") || "Ad order history"}
          </TabsTrigger>
          {canUseAdPackageManagement && (
            <TabsTrigger value="packages">
              {t("admin.advertising.packageManagementTab") || "Ad package management"}
            </TabsTrigger>
          )}
        </TabsList>
      </Tabs>

      {viewMode === "packages" && canUseAdPackageManagement && <AdPackageManagement />}
      {viewMode === "orders" && <AdOrdersManagement />}
    </div>
  )
}
