"use client"

import {
  useAvailableAdPackages,
  useCreateAdPackagePricing,
  useDeleteAdPackagePricing,
  useUpdateAdPackagePricing,
} from "@/api/ads-pricing/hooks"
import type {
  AdminCreatePricingPayload,
  AdminUpdatePricingPayload,
} from "@/api/ads-pricing/types"
import Button from "@/components/ui/Button"
import Card, { CardContent } from "@/components/ui/Card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table"
import { useUser } from "@/contexts/user-context"
import { FeatureKey } from "@/types"
import { Pencil } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { AdPackageLabel, getAdPackageLabelText } from "@/components/admin/advertising/AdPackageLabel"
import type { EditablePricingRow, SaveStatus } from "../types"
import { DurationUnitType, PricingModelType } from "../types"
import { AdPackagePricingDialog } from "./AdPackagePricingDialog"

export function AdPackageManagement() {
  const { t } = useTranslation()
  const { canUseFeature } = useUser()

  const [editingPackageId, setEditingPackageId] = useState<string | null>(null)
  const [editingPackageName, setEditingPackageName] = useState<string>("")
  const [editingRows, setEditingRows] = useState<EditablePricingRow[]>([])

  const {
    data: catalog,
    isLoading: isCatalogLoading,
    isError: isCatalogError,
  } = useAvailableAdPackages()

  const createMutation = useCreateAdPackagePricing()
  const updateMutation = useUpdateAdPackagePricing()
  const deleteMutation = useDeleteAdPackagePricing()

  if (!canUseFeature(FeatureKey.AdPackageManagement)) {
    return (
      <Card>
        <CardContent className="text-muted-foreground p-6 text-sm">
          {t("admin.advertising.superAdminOnly") ||
            "This section is only available to super admins."}
        </CardContent>
      </Card>
    )
  }

  const handleOpenPackageEditor = (pkgId: string, pkgName: string) => {
    if (!catalog) return
    const pkg = catalog.flatMap((cat) => cat.packages).find((p) => p.id === pkgId)
    if (!pkg) return
    const initialRows: EditablePricingRow[] = pkg.pricing.map((p) => ({
      id: p.id,
      pricingModel: p.pricingModel as never,
      basePrice: String(p.basePrice),
      discountRate: String(p.discountRate),
      durationValue: p.durationValue != null ? String(p.durationValue) : "",
      durationUnit: (p.durationUnit ?? "") as never,
      isActive: p.isActive,
      isNew: false,
      saveStatus: "idle",
    }))
    setEditingPackageId(pkgId)
    setEditingPackageName(pkgName)
    setEditingRows(initialRows)
  }

  const handleDeletePricingRow = (row: EditablePricingRow) => {
    if (row.isNew) {
      setEditingRows((prev) => prev.filter((r) => r.id !== row.id))
      return
    }
    deleteMutation.mutate(row.id, {
      onSuccess: () => {
        setEditingRows((prev) => prev.filter((r) => r.id !== row.id))
        toast.success(t("admin.advertising.pricingDeleteSuccess") || "Pricing option deleted.")
      },
      onError: () => {
        toast.error(t("admin.advertising.pricingDeleteError") || "Failed to delete pricing option.")
      },
    })
  }

  const handleRowChange = (
    rowId: string,
    field: keyof EditablePricingRow,
    value: string | boolean
  ) => {
    setEditingRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) {
          return row
        }
        const next: EditablePricingRow = { ...row, [field]: value as never }
        const nextPricingModel = field === "pricingModel" ? String(value) : row.pricingModel
        const isDurationModel = nextPricingModel.toUpperCase() === "DURATION"
        if (!isDurationModel) {
          next.durationValue = ""
          next.durationUnit = ""
        }
        return next
      })
    )
  }

  const buildPayloadFromRow = (
    row: EditablePricingRow
  ): { create: AdminCreatePricingPayload; update: AdminUpdatePricingPayload } => {
    const basePrice = Number(row.basePrice) || 0
    const discountRate = row.discountRate === "" ? 0 : Number(row.discountRate)
    const hasDurationModel = row.pricingModel.toUpperCase() === "DURATION"
    const durationValue =
      !hasDurationModel || row.durationValue.trim() === ""
        ? null
        : Number(row.durationValue) || null
    const durationUnit =
      !hasDurationModel || row.durationUnit.trim() === ""
        ? null
        : (row.durationUnit.trim() as string | null)
    return {
      create: {
        pricingModel: row.pricingModel,
        basePrice,
        discountRate,
        durationValue,
        durationUnit,
        isActive: row.isActive,
      },
      update: {
        pricingModel: row.pricingModel,
        basePrice,
        discountRate,
        durationValue,
        durationUnit,
        isActive: row.isActive,
      },
    }
  }

  const handleSaveRow = (row: EditablePricingRow) => {
    if (!editingPackageId) return
    const setStatus = (rowId: string, status: SaveStatus) => {
      setEditingRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, saveStatus: status } : r)))
    }
    const scheduleReset = (rowId: string) => {
      window.setTimeout(() => {
        setStatus(rowId, "idle")
      }, 5000)
    }
    const { create, update } = buildPayloadFromRow(row)
    if (row.isNew) {
      setStatus(row.id, "loading")
      createMutation.mutate(
        { packageId: editingPackageId, payload: create },
        {
          onSuccess: (created) => {
            setEditingRows((prev) =>
              prev.map((r) => {
                if (r.id !== row.id) {
                  return r
                }
                return {
                  ...r,
                  id: created.id,
                  pricingModel: created.pricingModel as never,
                  basePrice: String(created.basePrice),
                  discountRate: String(created.discountRate),
                  durationValue: created.durationValue != null ? String(created.durationValue) : "",
                  durationUnit: (created.durationUnit ?? "") as never,
                  isActive: created.isActive,
                  isNew: false,
                  saveStatus: "success",
                }
              })
            )
            scheduleReset(created.id)
          },
          onError: () => {
            setStatus(row.id, "error")
            scheduleReset(row.id)
          },
        }
      )
      return
    }
    setStatus(row.id, "loading")
    updateMutation.mutate(
      { pricingId: row.id, payload: update },
      {
        onSuccess: () => {
          setStatus(row.id, "success")
          scheduleReset(row.id)
        },
        onError: () => {
          setStatus(row.id, "error")
          scheduleReset(row.id)
        },
      }
    )
  }

  const isRowDirty = (row: EditablePricingRow): boolean => {
    if (!editingPackageId || !catalog) {
      return row.isNew
    }
    if (row.isNew) {
      return (
        row.basePrice !== "" ||
        row.discountRate !== "" ||
        row.durationValue !== "" ||
        row.durationUnit !== "" ||
        row.isActive !== true
      )
    }
    const pkg = catalog.flatMap((cat) => cat.packages).find((p) => p.id === editingPackageId)
    const original = pkg?.pricing.find((p) => p.id === row.id)
    if (!original) return true
    const origDurationValue = original.durationValue != null ? String(original.durationValue) : ""
    const origDurationUnit = original.durationUnit ?? ""
    return (
      row.pricingModel !== original.pricingModel ||
      Number(row.basePrice || "0") !== original.basePrice ||
      Number(row.discountRate || "0") !== original.discountRate ||
      row.durationValue !== origDurationValue ||
      row.durationUnit !== origDurationUnit ||
      row.isActive !== original.isActive
    )
  }

  const handleAddRow = () => {
    setEditingRows((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        pricingModel: PricingModelType.DURATION,
        basePrice: "",
        discountRate: "",
        durationValue: "",
        durationUnit: DurationUnitType.MONTH,
        isActive: true,
        isNew: true,
        saveStatus: "idle",
      },
    ])
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        {isCatalogLoading ? (
          <div className="text-muted-foreground p-6 text-sm">Loading pricing...</div>
        ) : isCatalogError || !catalog ? (
          <div className="text-destructive p-6 text-sm">
            {t("admin.advertising.pricingError") ||
              "Failed to load pricing. Please try again later."}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.advertising.packageManagementTable.category")}</TableHead>
                <TableHead>{t("admin.advertising.packageManagementTable.package")}</TableHead>
                <TableHead>
                  {t("admin.advertising.packageManagementTable.pricingVariants")}
                </TableHead>
                <TableHead>{t("admin.advertising.packageManagementTable.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {catalog.map((cat) => {
                if (cat.packages.length === 0) {
                  return null
                }
                return cat.packages.map((pkg, index) => {
                  const packageLabel = getAdPackageLabelText({
                    packageType: pkg.type,
                    packageMetadata: pkg.metadata,
                    fallbackLabel: pkg.name,
                    t,
                  })
                  return (
                    <TableRow key={pkg.id}>
                      <TableCell className="font-medium">
                        {index === 0 ? t(`admin.advertising.adCategory.${cat.type}`) : ""}
                      </TableCell>
                      <TableCell>
                        <AdPackageLabel
                          packageType={pkg.type}
                          packageMetadata={pkg.metadata}
                          fallbackLabel={pkg.name}
                        />
                      </TableCell>
                      <TableCell>{pkg.pricing.length}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-header-red-dark! hover:text-white!"
                          onClick={() => handleOpenPackageEditor(pkg.id, packageLabel)}
                          aria-label="Edit package pricing"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      <AdPackagePricingDialog
        open={editingPackageId !== null}
        packageName={editingPackageName}
        rows={editingRows}
        onClose={() => {
          setEditingPackageId(null)
          setEditingRows([])
        }}
        onAddRow={handleAddRow}
        onChangeRow={handleRowChange}
        onSaveRow={handleSaveRow}
        onDeleteRow={handleDeletePricingRow}
        isRowDirty={isRowDirty}
        title={t("admin.advertising.editPricing") || "Edit pricing"}
        description={
          t("admin.advertising.pricingDialogDescription") ||
          "Configure pricing model, duration, and amounts for this ad package."
        }
        addLabel={t("admin.advertising.addPricing") || "Add pricing"}
      />
    </div>
  )
}
