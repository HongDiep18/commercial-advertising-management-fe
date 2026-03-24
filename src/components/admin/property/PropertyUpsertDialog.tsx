"use client"

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react"
import { Loader2, Trash2, Upload, X } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useUploadFiles } from "@/api/files/hooks"
import {
  useAdminPropertyDetail,
  useCreateProperty,
  useUpdateProperty,
  useUploadPropertyLegalDocuments,
  useDeletePropertyLegalDocument,
} from "@/api/properties/hooks"
import type {
  CreatePropertyPayload,
  PropertyResponse,
  PropertyType,
} from "@/api/properties/types"
import Button from "@/components/ui/Button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog"
import Input from "@/components/ui/Input"
import Textarea from "@/components/ui/Textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/shadcn-select"
import { useUser } from "@/contexts/user-context"
import { FeatureKey } from "@/types"
import { isDemoAdminUser } from "@/components/login/demo/demoUsers"
import {
  buildDefaultPropertyFormValues,
  buildPropertyFormValuesFromResponse,
  getPropertyTypeLabel,
  parsePropertyFeatures,
  slugifyProvince,
} from "./helpers"
import type { PropertyUpsertFormValues } from "./types"

type PropertyUpsertDialogProps = {
  open: boolean
  mode: "create" | "edit"
  propertyId: string | null
  onClose: () => void
  onSuccess: (message: string) => void
}

type PropertyUpsertDialogFormProps = {
  initialFormValues: PropertyUpsertFormValues
  isEditMode: boolean
  isRealAdmin: boolean
  property?: PropertyResponse
  propertyId: string | null
  onClose: () => void
  onSuccess: (message: string) => void
}

const PROPERTY_TYPES = ["LAND", "FACTORY", "WAREHOUSE", "HOUSE", "OFFICE"] as const
const PUBLICATION_STATUSES = ["DRAFT", "PUBLISHED", "UNPUBLISHED"] as const
const AVAILABILITY_STATUSES = ["AVAILABLE", "SOLD"] as const

