"use client"

import { MapPin, Ruler, Phone, Mail, X } from "lucide-react"
import Button from "@/components/ui/Button"
import { useTranslation } from "react-i18next"

type Property = {
  id: string
  title: string
  type: string
  provinceName: string
  area: string
  areaUnit: string
  description: string
  images: string[]
  features: string[]
  contact: {
    name: string
    phone: string
    email: string
  }
}

type PropertyModalsProps = {
  contactProperty: Property | null
  detailProperty: Property | null
  getTypeName: (type: string, t: any) => string
  getTypeColor: (type: string) => string
  onCloseContact: () => void
  onCloseDetail: () => void
  onOpenContact: (id: string) => void
}

export default function PropertyModals({
  contactProperty,
  detailProperty,
  getTypeName,
  getTypeColor,
  onCloseContact,
  onCloseDetail,
  onOpenContact,
}: PropertyModalsProps) {
  const { t } = useTranslation()
  return (
    <>
      {contactProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onCloseContact}
          />
          <div className="relative bg-card rounded-xl border border-border shadow-xl max-w-md w-full p-6">
            <button
              onClick={onCloseContact}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-foreground mb-1">
              {t("property.modals.contactSeller")}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {contactProperty.title}
            </p>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 p-3 bg-[#E8E6E1] rounded-lg">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("property.modals.contactPerson")}</p>
                  <p className="font-medium text-foreground">
                    {contactProperty.contact.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-[#E8E6E1] rounded-lg">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("property.modals.phone")}</p>
                  <p className="font-medium text-foreground">
                    {contactProperty.contact.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-[#E8E6E1] rounded-lg">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">{t("property.modals.email")}</p>
                  <p className="font-medium text-foreground">
                    {contactProperty.contact.email}
                  </p>
                </div>
              </div>
            </div>

              {/* Inquiry Form */}
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder={t("property.modals.yourName")}
                  className="w-full px-3 py-2.5 border border-border rounded-lg bg-body-bg-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <input
                  type="email"
                  placeholder={t("property.modals.yourEmail")}
                  className="w-full px-3 py-2.5 border border-border rounded-lg bg-body-bg-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <textarea
                  rows={3}
                  placeholder={t("property.modals.message")}
                  className="w-full px-3 py-2.5 border border-border rounded-lg bg-body-bg-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
                <Button
                  className="w-full !bg-header-red-dark"
                  onClick={() => {
                    alert(t("property.modals.submitSuccess"))
                    onCloseContact()
                  }}
                >
                  {t("property.modals.submit")}
                </Button>
              </div>
          </div>
        </div>
      )}

      {detailProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onCloseDetail}
          />
          <div className="relative bg-card rounded-xl border border-border shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <button
              onClick={onCloseDetail}
              className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative aspect-[16/9] overflow-hidden">
              <img
                src={detailProperty.images[0] || "/placeholder.svg"}
                alt={detailProperty.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3">
                <span
                  className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${getTypeColor(
                    detailProperty.type
                  )}`}
                >
                  {getTypeName(detailProperty.type, t)}
                </span>
              </div>
            </div>

            <div className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-2">
                {detailProperty.title}
              </h2>

              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
                <MapPin className="w-4 h-4" />
                <span>{detailProperty.provinceName}</span>
              </div>

              <div className="mb-6">
                <div className="inline-flex items-center gap-2 p-3 bg-[#E8E6E1] rounded-lg">
                  <Ruler className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      {t("property.modals.area")}
                    </p>
                    <p className="font-bold text-foreground">
                      {detailProperty.area} {detailProperty.areaUnit}
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="font-semibold text-foreground mb-2">
                {t("property.modals.description")}
              </h3>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                {detailProperty.description}
              </p>

              <h3 className="font-semibold text-foreground mb-2">
                {t("property.modals.features")}
              </h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {detailProperty.features.map((f) => (
                  <span
                    key={f}
                    className="px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-full"
                  >
                    {f}
                  </span>
                ))}
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-6">
                <p className="text-sm text-amber-700">
                  {t("property.modals.addressNotice")}
                </p>
              </div>

              <Button
                className="w-full !bg-header-red-dark"
                onClick={() => {
                  onCloseDetail()
                  onOpenContact(detailProperty.id)
                }}
              >
                <Phone className="w-4 h-4 mr-2" />
                {t("property.modals.contactForDetail")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}