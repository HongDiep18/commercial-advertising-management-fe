"use client"

import type { AdminOrderDto } from "@/api/ad-orders-admin/types"
import { AdPackageLabel } from "@/components/admin/advertising/AdPackageLabel"
import { AdOrderPreviewButton } from "@/components/shared/AdOrderPreviewButton"
import Button from "@/components/ui/Button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog"
import TextColorBadge from "@/components/ui/TextColorBadge"
import { VndPrice } from "@/components/VndPrice"
import { CheckCircle2, Link2, Mail, Paperclip, Phone, X } from "lucide-react"
import { useTranslation } from "react-i18next"
import { formatDateTimeForLocale } from "@/utils/datetime"
import { addDuration } from "@/data/contactMockData"

type AdOrderDetailDialogProps = {
  order: AdminOrderDto | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function getDurationUnitLabel(unit: string | null, t: (key: string) => string): string {
  switch (unit) {
    case "DAY":
      return t("admin.advertising.pricingDialog.durationUnitDay")
    case "WEEK":
      return t("admin.advertising.pricingDialog.durationUnitWeek")
    case "MONTH":
      return t("admin.advertising.pricingDialog.durationUnitMonth")
    case "YEAR":
      return t("admin.advertising.pricingDialog.durationUnitYear")
    default:
      return unit ?? ""
  }
}

function getPricingModelLabel(model: string, t: (key: string) => string): string {
  switch (model) {
    case "DURATION":
      return t("admin.advertising.pricingDialog.pricingModelDuration")
    case "ONE_TIME":
      return t("admin.advertising.pricingDialog.pricingModelOneTime")
    case "PER_ACTION":
      return t("admin.advertising.pricingDialog.pricingModelPerAction")
    default:
      return model
  }
}

function getItemPricingLabel(
  item: AdminOrderDto["items"][number],
  t: (key: string) => string
): string {
  if (item.pricingModel !== "DURATION") {
    return getPricingModelLabel(item.pricingModel, t)
  }
  const value = item.durationValue
  const unitLabel = getDurationUnitLabel(item.durationUnit, t)
  if (!value || !unitLabel) return item.pricingName
  return `${value} ${unitLabel}`
}

function getOrderDisplayName(order: AdminOrderDto): string {
  return order.company?.nameVi ?? order.company?.nameCn ?? order.user.email
}

function getSubmittedAtLabel(order: AdminOrderDto, locale: string): string {
  return formatDateTimeForLocale(order.createdAt, locale)
}

export function AdOrderDetailDialog({ order, open, onOpenChange }: AdOrderDetailDialogProps) {
  const { t, i18n } = useTranslation()
  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-body-bg-dark relative max-h-[90vh] max-w-2xl overflow-y-auto">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground absolute top-3 right-3 h-8 w-8"
          onClick={() => onOpenChange(false)}
          aria-label={t("admin.advertising.closeDialog") || "Close"}
        >
          <X className="h-4 w-4" />
        </Button>

        <DialogHeader>
          <DialogTitle>{getOrderDisplayName(order)}</DialogTitle>
          <DialogDescription>
            {(t("admin.advertising.submittedOn") || "Submitted on") +
              " " +
              getSubmittedAtLabel(order, i18n.language)}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4 px-5">
          <div className="border-border grid gap-3 border-b pb-4 sm:grid-cols-2">
            {order.company?.contactName && (
              <div className="bg-body-bg-dark-foreground rounded-lg p-3">
                <p className="text-muted-foreground text-xs">
                  {t("admin.advertising.contact") || "Contact"}
                </p>
                <p className="text-sm font-medium">{order.company.contactName}</p>
              </div>
            )}

            <div className="bg-body-bg-dark-foreground rounded-lg p-3">
              <p className="text-muted-foreground text-xs">
                {t("admin.advertising.email") || "Email"}
              </p>
              <div className="flex items-center gap-2">
                <Mail className="text-muted-foreground h-4 w-4" />
                <p className="text-sm font-medium">{order.company?.email ?? order.user.email}</p>
              </div>
            </div>

            {order.company?.phone && (
              <div className="bg-body-bg-dark-foreground rounded-lg p-3">
                <p className="text-muted-foreground text-xs">
                  {t("admin.advertising.phone") || "Phone"}
                </p>
                <div className="flex items-center gap-2">
                  <Phone className="text-muted-foreground h-4 w-4" />
                  <p className="text-sm font-medium">{order.company.phone}</p>
                </div>
              </div>
            )}

            <div className="bg-body-bg-dark-foreground rounded-lg p-3">
              <p className="text-muted-foreground text-xs">
                {t("admin.advertising.packageManagementTable.category")}
              </p>
              {(() => {
                const rawTypes = order.items
                  .map((item) => item.categoryType)
                  .filter((type): type is string => Boolean(type))
                const uniqueTypes = Array.from(new Set(rawTypes))
                if (uniqueTypes.length === 0) {
                  return <p className="text-muted-foreground text-xs">-</p>
                }
                return (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {uniqueTypes.map((type) => (
                      <TextColorBadge key={type} colorKey={type}>
                        {t(`admin.advertising.adCategory.${type}`)}
                      </TextColorBadge>
                    ))}
                  </div>
                )
              })()}
            </div>
          </div>

          <div>
            <p className="text-muted-foreground mb-2 text-xs">
              {t("admin.advertising.selectedItems") || "Selected items"}
            </p>
            {order.items.map((item) => (
              <div
                key={item.id}
                className="bg-body-bg-dark-foreground mb-2 space-y-2 rounded-lg p-3"
              >
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      <AdPackageLabel
                        packageType={item.packageType}
                        packageMetadata={item.packageMetadata}
                        fallbackLabel={item.packageName}
                      />
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {getItemPricingLabel(item, t)}
                      {item.startDate && (
                        <>
                          {" • "}
                          {formatDateTimeForLocale(item.startDate, i18n.language)}
                          {item.durationValue && item.durationUnit && (
                            <>
                              {" → "}
                              {formatDateTimeForLocale(
                                addDuration(new Date(item.startDate), item.durationValue, item.durationUnit).toISOString(),
                                i18n.language
                              )}
                            </>
                          )}
                        </>
                      )}
                      {item.designServiceRequired
                        ? ` • ${t("admin.advertising.designService")}`
                        : ""}
                    </p>
                  </div>
                  <p className="text-sm font-medium">
                    <VndPrice value={item.price} />
                  </p>
                </div>

                {(item.adLinkUrl || item.assets.length > 0) && (
                  <div className="text-muted-foreground flex flex-wrap gap-3 text-xs">
                    {item.adLinkUrl && (
                      <a
                        href={item.adLinkUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-foreground inline-flex items-center gap-1 underline-offset-2 hover:underline"
                      >
                        <Link2 className="h-3.5 w-3.5" />
                        {t("adContact.adLink")}
                      </a>
                    )}
                    {item.assets.length > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <Paperclip className="h-3.5 w-3.5" />
                        {item.assets.length} {t("admin.advertising.assets") || "assets"}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-primary/5 rounded-lg p-4">
            <p className="text-muted-foreground text-sm">
              {t("admin.advertising.estimatedAmount") || "Estimated amount"}
            </p>
            <p className="text-xl font-bold">
              <VndPrice value={order.totalAmount} />
            </p>
          </div>

          <div className="flex gap-3 border-t py-5">
            <AdOrderPreviewButton
              orderId={order.id}
              labelKey="admin.advertising.previewOrder"
              labelDefault="Preview"
              variant="outline"
              className="flex-1 border border-gray-300!"
            />
            <Button className="bg-primary flex-1" variant="primary" asChild>
              <a href={`mailto:${order.company?.email ?? order.user.email}`}>
                <Mail className="mr-2 h-4 w-4" />
                {t("admin.advertising.sendEmail") || "Send email"}
              </a>
            </Button>
            {order.company?.phone ? (
              <Button
                variant="outline"
                className="hover:bg-header-red-dark/70! flex-1 border border-gray-300! !bg-transparent hover:text-white!"
                asChild
              >
                <a href={`tel:${order.company.phone}`}>
                  <Phone className="mr-2 h-4 w-4" />
                  {t("admin.advertising.call") || "Call"}
                </a>
              </Button>
            ) : (
              <Button
                variant="outline"
                className="flex-1 border border-gray-300! bg-transparent"
                disabled
              >
                <Phone className="mr-2 h-4 w-4" />
                {t("admin.advertising.call") || "Call"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
