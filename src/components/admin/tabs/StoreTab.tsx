"use client"

import { useTranslation } from "react-i18next"
import { CheckCircle2, Package, Pencil, Trash2, XCircle } from "lucide-react"
import Button from "@/components/ui/Button"
import Card, { CardContent } from "@/components/ui/Card"
import { StatusBadge } from "../StatusBadge"
import { useAdminData } from "../AdminDataContext"

export function StoreTab() {
  const { t } = useTranslation()
  const { products } = useAdminData()
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {t("admin.store.productsCount", { count: products.length })}
        </p>
        <Button size="sm" variant="primary">
          <Package className="mr-1.5 h-4 w-4" />
          {t("admin.store.addProduct")}
        </Button>
      </div>

      <Card>
        <CardContent className="!p-0 !pt-5">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-border bg-body-table-dark-hover border-b border-gray-300">
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                    {t("admin.store.productName")}
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                    {t("admin.store.category")}
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                    {t("admin.store.price")}
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                    {t("admin.store.shopifySync")}
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                    {t("admin.store.status")}
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                    {t("admin.store.actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-border/50 hover:bg-muted/20 hover:bg-body-table-dark-hover border-b"
                  >
                    <td className="text-foreground px-4 py-3 text-sm font-medium">
                      {product.name}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">{product.category}</td>
                    <td className="px-4 py-3 text-sm font-medium">{product.price}</td>
                    <td className="px-4 py-3">
                      {product.shopifySync ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle2 className="h-3 w-3" />
                          {t("admin.store.synced")}
                        </span>
                      ) : (
                        <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                          <XCircle className="h-3 w-3" />
                          {t("admin.store.notSynced")}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={product.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:!bg-header-red-dark h-8 hover:!text-white"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:!bg-header-red-dark h-8 hover:!text-white"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
