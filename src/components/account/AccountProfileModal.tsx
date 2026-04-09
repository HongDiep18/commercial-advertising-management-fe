"use client"

import { REGISTER_CATEGORIES } from "@/components/register/registerCategories"
import Button from "@/components/ui/Button"
import { Field, FieldLabel } from "@/components/ui/field"
import { RequiredMark, stripTrailingAsterisk } from "@/components/ui/required-mark"
import Input from "@/components/ui/Input"
import { SearchableMultiSelect } from "@/components/ui/SearchableMultiSelect"
import { SearchableSelect } from "@/components/ui/SearchableSelect"
import Textarea from "@/components/ui/Textarea"
import { cn } from "@/lib/utils"
import type { ProfileFormData } from "@/types/account"
import type { TFunction } from "i18next"
import { Edit3, ImageIcon, Plus, Save, Upload, X } from "lucide-react"
import { useState, type RefObject } from "react"
import { COUNTRY_NONE } from "./accountConstants"

type CountryOption = { value: string; label: string }
type RegionOption = { value: string; label: string }

function FieldWithError({ error, children }: { error?: string; children: React.ReactNode }) {
  return (
    <div data-profile-field-error={error ? true : undefined}>
      {children}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}

type AccountProfileModalProps = {
  open: boolean
  onClose: () => void
  profileData: ProfileFormData
  onProfileChange: (field: string, value: string | string[]) => void
  fieldErrors?: Partial<Record<keyof ProfileFormData, string>>
  companyLogo: string | null
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  fileInputRef: RefObject<HTMLInputElement | null>
  logoUploaded: boolean
  onSave: (extras: { emails: string[]; contactPhones: string[] }) => void
  isSaving: boolean
  countries: CountryOption[]
  allRegions: RegionOption[]
  readOnly?: boolean
  t: TFunction
}

export function AccountProfileModal({
  open,
  onClose,
  profileData,
  onProfileChange,
  fieldErrors = {},
  companyLogo,
  onLogoUpload,
  fileInputRef,
  onSave,
  isSaving,
  countries,
  allRegions,
  readOnly = false,
  t,
}: AccountProfileModalProps) {
  const [extraEmails, setExtraEmails] = useState<string[]>([])
  const [extraEmailErrors, setExtraEmailErrors] = useState<string[]>([])
  const [extraContacts, setExtraContacts] = useState<Array<{ name: string; phone: string }>>([])
  const [addContactRows, setAddContactRows] = useState<Array<{ type: string; value: string }>>([])

  const getInvalidEmailMessage = () =>
    t("register.errors.invalidEmail", {
      defaultValue: "Please enter a valid email address.",
    })
  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  const validateExtraEmails = (values: string[]) =>
    values.map((email) => {
      const trimmed = email.trim()
      if (!trimmed) return ""
      return isValidEmail(trimmed) ? "" : getInvalidEmailMessage()
    })

  const industryCategories = REGISTER_CATEGORIES.map((cat) => ({
    id: cat.id,
    name: t(cat.i18nKey) || `${cat.code}. ${cat.fallback}`,
  }))

  if (!open) return null

  const extraEmailsToSubmit = extraEmails.map((s) => s.trim()).filter(Boolean)
  const extraContactPhonesToSubmit = extraContacts.map((row) => row.phone.trim()).filter(Boolean)
  const handleSaveClick = () => {
    const nextExtraEmailErrors = validateExtraEmails(extraEmails)
    setExtraEmailErrors(nextExtraEmailErrors)
    if (nextExtraEmailErrors.some(Boolean)) return
    onSave({ emails: extraEmailsToSubmit, contactPhones: extraContactPhonesToSubmit })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-body-bg-dark mt-12 max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-lg">
        <div className="bg-body-bg-dark border-border sticky top-0 z-10 flex items-center justify-between border-b border-gray-300 px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Edit3 className="text-primary h-5 w-5" />
            {readOnly
              ? t("account.editReadOnly") || "查看會員資料"
              : t("account.editProfile") || "編輯會員資料"}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label={t("common.close") || "關閉"}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="space-y-6 p-6">
          <div className="space-y-4">
            <h3 className="text-muted-foreground text-sm font-medium">
              {t("account.companyLogo") || "公司 Logo"}
            </h3>
            <div className="flex items-center gap-6">
              {!readOnly && (
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={onLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
              )}
              <div
                className={`border-border !bg-body-bg-dark-foreground flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-400 ${!companyLogo ? "bg-muted/60" : ""}`}
              >
                {companyLogo ? (
                  <img
                    src={companyLogo}
                    alt={t("account.companyLogo") || "公司 Logo"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon className="text-muted-foreground h-10 w-10" />
                )}
              </div>
              <div className="space-y-2">
                {!readOnly && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:!bg-header-red-dark border !border-gray-400 bg-transparent hover:!text-white"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {companyLogo
                        ? t("account.reupload") || "重新上傳"
                        : t("account.uploadLogo") || "上傳 Logo"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3 className="text-muted-foreground text-sm font-medium">
              {t("account.companyInfo") || "公司資料"}
              <RequiredMark />
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldWithError error={fieldErrors.companyNameVi}>
                <Field className="gap-1.5">
                  <FieldLabel className="text-foreground text-sm font-medium">
                    {stripTrailingAsterisk(
                      t("register.placeholders.companyNameVi") || "公司名稱（越文）"
                    )}
                    <RequiredMark />
                  </FieldLabel>
                  <Input
                    placeholder={t("register.placeholders.companyNameVi") || "公司名稱（越文）"}
                    value={profileData.companyNameVi}
                    onChange={(e) => onProfileChange("companyNameVi", e.target.value)}
                    disabled={readOnly}
                  />
                </Field>
              </FieldWithError>
              <FieldWithError error={fieldErrors.companyNameCn}>
                <Field className="gap-1.5">
                  <FieldLabel className="text-foreground text-sm font-medium">
                    {stripTrailingAsterisk(
                      t("register.placeholders.companyNameZh") || "公司名稱（中文）"
                    )}
                    <RequiredMark />
                  </FieldLabel>
                  <Input
                    placeholder={t("register.placeholders.companyNameZh") || "公司名稱（中文）"}
                    value={profileData.companyNameCn}
                    onChange={(e) => onProfileChange("companyNameCn", e.target.value)}
                    disabled={readOnly}
                  />
                </Field>
              </FieldWithError>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldWithError error={fieldErrors.phone}>
                <Field className="gap-1.5">
                  <FieldLabel className="text-foreground text-sm font-medium">
                    {stripTrailingAsterisk(t("register.placeholders.phone") || "電話")}
                    <RequiredMark />
                  </FieldLabel>
                  <Input
                    placeholder={t("register.placeholders.phone") || "電話"}
                    value={profileData.phone}
                    onChange={(e) => onProfileChange("phone", e.target.value)}
                    disabled={readOnly}
                  />
                </Field>
              </FieldWithError>
              <FieldWithError error={fieldErrors.taxId}>
                <Field className="gap-1.5">
                  <FieldLabel className="text-foreground text-sm font-medium">
                    {stripTrailingAsterisk(t("register.placeholders.taxId") || "稅號")}
                    <RequiredMark />
                  </FieldLabel>
                  <Input
                    placeholder={t("register.placeholders.taxId") || "稅號"}
                    value={profileData.taxId}
                    onChange={(e) => onProfileChange("taxId", e.target.value)}
                    disabled={readOnly}
                  />
                </Field>
              </FieldWithError>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldWithError error={fieldErrors.contactName}>
                <Field className="gap-1.5">
                  <FieldLabel className="text-foreground text-sm font-medium">
                    {stripTrailingAsterisk(t("register.placeholders.contactPerson") || "聯絡人")}
                    <RequiredMark />
                  </FieldLabel>
                  <Input
                    placeholder={t("register.placeholders.contactPerson") || "聯絡人"}
                    value={profileData.contactName}
                    onChange={(e) => onProfileChange("contactName", e.target.value)}
                    disabled={readOnly}
                  />
                </Field>
              </FieldWithError>
              <FieldWithError error={fieldErrors.contactPhone}>
                <Field className="gap-1.5">
                  <FieldLabel className="text-foreground text-sm font-medium">
                    {stripTrailingAsterisk(
                      t("register.placeholders.contactPhone") || "聯絡人電話號碼"
                    )}
                    <RequiredMark />
                  </FieldLabel>
                  <Input
                    placeholder={t("register.placeholders.contactPhone") || "聯絡人電話號碼"}
                    value={profileData.contactPhone}
                    onChange={(e) => onProfileChange("contactPhone", e.target.value)}
                    disabled={readOnly}
                  />
                </Field>
              </FieldWithError>
              {(!readOnly || extraContacts.length > 0) && (
                <div className="col-span-full space-y-2 sm:col-span-2">
                  {!readOnly && (
                    <button
                      type="button"
                      className="text-primary hover:bg-primary/10 inline-flex w-fit items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors"
                      onClick={() => setExtraContacts((prev) => [...prev, { name: "", phone: "" }])}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {t("account.addContactPerson", { defaultValue: "Add contact person" })}
                    </button>
                  )}
                  {extraContacts.length > 0 && (
                    <div className="space-y-2">
                      {extraContacts.map((row, idx) => (
                        <div
                          key={`extra-contact-${idx}`}
                          className={cn(
                            "grid w-full min-w-0 items-center gap-2",
                            readOnly
                              ? "grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
                              : "grid-cols-[minmax(0,1fr)_minmax(0,1fr)_40px]"
                          )}
                        >
                          <Input
                            className="min-w-0"
                            placeholder={t("account.contactPersonN", {
                              count: idx + 1,
                              defaultValue: `Contact person ${idx + 1}`,
                            })}
                            value={row.name}
                            onChange={(e) =>
                              setExtraContacts((prev) =>
                                prev.map((v, i) => (i === idx ? { ...v, name: e.target.value } : v))
                              )
                            }
                            disabled={readOnly}
                          />
                          <Input
                            className="min-w-0"
                            placeholder={`${t("register.placeholders.contactPhone", {
                              defaultValue: "Contact Phone",
                            })} ${idx + 1}`}
                            value={row.phone}
                            onChange={(e) =>
                              setExtraContacts((prev) =>
                                prev.map((v, i) =>
                                  i === idx ? { ...v, phone: e.target.value } : v
                                )
                              )
                            }
                            disabled={readOnly}
                          />
                          {!readOnly && (
                            <button
                              type="button"
                              className="text-muted-foreground hover:text-destructive inline-flex h-10 w-[40px] max-w-[40px] min-w-[40px] shrink-0 items-center justify-center rounded-md border border-gray-400 p-0 transition-colors"
                              onClick={() =>
                                setExtraContacts((prev) => prev.filter((_, i) => i !== idx))
                              }
                              aria-label={t("common.remove", { defaultValue: "Remove" })}
                            >
                              <X className="h-4 w-4 shrink-0" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldWithError error={fieldErrors.address}>
                <Field className="gap-1.5">
                  <FieldLabel className="text-foreground text-sm font-medium">
                    {stripTrailingAsterisk(t("register.placeholders.companyAddress") || "公司地址")}
                    <RequiredMark />
                  </FieldLabel>
                  <Input
                    placeholder={t("register.placeholders.companyAddress") || "公司地址"}
                    value={profileData.address}
                    onChange={(e) => onProfileChange("address", e.target.value)}
                    disabled={readOnly}
                  />
                </Field>
              </FieldWithError>
              <FieldWithError error={fieldErrors.email}>
                <Field className="gap-1.5">
                  <FieldLabel className="text-foreground text-sm font-medium">
                    {stripTrailingAsterisk(t("register.placeholders.email") || "E-Mail")}
                    <RequiredMark />
                  </FieldLabel>
                  <Input
                    type="email"
                    placeholder={t("register.placeholders.emailExample", {
                      defaultValue: "name@company.com",
                    })}
                    value={profileData.email}
                    onChange={(e) => onProfileChange("email", e.target.value)}
                    disabled={readOnly}
                  />
                  {!readOnly && (
                    <button
                      type="button"
                      className="text-primary hover:bg-primary/10 mt-2 inline-flex w-fit items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors"
                      onClick={() => {
                        setExtraEmails((prev) => [...prev, ""])
                        setExtraEmailErrors((prev) => [...prev, ""])
                      }}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {t("account.addCompanyEmail", { defaultValue: "Add company email" })}
                    </button>
                  )}
                  {extraEmails.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {extraEmails.map((value, idx) => (
                        <div key={`extra-email-${idx}`} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Input
                              type="email"
                              className={cn(
                                extraEmailErrors[idx] &&
                                  "border-red-500 focus-visible:ring-red-500/30"
                              )}
                              placeholder={t("account.emailN", {
                                count: idx + 1,
                                defaultValue: `Email ${idx + 1}`,
                              })}
                              value={value}
                              onChange={(e) => {
                                const nextValue = e.target.value
                                setExtraEmails((prev) =>
                                  prev.map((v, i) => (i === idx ? nextValue : v))
                                )
                                setExtraEmailErrors((prev) =>
                                  prev.map((err, i) => {
                                    if (i !== idx) return err
                                    const trimmed = nextValue.trim()
                                    if (!trimmed) return ""
                                    return isValidEmail(trimmed) ? "" : getInvalidEmailMessage()
                                  })
                                )
                              }}
                              disabled={readOnly}
                            />
                            {!readOnly && (
                              <button
                                type="button"
                                className="text-muted-foreground hover:text-destructive inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-gray-400 transition-colors"
                                onClick={() => {
                                  setExtraEmails((prev) => prev.filter((_, i) => i !== idx))
                                  setExtraEmailErrors((prev) => prev.filter((_, i) => i !== idx))
                                }}
                                aria-label={t("common.remove", { defaultValue: "Remove" })}
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          {extraEmailErrors[idx] && (
                            <p className="text-sm text-red-500">{extraEmailErrors[idx]}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Field>
              </FieldWithError>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Field>
                <div className="flex items-center justify-between gap-3">
                  <FieldLabel className="text-foreground text-sm font-medium">
                    {t("account.addContact", { defaultValue: "Add contact" })}
                  </FieldLabel>
                  {!readOnly && (
                    <button
                      type="button"
                      className="text-primary hover:bg-primary/10 inline-flex w-fit items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors"
                      onClick={() =>
                        setAddContactRows((prev) => [...prev, { type: "email", value: "" }])
                      }
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {t("account.addContact", { defaultValue: "Add contact" })}
                    </button>
                  )}
                </div>
                {addContactRows.length > 0 && (
                  <div className="space-y-2">
                    {addContactRows.map((row, idx) => (
                      <div
                        key={`add-contact-row-${idx}`}
                        className="grid grid-cols-1 gap-2 sm:grid-cols-10"
                      >
                        <div className="sm:col-span-3">
                          <SearchableSelect
                            value={row.type}
                            onValueChange={(nextType) =>
                              setAddContactRows((prev) =>
                                prev.map((item, i) =>
                                  i === idx ? { ...item, type: nextType } : item
                                )
                              )
                            }
                            disabled={readOnly}
                            options={[
                              {
                                value: "email",
                                label: t("register.placeholders.email", { defaultValue: "E-Mail" }),
                              },
                              {
                                value: "phone",
                                label: t("register.placeholders.contactPhone", {
                                  defaultValue: "Contact Phone",
                                }),
                              },
                            ]}
                            placeholder={t("account.addContact", { defaultValue: "Add contact" })}
                            searchPlaceholder={t("common.search", { defaultValue: "Search" })}
                            emptyText={t("common.noResults", { defaultValue: "No results." })}
                          />
                        </div>
                        <div className="sm:col-span-7">
                          <Input
                            value={row.value}
                            onChange={(e) =>
                              setAddContactRows((prev) =>
                                prev.map((item, i) =>
                                  i === idx ? { ...item, value: e.target.value } : item
                                )
                              )
                            }
                            disabled={readOnly}
                            placeholder={t("account.addContact", { defaultValue: "Add contact" })}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldWithError error={fieldErrors.country}>
                <Field className="gap-1.5">
                  <FieldLabel className="text-foreground text-sm font-medium">
                    {stripTrailingAsterisk(
                      t("register.placeholders.country") || "Select Country *"
                    )}
                    <RequiredMark />
                  </FieldLabel>
                  <SearchableSelect
                    value={profileData.country || COUNTRY_NONE}
                    onValueChange={(value) => onProfileChange("country", value)}
                    disabled={readOnly}
                    options={[
                      {
                        value: COUNTRY_NONE,
                        label: t("register.placeholders.country") || "Select Country *",
                      },
                      ...countries,
                    ]}
                    placeholder={t("register.placeholders.country") || "Select Country *"}
                    searchPlaceholder={t("common.search", { defaultValue: "Search" })}
                    emptyText={t("common.noResults", { defaultValue: "No results." })}
                  />
                </Field>
              </FieldWithError>

              <FieldWithError error={fieldErrors.region}>
                <Field className="gap-1.5">
                  <FieldLabel className="text-foreground text-sm font-medium">
                    {stripTrailingAsterisk(t("register.placeholders.region") || "Select Region *")}
                    <RequiredMark />
                  </FieldLabel>
                  <SearchableSelect
                    value={profileData.region}
                    onValueChange={(value) => onProfileChange("region", value)}
                    disabled={readOnly}
                    options={allRegions}
                    placeholder={t("register.placeholders.region") || "Select Region *"}
                    searchPlaceholder={t("common.search", { defaultValue: "Search" })}
                    emptyText={t("common.noResults", { defaultValue: "No results." })}
                  />
                </Field>
              </FieldWithError>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <FieldWithError error={fieldErrors.industry}>
                <Field className="gap-1.5">
                  <FieldLabel className="text-foreground text-sm font-medium">
                    {stripTrailingAsterisk(t("register.placeholders.industry") || "選擇產業類別")}
                    <RequiredMark />
                  </FieldLabel>
                  <SearchableMultiSelect
                    value={profileData.industry}
                    onValueChange={(next) => onProfileChange("industry", next)}
                    disabled={readOnly}
                    options={industryCategories.map((cat) => ({
                      value: cat.id,
                      label: cat.name,
                    }))}
                    placeholder={t("register.placeholders.industry") || "選擇產業類別"}
                    searchPlaceholder={t("common.search", { defaultValue: "Search" })}
                    emptyText={t("common.noResults", { defaultValue: "No results." })}
                    listMaxHeightClassName="max-h-[11.25rem]"
                    formatSummary={(selected, opts) => {
                      const labels = selected
                        .map((v) => opts.find((o) => o.value === v)?.label)
                        .filter(Boolean) as string[]
                      if (labels.length === 0) return ""
                      if (labels.length <= 2) return labels.join(", ")
                      return t("account.industriesSelectedCount", {
                        count: labels.length,
                      })
                    }}
                  />
                </Field>
              </FieldWithError>
            </div>

            <FieldWithError error={fieldErrors.website}>
              <Field className="gap-1.5">
                <FieldLabel className="text-foreground text-sm font-medium">
                  {stripTrailingAsterisk(t("register.placeholders.website") || "Website *")}
                  <RequiredMark />
                </FieldLabel>
                <div className="space-y-1">
                  <Input
                    placeholder={
                      t("register.hints.websiteFormat") ||
                      "Example: https://your-company or http://your-company"
                    }
                    value={profileData.website}
                    onChange={(e) => onProfileChange("website", e.target.value)}
                    disabled={readOnly}
                  />
                </div>
              </Field>
            </FieldWithError>
            <FieldWithError error={fieldErrors.description}>
              <Field className="gap-1.5">
                <FieldLabel className="text-foreground text-sm font-medium">
                  {stripTrailingAsterisk(t("register.placeholders.introduction") || "簡單介紹")}
                  <RequiredMark />
                </FieldLabel>
                <Textarea
                  placeholder={t("register.placeholders.introduction") || "簡單介紹"}
                  value={profileData.description}
                  onChange={(e) => onProfileChange("description", e.target.value)}
                  rows={3}
                  disabled={readOnly}
                />
              </Field>
            </FieldWithError>
          </div>
          <div className="flex gap-3 border-t border-gray-400 pt-4">
            <Button
              variant="outline"
              className="hover:!bg-header-red-dark flex-1 border !border-gray-400 bg-transparent hover:!text-white"
              onClick={onClose}
            >
              {readOnly ? t("common.close") || "關閉" : t("account.cancel") || "取消"}
            </Button>
            {!readOnly && (
              <Button
                className="!bg-header-red-dark hover:!bg-header-red-dark/80 flex-1 text-white hover:!text-white"
                onClick={handleSaveClick}
                disabled={isSaving}
              >
                <Save className="mr-2 h-4 w-4" />
                {t("account.saveChanges") || "儲存變更"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
