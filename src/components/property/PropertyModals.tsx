"use client"

import { MapPin, Ruler, Phone, X } from "lucide-react"
import Button from "@/components/ui/Button"
import { useTranslation } from "react-i18next"
import { useState } from "react"
import type { TFunction } from "i18next"
import { useCreatePropertyContactInquiry } from "@/api/properties/hooks"
import type { PropertyResponse } from "@/api/properties/types"

type PropertyModalsProps = {
  contactProperty: PropertyResponse | null
  detailProperty: PropertyResponse | null
  getTypeName: (type: string, t: TFunction) => string
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
  const { create, isPending } = useCreatePropertyContactInquiry()

  const [showToast, setShowToast] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  })

  const [errors, setErrors] = useState({
    name: "",
    email: "",
  })

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleSubmit = async () => {
    if (!contactProperty) return

    const newErrors = {
      name: form.name.trim()
        ? ""
        : t("property.modals.nameRequired"),

      email: form.email.trim()
        ? isValidEmail(form.email)
          ? ""
          : t("property.modals.emailInvalid")
        : t("property.modals.emailRequired"),
    }

    setErrors(newErrors)

    if (newErrors.name || newErrors.email) return

    try {
      setSubmitError("")
      await create({
        id: contactProperty.id,
        payload: {
          name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim() || undefined,
        },
      })

      setShowToast(true)
      onCloseContact()
      setTimeout(() => setShowToast(false), 4000)
      setForm({ name: "", email: "", message: "" })
    } catch (error) {
      const status =
        typeof error === "object" && error && "status" in error
          ? Number((error as { status?: number }).status)
          : undefined

      if (status === 401 || status === 403) {
        setSubmitError(
          t("property.modals.authRequired", {
            defaultValue: "Please sign in to send a contact inquiry.",
          })
        )
        return
      }

      setSubmitError(
        t("property.modals.submitError", {
          defaultValue: "Failed to submit inquiry. Please try again.",
        })
      )
    }
  }

  return (
    <>
      {/* CONTACT MODAL */}
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

            <div className="space-y-3">
              {/* NAME */}
              <div>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    const value = e.target.value
                    setForm((prev) => ({ ...prev, name: value }))
                    setErrors((prev) => ({
                      ...prev,
                      name: value.trim() ? "" : t("property.modals.nameRequired"),
                    }))
                  }}
                  placeholder={t("property.modals.yourName")}
                  className="w-full px-3 py-2.5 border border-border rounded-lg bg-body-bg-dark text-sm"
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                )}
              </div>

              {/* EMAIL */}
              <div>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => {
                    const value = e.target.value
                    setForm((prev) => ({ ...prev, email: value }))
                    setErrors((prev) => ({
                      ...prev,
                      email: value.trim()
                        ? isValidEmail(value)
                          ? ""
                          : t("property.modals.emailInvalid")
                        : t("property.modals.emailRequired"),
                    }))
                  }}
                  placeholder={t("property.modals.yourEmail")}
                  className="w-full px-3 py-2.5 border border-border rounded-lg bg-body-bg-dark text-sm"
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                )}
              </div>

              {/* MESSAGE */}
              <textarea
                rows={3}
                value={form.message}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    message: e.target.value,
                  }))
                }
                placeholder={t("property.modals.message")}
                className="w-full px-3 py-2.5 border border-border rounded-lg bg-body-bg-dark text-sm resize-none"
              />

              <Button
                className="w-full !bg-header-red-dark"
                onClick={handleSubmit}
                disabled={isPending}
              >
                {isPending
                  ? t("property.modals.submitting", { defaultValue: "Submitting..." })
                  : t("property.modals.submit")}
              </Button>

              {submitError ? (
                <p className="text-sm text-red-500 mt-1">{submitError}</p>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
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
                <span>{detailProperty.provinceName || detailProperty.province}</span>
              </div>

              <div className="mb-6">
                <div className="inline-flex items-center gap-2 p-3 bg-[#E8E6E1] rounded-lg">
                  <Ruler className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      {t("property.modals.area")}
                    </p>
                    <p className="font-bold text-foreground">
                      {new Intl.NumberFormat().format(detailProperty.areaValue)} {detailProperty.areaUnit}
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

      {showToast && (
        <div className="fixed top-[100px] right-6 z-[999]">
          <div className="relative flex items-start gap-3 bg-[#EAF7EF] border text-black px-4 py-3 rounded-xl shadow-md max-w-sm overflow-hidden">

            <div className="absolute left-0 top-0 h-full w-1 bg-green-600 rounded-l-xl" />

            <div className="mt-0.5 flex items-center justify-center w-5 h-5 min-w-[20px] min-h-[20px] rounded-full border-2 border-green-600 text-green-600 text-[10px] flex-shrink-0">
              ✔
            </div>

            <div className="text-sm font-semibold leading-snug pr-6">
              {t("property.modals.submitSuccess")}
            </div>

            <button
              onClick={() => setShowToast(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-lg font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  )
}