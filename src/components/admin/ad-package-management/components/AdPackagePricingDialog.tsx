import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/shadcn-dialog/dialog"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/shadcn-popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/shadcn-select"
import { CheckCircle2, Loader2, Plus, Trash2, XCircle } from "lucide-react"
import React from "react"
import { useTranslation } from "react-i18next"
import type { EditablePricingRow } from "../types"
import { DurationUnitType, PricingModelType } from "../types"

type AdPackagePricingDialogProps = {
  open: boolean
  packageName: string
  rows: EditablePricingRow[]
  onClose: () => void
  onAddRow: () => void
  onChangeRow: (rowId: string, field: keyof EditablePricingRow, value: string | boolean) => void
  onSaveRow: (row: EditablePricingRow) => void
  onDeleteRow: (row: EditablePricingRow) => void
  isRowDirty: (row: EditablePricingRow) => boolean
  title: string
  description: string
  addLabel: string
}

export function AdPackagePricingDialog({
  open,
  packageName,
  rows,
  onClose,
  onAddRow,
  onChangeRow,
  onSaveRow,
  onDeleteRow,
  isRowDirty,
  title,
  description,
  addLabel,
}: AdPackagePricingDialogProps) {
  const { t } = useTranslation()
  const [confirmDeleteRowId, setConfirmDeleteRowId] = React.useState<string | null>(null)

  const pricingModelOptions: ReadonlyArray<{ value: PricingModelType; label: string }> = [
    {
      value: PricingModelType.DURATION,
      label: t("admin.advertising.pricingDialog.pricingModelDuration") || "Duration",
    },
    {
      value: PricingModelType.ONE_TIME,
      label: t("admin.advertising.pricingDialog.pricingModelOneTime") || "One-time",
    },
  ]

  const durationUnitOptions: ReadonlyArray<{ value: DurationUnitType; label: string }> = [
    {
      value: DurationUnitType.DAY,
      label: t("admin.advertising.pricingDialog.durationUnitDay") || "Day",
    },
    {
      value: DurationUnitType.WEEK,
      label: t("admin.advertising.pricingDialog.durationUnitWeek") || "Week",
    },
    {
      value: DurationUnitType.MONTH,
      label: t("admin.advertising.pricingDialog.durationUnitMonth") || "Month",
    },
    {
      value: DurationUnitType.YEAR,
      label: t("admin.advertising.pricingDialog.durationUnitYear") || "Year",
    },
  ]
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose()
        }
      }}
    >
      <DialogContent className="bg-body-bg-dark max-w-[calc(100%-3rem)] p-6 sm:max-w-4xl sm:p-8">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          {packageName ? (
            <div className="text-muted-foreground border-foreground/10 bg-foreground/5 inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm">
              <span className="text-foreground/70 font-medium">
                {t("admin.advertising.pricingDialog.packageLabel") || "Package"}
              </span>
              <span className="text-foreground font-semibold">{packageName}</span>
            </div>
          ) : null}
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-foreground text-base font-semibold">
                {t("admin.advertising.pricingDialog.pricingItemsTitle") || "Pricing items"}
              </div>
              <div className="text-muted-foreground text-xs">
                {t("admin.advertising.pricingDialog.pricingItemsCount", { count: rows.length }) ||
                  `${rows.length} item${rows.length === 1 ? "" : "s"}`}
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={onAddRow}>
              <Plus className="mr-1.5 h-4 w-4" />
              {addLabel}
            </Button>
          </div>
          <div className="max-h-[55vh] overflow-y-auto pr-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    {t("admin.advertising.pricingDialog.tableHeaderPricingModel") ||
                      "Pricing Model"}
                  </TableHead>
                  <TableHead>
                    {t("admin.advertising.pricingDialog.tableHeaderDuration") || "Duration"}
                  </TableHead>
                  <TableHead>
                    {t("admin.advertising.pricingDialog.tableHeaderBasePrice") ||
                      "Base Price (VND)"}
                  </TableHead>
                  <TableHead>
                    {t("admin.advertising.pricingDialog.tableHeaderDiscountRate") || "Discount %"}
                  </TableHead>
                  <TableHead>
                    {t("admin.advertising.pricingDialog.tableHeaderActive") || "Active"}
                  </TableHead>
                  <TableHead className="text-center">
                    {t("admin.advertising.pricingDialog.tableHeaderActions") || "Actions"}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Select
                        value={row.pricingModel || undefined}
                        onValueChange={(value) => onChangeRow(row.id, "pricingModel", value)}
                      >
                        <SelectTrigger className="w-[120px] justify-between">
                          <SelectValue
                            placeholder={
                              t("admin.advertising.pricingDialog.selectPricingModelPlaceholder") ||
                              "Select model..."
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {row.pricingModel === PricingModelType.PER_ACTION ? (
                            <SelectItem value={PricingModelType.PER_ACTION} disabled>
                              {t("admin.advertising.pricingDialog.pricingModelPerAction") ||
                                "Per action"}
                            </SelectItem>
                          ) : null}
                          {pricingModelOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="w-[200px]">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          placeholder={
                            t("admin.advertising.pricingDialog.durationValuePlaceholder") || "Value"
                          }
                          value={row.durationValue}
                          className="min-w-[40px] flex-1"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            onChangeRow(row.id, "durationValue", e.target.value)
                          }
                          disabled={row.pricingModel.toUpperCase() !== PricingModelType.DURATION}
                        />
                        <Select
                          value={row.durationUnit || undefined}
                          onValueChange={(value) => onChangeRow(row.id, "durationUnit", value)}
                          disabled={row.pricingModel !== PricingModelType.DURATION}
                        >
                          <SelectTrigger className="w-[90px] shrink-0 justify-between">
                            <SelectValue
                              placeholder={
                                t("admin.advertising.pricingDialog.durationUnitPlaceholder") ||
                                "Unit"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {durationUnitOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                    <TableCell className="w-[220px]">
                      <Input
                        type="number"
                        min={0}
                        value={row.basePrice}
                        className="w-full"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          onChangeRow(row.id, "basePrice", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell className="w-[140px]">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={row.discountRate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          onChangeRow(row.id, "discountRate", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <input
                          id={`pricing-active-${row.id}`}
                          type="checkbox"
                          className="h-4 w-6"
                          checked={row.isActive}
                          onChange={(e) => onChangeRow(row.id, "isActive", e.target.checked)}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="hover:bg-header-red-dark! w-[60px] justify-center hover:text-white!"
                          onClick={() => onSaveRow(row)}
                          aria-label="Save pricing row"
                          disabled={row.saveStatus === "loading" || !isRowDirty(row)}
                        >
                          {row.saveStatus === "loading" && (
                            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                          )}
                          {row.saveStatus === "success" && (
                            <CheckCircle2 className="mr-1 h-4 w-4 text-green-600" />
                          )}
                          {row.saveStatus === "error" && (
                            <XCircle className="text-destructive mr-1 h-4 w-4" />
                          )}
                          {row.saveStatus === "idle" &&
                            (t("admin.advertising.pricingDialog.saveButton") || "Save")}
                        </Button>
                        {row.isNew ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="hover:bg-destructive/10 text-destructive w-[50px] justify-center"
                            aria-label="Delete pricing row"
                            onClick={() => onDeleteRow(row)}
                          >
                            <Trash2 className="mr-1 h-4 w-4" />
                          </Button>
                        ) : (
                          <Popover
                            open={confirmDeleteRowId === row.id}
                            onOpenChange={(nextOpen) => {
                              setConfirmDeleteRowId(nextOpen ? row.id : null)
                            }}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="hover:bg-destructive/10 text-destructive w-[50px] justify-center"
                                aria-label="Delete pricing row"
                              >
                                <Trash2 className="mr-1 h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-80">
                              <PopoverHeader>
                                <PopoverTitle>
                                  {t("admin.advertising.pricingDeleteConfirmTitle") ||
                                    "Delete pricing?"}
                                </PopoverTitle>
                                <PopoverDescription>
                                  {t("admin.advertising.pricingDeleteConfirmDescription") ||
                                    "This action cannot be undone."}
                                </PopoverDescription>
                              </PopoverHeader>
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  type="button"
                                  onClick={() => setConfirmDeleteRowId(null)}
                                >
                                  {t("admin.advertising.pricingDeleteCancel") || "Cancel"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  type="button"
                                  className="text-destructive hover:bg-destructive/10"
                                  onClick={() => {
                                    setConfirmDeleteRowId(null)
                                    onDeleteRow(row)
                                  }}
                                >
                                  {t("admin.advertising.pricingDeleteConfirmAction") || "Delete"}
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