export function PropertyUpsertDialog({
  open,
  mode,
  propertyId,
  onClose,
  onSuccess,
}: PropertyUpsertDialogProps) {
  const { t } = useTranslation()
  const { user, canUseFeature } = useUser()
  const isDemoAdmin = isDemoAdminUser(user)
  const isRealAdmin = canUseFeature(FeatureKey.AdminPanel) && !isDemoAdmin

  const isEditMode = mode === "edit"

  const { data: property, isLoading: isLoadingProperty } = useAdminPropertyDetail(
    propertyId ?? "",
    isEditMode && Boolean(propertyId) && isRealAdmin
  )

  const initialFormValues = useMemo(
    () =>
      isEditMode && property
        ? buildPropertyFormValuesFromResponse(property)
        : buildDefaultPropertyFormValues(),
    [isEditMode, property]
  )

  const formKey = `${mode}-${propertyId ?? "new"}-${open ? "open" : "closed"}-${property?.updatedAt ?? "empty"}`

  const dialogTitle = isEditMode
    ? t("admin.property.editProperty", { defaultValue: "Edit property" })
    : t("admin.property.addProperty", { defaultValue: "Add Property" })

  const dialogDescription = isEditMode
    ? t("admin.property.formEditDescription", {
        defaultValue: "Update property details, images, and legal documents.",
      })
    : t("admin.property.formCreateDescription", {
        defaultValue: "Create a new property listing for administrators.",
      })

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
    >
      <DialogContent className="max-w-[calc(100%-2rem)] overscroll-contain sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        {isEditMode && isLoadingProperty ? (
          <div className="text-muted-foreground p-6 text-sm">
            {t("admin.property.loadingDetail", {
              defaultValue: "Loading property details…",
            })}
          </div>
        ) : isEditMode && !property ? (
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
          <PropertyUpsertDialogForm
            key={formKey}
            initialFormValues={initialFormValues}
            isEditMode={isEditMode}
            isRealAdmin={isRealAdmin}
            property={property}
            propertyId={propertyId}
            onClose={onClose}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function PropertyUpsertDialogForm({
  initialFormValues,
  isEditMode,
  isRealAdmin,
  property,
  propertyId,
  onClose,
  onSuccess,
}: PropertyUpsertDialogFormProps) {
  const { t } = useTranslation()

  const { create, isPending: isCreating } = useCreateProperty()
  const { update, isPending: isUpdating } = useUpdateProperty()
  const { upload: uploadFiles, isPending: isUploadingFiles } = useUploadFiles()
  const { upload: uploadLegalDocs, isPending: isUploadingLegalDocuments } =
    useUploadPropertyLegalDocuments()
  const { remove: removeLegalDocument, isPending: isDeletingLegalDocument } =
    useDeletePropertyLegalDocument()

  const [formValues, setFormValues] = useState<PropertyUpsertFormValues>(initialFormValues)
  const [newImageFiles, setNewImageFiles] = useState<File[]>([])
  const [newLegalDocumentFiles, setNewLegalDocumentFiles] = useState<File[]>([])
  const [formError, setFormError] = useState<string>("")

  const isSaving = isCreating || isUpdating || isUploadingFiles || isUploadingLegalDocuments

  const canSubmit = useMemo(() => {
    return (
      formValues.title.trim() &&
      formValues.price.trim() &&
      formValues.provinceName.trim() &&
      formValues.fullAddress.trim() &&
      formValues.areaValue.trim() &&
      formValues.areaUnit.trim() &&
      formValues.description.trim()
    )
  }, [formValues])

  const updateField = <K extends keyof PropertyUpsertFormValues>(
    key: K,
    value: PropertyUpsertFormValues[K]
  ) => {
    setFormValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleImageFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (files.length === 0) return

    setNewImageFiles((prev) => [...prev, ...files])
    event.target.value = ""
  }

  const handleLegalDocumentFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (files.length === 0) return

    setNewLegalDocumentFiles((prev) => [...prev, ...files])
    event.target.value = ""
  }

  const handleRemoveImageUrl = (index: number) => {
    setFormValues((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  const handleRemoveNewImageFile = (index: number) => {
    setNewImageFiles((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
  }

  const handleRemoveNewLegalDocumentFile = (index: number) => {
    setNewLegalDocumentFiles((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError("")

    if (!isRealAdmin) {
      setFormError(
        t("admin.property.demoReadOnly", {
          defaultValue: "Demo admin is read-only for property actions.",
        })
      )
      return
    }

    if (!canSubmit) {
      setFormError(
        t("admin.property.formRequiredError", {
          defaultValue: "Please fill in all required property fields.",
        })
      )
      return
    }

    if (Number.isNaN(Number(formValues.areaValue)) || Number(formValues.areaValue) <= 0) {
      setFormError(
        t("admin.property.formAreaValueError", {
          defaultValue: "Area must be a number greater than 0.",
        })
      )
      return
    }

    try {
      const uploadedImageUrls =
        newImageFiles.length > 0
          ? (
              await uploadFiles({
                files: newImageFiles,
                folder: "properties/images",
              })
            ).files.map((file) => file.url)
          : []

      const payload: CreatePropertyPayload = {
        title: formValues.title.trim(),
        price: formValues.price.trim(),
        type: formValues.type,
        province: (formValues.province.trim() || slugifyProvince(formValues.provinceName)).trim(),
        provinceName: formValues.provinceName.trim(),
        fullAddress: formValues.fullAddress.trim(),
        areaValue: Number(formValues.areaValue),
        areaUnit: formValues.areaUnit.trim(),
        description: formValues.description.trim(),
        images: [...formValues.imageUrls, ...uploadedImageUrls],
        features: parsePropertyFeatures(formValues.featuresText),
        publicationStatus: formValues.publicationStatus,
        availabilityStatus: formValues.availabilityStatus,
        views: Number.isNaN(Number(formValues.views)) ? 0 : Number(formValues.views),
      }

      if (formValues.latitude.trim()) {
        payload.latitude = Number(formValues.latitude)
      }

      if (formValues.longitude.trim()) {
        payload.longitude = Number(formValues.longitude)
      }

      const savedProperty =
        isEditMode && propertyId ? await update({ id: propertyId, payload }) : await create(payload)

      if (newLegalDocumentFiles.length > 0) {
        await uploadLegalDocs({ id: savedProperty.id, files: newLegalDocumentFiles })
      }

      onSuccess(
        isEditMode
          ? t("admin.property.formUpdateSuccess", {
              defaultValue: "Property updated successfully.",
            })
          : t("admin.property.formCreateSuccess", {
              defaultValue: "Property created successfully.",
            })
      )
      onClose()
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : t("admin.property.formSubmitError", {
              defaultValue: "Failed to save property. Please try again.",
            })
      )
    }
  }

  const handleDeleteLegalDocument = async (documentId: string) => {
    if (!propertyId) return

    try {
      await removeLegalDocument({ propertyId, documentId })
    } catch {
      setFormError(
        t("admin.property.formDeleteDocumentError", {
          defaultValue: "Failed to delete legal document.",
        })
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 pt-2">
      {formError ? (
        <div className="text-destructive bg-destructive/5 rounded-lg border border-red-200 px-4 py-3 text-sm">
          {formError}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="space-y-2 xl:col-span-2">
          <label htmlFor="property-title" className="text-foreground text-xs font-medium">
            {t("admin.property.formTitleLabel", { defaultValue: "Title" })} *
          </label>
          <Input
            id="property-title"
            value={formValues.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder={t("admin.property.formTitlePlaceholder", {
              defaultValue: "Industrial land in Binh Duong",
            })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-foreground text-xs font-medium">
            {t("admin.property.type", { defaultValue: "Type" })} *
          </label>
          <Select
            value={formValues.type}
            onValueChange={(value) => updateField("type", value as PropertyType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROPERTY_TYPES.map((value) => (
                <SelectItem key={value} value={value}>
                  {getPropertyTypeLabel(value, t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="property-price" className="text-foreground text-xs font-medium">
            {t("admin.property.price", { defaultValue: "Price" })} *
          </label>
          <Input
            id="property-price"
            value={formValues.price}
            onChange={(event) => updateField("price", event.target.value)}
            placeholder={t("admin.property.formPricePlaceholder", {
              defaultValue: "USD 4.5/m²/month",
            })}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="property-province-name" className="text-foreground text-xs font-medium">
            {t("admin.property.formProvinceNameLabel", { defaultValue: "Province Name" })} *
          </label>
          <Input
            id="property-province-name"
            value={formValues.provinceName}
            onChange={(event) => updateField("provinceName", event.target.value)}
            placeholder={t("admin.property.formProvinceNamePlaceholder", {
              defaultValue: "Binh Duong",
            })}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="property-province-slug" className="text-foreground text-xs font-medium">
            {t("admin.property.formProvinceSlugLabel", { defaultValue: "Province Slug" })}
          </label>
          <Input
            id="property-province-slug"
            value={formValues.province}
            onChange={(event) => updateField("province", event.target.value)}
            placeholder={t("admin.property.formProvinceSlugPlaceholder", {
              defaultValue: "binh-duong",
            })}
          />
        </div>

        <div className="space-y-2 xl:col-span-3">
          <label htmlFor="property-full-address" className="text-foreground text-xs font-medium">
            {t("admin.property.formFullAddressLabel", { defaultValue: "Full Address" })} *
          </label>
          <Input
            id="property-full-address"
            value={formValues.fullAddress}
            onChange={(event) => updateField("fullAddress", event.target.value)}
            placeholder={t("admin.property.formFullAddressPlaceholder", {
              defaultValue: "Lot A2, VSIP II, Binh Duong, Vietnam",
            })}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="property-area-value" className="text-foreground text-xs font-medium">
            {t("admin.property.formAreaValueLabel", { defaultValue: "Area Value" })} *
          </label>
          <Input
            id="property-area-value"
            type="number"
            min="0"
            step="any"
            value={formValues.areaValue}
            onChange={(event) => updateField("areaValue", event.target.value)}
            placeholder="5000"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="property-area-unit" className="text-foreground text-xs font-medium">
            {t("admin.property.formAreaUnitLabel", { defaultValue: "Area Unit" })} *
          </label>
          <Input
            id="property-area-unit"
            value={formValues.areaUnit}
            onChange={(event) => updateField("areaUnit", event.target.value)}
            placeholder="m²"
          />
        </div>

        <div className="space-y-2"></div>

        <div className="space-y-2">
          <label htmlFor="property-latitude" className="text-foreground text-xs font-medium">
            {t("admin.property.formLatitudeLabel", { defaultValue: "Latitude" })}
          </label>
          <Input
            id="property-latitude"
            type="number"
            step="any"
            value={formValues.latitude}
            onChange={(event) => updateField("latitude", event.target.value)}
            placeholder="10.8973812"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="property-longitude" className="text-foreground text-xs font-medium">
            {t("admin.property.formLongitudeLabel", { defaultValue: "Longitude" })}
          </label>
          <Input
            id="property-longitude"
            type="number"
            step="any"
            value={formValues.longitude}
            onChange={(event) => updateField("longitude", event.target.value)}
            placeholder="106.7218391"
          />
        </div>

        <div className="space-y-2"></div>

        <div className="space-y-2">
          <label className="text-foreground text-xs font-medium">
            {t("admin.property.publicationStatus", { defaultValue: "Publication Status" })}
          </label>
          <Select
            value={formValues.publicationStatus}
            onValueChange={(value) =>
              updateField("publicationStatus", value as typeof formValues.publicationStatus)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PUBLICATION_STATUSES.map((value) => (
                <SelectItem key={value} value={value}>
                  {t(`admin.status.${value.toLowerCase()}`, { defaultValue: value })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-foreground text-xs font-medium">
            {t("admin.property.availabilityStatus", { defaultValue: "Availability Status" })}
          </label>
          <Select
            value={formValues.availabilityStatus}
            onValueChange={(value) =>
              updateField("availabilityStatus", value as typeof formValues.availabilityStatus)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AVAILABILITY_STATUSES.map((value) => (
                <SelectItem key={value} value={value}>
                  {t(`admin.status.${value.toLowerCase()}`, { defaultValue: value })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 xl:col-span-3">
          <label htmlFor="property-description" className="text-foreground text-xs font-medium">
            {t("admin.property.formDescriptionLabel", { defaultValue: "Description" })} *
          </label>
          <Textarea
            id="property-description"
            value={formValues.description}
            onChange={(event) => updateField("description", event.target.value)}
            placeholder={t("admin.property.formDescriptionPlaceholder", {
              defaultValue: "Suitable for logistics and light manufacturing.",
            })}
            className="min-h-[120px]"
          />
        </div>

        <div className="space-y-2 xl:col-span-3">
          <label htmlFor="property-features" className="text-foreground text-xs font-medium">
            {t("admin.property.formFeaturesLabel", {
              defaultValue: "Features (one per line or comma-separated)",
            })}
          </label>
          <Textarea
            id="property-features"
            value={formValues.featuresText}
            onChange={(event) => updateField("featuresText", event.target.value)}
            placeholder={t("admin.property.formFeaturesPlaceholder", {
              defaultValue: "ready-infrastructure\nnear-port",
            })}
          />
        </div>
      </div>

      <div className="space-y-4 rounded-lg border p-4">
        <div>
          <p className="text-foreground text-sm font-medium">
            {t("admin.property.formImagesLabel", { defaultValue: "Images" })}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            {t("admin.property.formImagesHint", {
              defaultValue: "Upload images or keep/remove existing image URLs.",
            })}
          </p>
        </div>

        <Input type="file" accept="image/*" multiple onChange={handleImageFileChange} />

        {formValues.imageUrls.length > 0 ? (
          <div className="space-y-2">
            <p className="text-foreground text-xs font-medium">
              {t("admin.property.formExistingImagesLabel", {
                defaultValue: "Existing Images",
              })}
            </p>
            <div className="space-y-2">
              {formValues.imageUrls.map((url, index) => (
                <div key={`${url}-${index}`} className="flex items-center gap-2 rounded-md border px-3 py-2">
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary min-w-0 flex-1 truncate text-sm underline-offset-2 hover:underline"
                  >
                    {url}
                  </a>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveImageUrl(index)}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {newImageFiles.length > 0 ? (
          <div className="space-y-2">
            <p className="text-foreground text-xs font-medium">
              {t("admin.property.formNewImagesLabel", { defaultValue: "Images to Upload" })}
            </p>
            {newImageFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-2 rounded-md border px-3 py-2"
              >
                <Upload className="text-muted-foreground h-4 w-4 shrink-0" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveNewImageFile(index)}
                >
                  <X className="h-4 w-4" aria-hidden />
                </Button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="space-y-4 rounded-lg border p-4">
        <div>
          <p className="text-foreground text-sm font-medium">
            {t("admin.property.formLegalDocumentsLabel", { defaultValue: "Legal Documents" })}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            {t("admin.property.formLegalDocumentsHint", {
              defaultValue: "Upload PDFs or other legal documents after the property is saved.",
            })}
          </p>
        </div>

        <Input type="file" multiple onChange={handleLegalDocumentFileChange} />

        {isEditMode && property?.legalDocuments?.length ? (
          <div className="space-y-2">
            <p className="text-foreground text-xs font-medium">
              {t("admin.property.formExistingDocumentsLabel", {
                defaultValue: "Existing Legal Documents",
              })}
            </p>
            {property.legalDocuments.map((document) => (
              <div key={document.id} className="flex items-center gap-2 rounded-md border px-3 py-2">
                <a
                  href={document.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary min-w-0 flex-1 truncate text-sm underline-offset-2 hover:underline"
                >
                  {document.fileName}
                </a>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isDeletingLegalDocument}
                  onClick={() => void handleDeleteLegalDocument(document.id)}
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </Button>
              </div>
            ))}
          </div>
        ) : null}

        {newLegalDocumentFiles.length > 0 ? (
          <div className="space-y-2">
            <p className="text-foreground text-xs font-medium">
              {t("admin.property.formNewDocumentsLabel", {
                defaultValue: "Documents to Upload",
              })}
            </p>
            {newLegalDocumentFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-2 rounded-md border px-3 py-2"
              >
                <Upload className="text-muted-foreground h-4 w-4 shrink-0" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveNewLegalDocumentFile(index)}
                >
                  <X className="h-4 w-4" aria-hidden />
                </Button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
          {t("common.cancel", { defaultValue: "Cancel" })}
        </Button>
        <Button type="submit" variant="primary" disabled={!canSubmit || isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : null}
          {isEditMode
            ? t("admin.property.formSaveChanges", { defaultValue: "Save Changes" })
            : t("admin.property.formCreateSubmit", { defaultValue: "Create Property" })}
        </Button>
      </div>
    </form>
  )
}
