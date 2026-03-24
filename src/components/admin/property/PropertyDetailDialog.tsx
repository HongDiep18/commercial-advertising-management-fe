"use client"

import { useState } from "react"
import { Loader2, MapPin } from "lucide-react"
import { useTranslation } from "react-i18next"
import Lightbox from "yet-another-react-lightbox"
import { useAdminPropertyDetail } from "@/api/properties/hooks"
import { formatDateTimeForLocale } from "@/utils/datetime"
import Button from "@/components/ui/Button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog"
import { StatusBadge } from "../StatusBadge"
import { getPropertyTypeLabel } from "./helpers"

type PropertyDetailDialogProps = {
  propertyId: string | null
  open: boolean
  onClose: () => void
}

export function PropertyDetailDialog({ propertyId, open, onClose }: PropertyDetailDialogProps) {
  const { t, i18n } = useTranslation()
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const {
    data: property,
    isLoading,
    isError,
  } = useAdminPropertyDetail(propertyId ?? "", open && Boolean(propertyId))

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-[calc(100%-2rem)] overscroll-contain sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {t("admin.property.detailDialogTitle", {
              defaultValue: "Property details",
            })}
          </DialogTitle>
          <DialogDescription>
            {t("admin.property.detailDialogDescription", {
              defaultValue: "Review full property information and contact inquiries.",
            })}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="text-muted-foreground flex items-center gap-2 p-6 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            {t("admin.property.loadingDetail", {
              defaultValue: "Loading property details…",
            })}
          </div>
        ) : isError || !property ? (
          <div className="space-y-3 p-6">
            <p className="text-destructive text-sm">
              {t("admin.property.loadDetailError", {
                defaultValue: "Failed to load property details. Please close and try again.",
              })}
            </p>
            <div className="flex justify-end">
              <Button type="button" variant="outline" onClick={onClose}>
                {t("common.close", { defaultValue: "Close" })}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 p-6 pt-2">
            <section className="space-y-3">
              <div className="space-y-2">
                <h3 className="text-foreground text-lg font-semibold">{property.title}</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={property.publicationStatus} />
                  <StatusBadge status={property.availabilityStatus} />
                  <span className="text-muted-foreground rounded-full border px-2 py-0.5 text-xs font-medium">
                    {getPropertyTypeLabel(property.type, t)}
                  </span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-muted/40 rounded-lg border p-3">
                  <p className="text-muted-foreground text-xs">{t("admin.property.price")}</p>
                  <p className="text-foreground text-sm font-semibold">{property.price}</p>
                </div>
                <div className="bg-muted/40 rounded-lg border p-3">
                  <p className="text-muted-foreground text-xs">{t("admin.property.views")}</p>
                  <p className="text-foreground text-sm font-semibold tabular-nums">
                    {new Intl.NumberFormat(i18n.language).format(property.views)}
                  </p>
                </div>
                <div className="bg-muted/40 rounded-lg border p-3">
                  <p className="text-muted-foreground text-xs">
                    {t("admin.property.detailArea", { defaultValue: "Area" })}
                  </p>
                  <p className="text-foreground text-sm font-semibold">
                    {new Intl.NumberFormat(i18n.language).format(property.areaValue)} {property.areaUnit}
                  </p>
                </div>
                <div className="bg-muted/40 rounded-lg border p-3">
                  <p className="text-muted-foreground text-xs">
                    {t("admin.property.contactInquiryCount", {
                      defaultValue: "Contact inquiries",
                    })}
                  </p>
                  <p className="text-foreground text-sm font-semibold tabular-nums">
                    {new Intl.NumberFormat(i18n.language).format(property.contactInquiryCount)}
                  </p>
                </div>
              </div>

              <div className="text-muted-foreground flex items-start gap-2 rounded-lg border p-3 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <div>
                  <p className="font-medium">{property.provinceName || property.province}</p>
                  <p>{property.fullAddress}</p>
                </div>
              </div>

              <div>
                <p className="text-foreground mb-1 text-sm font-medium">
                  {t("admin.property.formDescriptionLabel", { defaultValue: "Description" })}
                </p>
                <p className="text-muted-foreground text-sm whitespace-pre-line">{property.description}</p>
              </div>

              <div>
                <p className="text-foreground mb-2 text-sm font-medium">
                  {t("admin.property.formFeaturesLabel", { defaultValue: "Features" })}
                </p>
                {property.features.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {property.features.map((feature) => (
                      <span
                        key={feature}
                        className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    {t("admin.property.detailNoFeatures", {
                      defaultValue: "No features listed.",
                    })}
                  </p>
                )}
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="text-foreground text-sm font-semibold">
                {t("admin.property.formImagesLabel", { defaultValue: "Images" })}
              </h4>
              {property.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {property.images.map((imageUrl, index) => (
                    <button
                      type="button"
                      key={`${imageUrl}-${index}`}
                      className="group overflow-hidden rounded-md border"
                      onClick={() => {
                        setLightboxIndex(index)
                        setLightboxOpen(true)
                      }}
                    >
                      <img
                        src={imageUrl}
                        alt={`${property.title} ${index + 1}`}
                        className="h-28 w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  {t("admin.property.detailNoImages", {
                    defaultValue: "No images.",
                  })}
                </p>
              )}
              <Lightbox
                open={lightboxOpen}
                close={() => setLightboxOpen(false)}
                index={lightboxIndex}
                on={{
                  view: ({ index }) => setLightboxIndex(index),
                }}
                slides={property.images.map((imageUrl) => ({ src: imageUrl }))}
              />
            </section>

            <section className="space-y-3">
              <h4 className="text-foreground text-sm font-semibold">
                {t("admin.property.formLegalDocumentsLabel", {
                  defaultValue: "Legal Documents",
                })}
              </h4>
              {property.legalDocuments.length > 0 ? (
                <div className="space-y-2">
                  {property.legalDocuments.map((document) => (
                    <a
                      key={document.id}
                      href={document.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:bg-muted/50 flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                    >
                      <span className="text-foreground truncate">{document.fileName}</span>
                      <span className="text-muted-foreground ml-2 shrink-0 text-xs">
                        {formatDateTimeForLocale(document.createdAt, i18n.language)}
                      </span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  {t("admin.property.detailNoLegalDocuments", {
                    defaultValue: "No legal documents.",
                  })}
                </p>
              )}
            </section>

            <section className="space-y-3">
              <h4 className="text-foreground text-sm font-semibold">
                {t("admin.property.contactInquiryList", {
                  defaultValue: "Contact inquiries",
                })}
              </h4>
              {property.contactInquiries.length > 0 ? (
                <div className="space-y-2">
                  {property.contactInquiries.map((inquiry) => (
                    <div key={inquiry.id} className="space-y-2 rounded-md border p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-foreground text-sm font-medium">{inquiry.name}</p>
                          <p className="text-muted-foreground text-xs">{inquiry.email}</p>
                        </div>
                        <p className="text-muted-foreground text-xs">
                          {formatDateTimeForLocale(inquiry.createdAt, i18n.language)}
                        </p>
                      </div>
                      {inquiry.message ? (
                        <p className="text-muted-foreground text-sm whitespace-pre-line">
                          {inquiry.message}
                        </p>
                      ) : (
                        <p className="text-muted-foreground text-sm italic">
                          {t("admin.property.detailEmptyMessage", {
                            defaultValue: "No message provided.",
                          })}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  {t("admin.property.detailNoContactInquiries", {
                    defaultValue: "No contact inquiries yet.",
                  })}
                </p>
              )}
            </section>

            <div className="flex justify-end border-t pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                {t("common.close", { defaultValue: "Close" })}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
