"use client"

import { useMemo, type RefObject } from "react"
import type { TFunction } from "i18next"
import { Edit3, ImageIcon, Plus, Save, Trash2, Upload, X } from "lucide-react"
import type { AdminCompanyForm } from "@/api/admin-companies/mapper"
import type { AdminCompanyContact, AdminCompanyContactType } from "@/api/admin-companies/types"
import { REGISTER_CATEGORIES } from "@/components/register/registerCategories"
import Button from "@/components/ui/Button"
import { Field, FieldLabel } from "@/components/ui/field"
import Input from "@/components/ui/Input"
import { SearchableMultiSelect } from "@/components/ui/SearchableMultiSelect"
import { SearchableSelect } from "@/components/ui/SearchableSelect"
import Textarea from "@/components/ui/Textarea"
import { RequiredMark, stripTrailingAsterisk } from "@/components/ui/required-mark"

type CountryOption = { value: string; label: string }
type RegionOption = { value: string; label: string }

type ContactFieldErrors = {
  type?: string
  value?: string
}

type AdminCompanyFormErrors = {
  companyNameVi?: string
  country?: string
  region?: string
  industry?: string
  contacts: ContactFieldErrors[]
}

type AccountSummary = {
  userName: string
  registeredEmail: string
  memberSince: string
  memberRange: string
}

type Props = {
  open: boolean
  onClose: () => void
  form: AdminCompanyForm
  errors: AdminCompanyFormErrors
  accountSummary: AccountSummary
  onFieldChange: (field: keyof AdminCompanyForm, value: string | string[]) => void
  onContactChange: (index: number, field: keyof AdminCompanyContact, value: string) => void
  onAddContact: (type?: AdminCompanyContactType) => void
  onRemoveContact: (index: number) => void
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  fileInputRef: RefObject<HTMLInputElement | null>
  onSave: () => void
  isSaving: boolean
  countries: CountryOption[]
  allRegions: RegionOption[]
  readOnly?: boolean
  t: TFunction
}

const CONTACT_TYPE_OPTIONS: Array<{ value: AdminCompanyContactType; label: string }> = [
  { value: "email", label: "Email" },
  { value: "tel", label: "Telephone" },
  { value: "contact_person", label: "Contact Person" },
  { value: "website", label: "Website" },
  { value: "address", label: "Address" },
  { value: "hotline", label: "Hotline" },
  { value: "fax", label: "Fax" },
  { value: "zalo", label: "Zalo" },
  { value: "wechat", label: "WeChat" },
  { value: "line", label: "Line" },
  { value: "skype", label: "Skype" },
  { value: "facebook", label: "Facebook" },
  { value: "viber", label: "Viber" },
]

type ContactGroupLayout = "person" | "simple" | "full"

type ContactGroupDef = {
  key: string
  labelKey: string
  fallbackLabel: string
  types: Set<string>
  defaultType: AdminCompanyContactType
  layout: ContactGroupLayout
  showContactName?: boolean
  /** Groups sharing the same rowGroup key render side-by-side */
  rowGroup: string
}

const CONTACT_GROUPS: ContactGroupDef[] = [
  {
    key: "contact_person",
    labelKey: "admin.companies.contactGroups.contactPerson",
    fallbackLabel: "Contact Person",
    types: new Set(["contact_person"]),
    defaultType: "contact_person",
    layout: "person",
    rowGroup: "rg_contact_person",
  },
  {
    key: "email",
    labelKey: "admin.companies.contactGroups.email",
    fallbackLabel: "Email",
    types: new Set(["email"]),
    defaultType: "email",
    layout: "simple",
    rowGroup: "rg_email_website",
  },
  {
    key: "website",
    labelKey: "admin.companies.contactGroups.website",
    fallbackLabel: "Website",
    types: new Set(["website"]),
    defaultType: "website",
    layout: "simple",
    rowGroup: "rg_email_website",
  },
  {
    key: "social",
    labelKey: "admin.companies.contactGroups.social",
    fallbackLabel: "Social & Messaging",
    types: new Set(["zalo", "wechat", "line", "skype", "facebook", "viber"]),
    defaultType: "zalo",
    layout: "full",
    showContactName: true,
    rowGroup: "rg_social",
  },
  {
    key: "company_contact",
    labelKey: "admin.companies.contactGroups.otherContact",
    fallbackLabel: "Other Contact",
    types: new Set(["tel", "hotline", "fax"]),
    defaultType: "tel",
    layout: "full",
    showContactName: true,
    rowGroup: "rg_company_contact",
  },
  {
    key: "address",
    labelKey: "admin.companies.contactGroups.address",
    fallbackLabel: "Address",
    types: new Set(["address"]),
    defaultType: "address",
    layout: "simple",
    rowGroup: "rg_address",
  },
]

const ALL_KNOWN_CONTACT_TYPES = new Set(CONTACT_GROUPS.flatMap((g) => [...g.types]))
const PROTECTED_LAST_CONTACT_TYPES = new Set<AdminCompanyContactType>([
  "email",
  "contact_person",
  "website",
  "address",
])

// Types where a named person/department is meaningful on the same contact row
const CONTACT_TYPE_EXAMPLES: Partial<Record<AdminCompanyContactType, string>> = {
  email: "sales@example.com",
  tel: "+84 28 1234 5678",
  contact_person: "+84 90 123 4567",
  hotline: "1900 1234",
  website: "https://example.com",
  address: "District 7, Ho Chi Minh City",
  fax: "+84 28 9999 8888",
  zalo: "zalo.me/company",
  wechat: "company_wechat_id",
  line: "@company-line",
  skype: "live:company.id",
  facebook: "https://facebook.com/company",
  viber: "+84 90 123 4567",
}

function FieldWithError({ error, children }: { error?: string; children: React.ReactNode }) {
  return (
    <div data-profile-field-error={error ? true : undefined}>
      {children}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}

export function AdminCompanyEditDialog({
  open,
  onClose,
  form,
  errors,
  accountSummary,
  onFieldChange,
  onContactChange,
  onAddContact,
  onRemoveContact,
  onLogoUpload,
  fileInputRef,
  onSave,
  isSaving,
  countries,
  allRegions,
  readOnly = false,
  t,
}: Props) {
  const industryCategories = useMemo(
    () =>
      REGISTER_CATEGORIES.map((cat) => ({
        value: cat.id,
        label: t(cat.i18nKey) || `${cat.code}. ${cat.fallback}`,
      })),
    [t]
  )

  if (!open) return null

  const title =
    form.companyNameZh.trim() || form.companyNameEn.trim() || form.companyNameVi.trim() || "-"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-body-bg-dark mt-12 max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-lg">
        <div className="bg-body-bg-dark border-border sticky top-0 z-10 flex items-center justify-between border-b border-gray-300 px-6 py-4">
          <div className="flex min-w-0 items-start gap-2">
            <Edit3 className="text-primary mt-0.5 h-5 w-5 shrink-0" />
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold">
                {readOnly ? t("account.editReadOnly", { defaultValue: "View company data" }) : title}
              </h2>
              {accountSummary.registeredEmail && (
                <p className="text-muted-foreground truncate text-sm">
                  {accountSummary.registeredEmail}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label={t("common.close", { defaultValue: "Close" })}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-5 p-6">
          <div className="space-y-3">
            <h3 className="text-muted-foreground text-sm font-medium">
              {t("account.companyLogo", { defaultValue: "Company Logo" })}
            </h3>
            <div className="grid items-start gap-6 sm:grid-cols-[128px_minmax(0,1fr)]">
              {!readOnly && (
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={onLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
              )}
              <div className="flex w-32 flex-col items-start gap-3">
                <div className="border-border !bg-body-bg-dark-foreground flex h-28 w-28 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-400">
                  {form.logoUrl ? (
                    <img src={form.logoUrl} alt={title} className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="text-muted-foreground h-10 w-10" />
                  )}
                </div>
                {!readOnly && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:!bg-header-red-dark h-10 min-w-28 self-center whitespace-nowrap border !border-gray-400 bg-transparent px-3.5 hover:!text-white"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 shrink-0" />
                    <span className="shrink-0">
                      {form.logoUrl
                        ? t("account.reupload", { defaultValue: "Re-upload" })
                        : t("account.uploadLogo", { defaultValue: "Upload Logo" })}
                    </span>
                  </Button>
                )}
              </div>

              <div className="grid min-w-0 grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 sm:pl-2">
                <div className="min-w-0 space-y-1">
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    {t("admin.companies.userName", { defaultValue: "User name" })}
                  </p>
                  <p className="truncate text-sm font-medium">{accountSummary.userName || "-"}</p>
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    {t("admin.companies.userRegisteredEmail", {
                      defaultValue: "User registered email",
                    })}
                  </p>
                  <p className="truncate text-sm font-medium">
                    {accountSummary.registeredEmail || "-"}
                  </p>
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    {t("admin.companies.memberSince", { defaultValue: "Member since" })}
                  </p>
                  <p className="truncate text-sm font-medium">
                    {accountSummary.memberSince || "-"}
                  </p>
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    {t("admin.companies.memberRange", { defaultValue: "Member range" })}
                  </p>
                  <p className="truncate text-sm font-medium">
                    {accountSummary.memberRange || "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t pt-4">
            <h3 className="text-muted-foreground text-sm font-medium">
              {t("account.companyInfo", { defaultValue: "Company Information" })}
            </h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FieldWithError error={errors.companyNameVi}>
                <Field className="gap-1.5">
                  <FieldLabel className="text-foreground text-sm font-medium">
                    {stripTrailingAsterisk(
                      t("register.placeholders.companyNameVi", {
                        defaultValue: "Company Name (Vietnamese)",
                      })
                    )}
                    <RequiredMark />
                  </FieldLabel>
                  <Input
                    value={form.companyNameVi}
                    onChange={(e) => onFieldChange("companyNameVi", e.target.value)}
                    placeholder={t("admin.companies.fieldExamples.companyNameVi", {
                      defaultValue: "Ex: Cong Ty TNHH ABC",
                    })}
                    disabled={readOnly}
                  />
                </Field>
              </FieldWithError>

              <Field className="gap-1.5">
                <FieldLabel className="text-foreground text-sm font-medium">
                  {t("admin.companies.companyNameEn", { defaultValue: "Company Name (English)" })}
                </FieldLabel>
                <Input
                  value={form.companyNameEn}
                  onChange={(e) => onFieldChange("companyNameEn", e.target.value)}
                  placeholder={t("admin.companies.fieldExamples.companyNameEn", {
                    defaultValue: "Ex: ABC Co., Ltd.",
                  })}
                  disabled={readOnly}
                />
              </Field>

              <Field className="gap-1.5">
                <FieldLabel className="text-foreground text-sm font-medium">
                  {t("register.placeholders.companyNameZh", {
                    defaultValue: "Company Name (Chinese)",
                  })}
                </FieldLabel>
                <Input
                  value={form.companyNameZh}
                  onChange={(e) => onFieldChange("companyNameZh", e.target.value)}
                  placeholder={t("admin.companies.fieldExamples.companyNameZh", {
                    defaultValue: "Ex: ABC有限公司",
                  })}
                  disabled={readOnly}
                />
              </Field>

              <Field className="gap-1.5">
                <FieldLabel className="text-foreground text-sm font-medium">
                  {t("register.placeholders.taxId", { defaultValue: "Tax ID" })}
                </FieldLabel>
                <Input
                  value={form.taxId}
                  onChange={(e) => onFieldChange("taxId", e.target.value)}
                  placeholder={t("admin.companies.fieldExamples.taxId", {
                    defaultValue: "Ex: 0302776159",
                  })}
                  disabled={readOnly}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FieldWithError error={errors.country}>
                <Field className="gap-1.5">
                  <FieldLabel className="text-foreground text-sm font-medium">
                    {stripTrailingAsterisk(
                      t("register.placeholders.country", { defaultValue: "Country" })
                    )}
                    <RequiredMark />
                  </FieldLabel>
                  <SearchableSelect
                    value={form.country}
                    onValueChange={(value) => onFieldChange("country", value)}
                    disabled={readOnly}
                    options={countries}
                    placeholder={t("register.placeholders.country", { defaultValue: "Country" })}
                    searchPlaceholder={t("common.search", { defaultValue: "Search" })}
                    emptyText={t("common.noResults", { defaultValue: "No results." })}
                  />
                </Field>
              </FieldWithError>

              <FieldWithError error={errors.region}>
                <Field className="gap-1.5">
                  <FieldLabel className="text-foreground text-sm font-medium">
                    {stripTrailingAsterisk(
                      t("register.placeholders.region", { defaultValue: "Region" })
                    )}
                    <RequiredMark />
                  </FieldLabel>
                  <SearchableSelect
                    value={form.region}
                    onValueChange={(value) => onFieldChange("region", value)}
                    disabled={readOnly}
                    options={allRegions}
                    placeholder={t("register.placeholders.region", { defaultValue: "Region" })}
                    searchPlaceholder={t("common.search", { defaultValue: "Search" })}
                    emptyText={t("common.noResults", { defaultValue: "No results." })}
                  />
                </Field>
              </FieldWithError>
            </div>

            <FieldWithError error={errors.industry}>
              <Field className="gap-1.5">
                <FieldLabel className="text-foreground text-sm font-medium">
                  {stripTrailingAsterisk(
                    t("register.placeholders.industry", { defaultValue: "Industry" })
                  )}
                  <RequiredMark />
                </FieldLabel>
                <SearchableMultiSelect
                  value={form.industry}
                  onValueChange={(next) => onFieldChange("industry", next)}
                  disabled={readOnly}
                  options={industryCategories}
                  placeholder={t("register.placeholders.industry", { defaultValue: "Industry" })}
                  searchPlaceholder={t("common.search", { defaultValue: "Search" })}
                  emptyText={t("common.noResults", { defaultValue: "No results." })}
                />
              </Field>
            </FieldWithError>

          </div>

          <div className="space-y-4 border-t pt-4">
            {(() => {
              const indexedContacts = form.contacts.map((contact, index) => ({ contact, index }))
              const unknownContacts = indexedContacts.filter(
                ({ contact }) => !ALL_KNOWN_CONTACT_TYPES.has(String(contact.type || ""))
              )
              const allGroups: ContactGroupDef[] = [
                ...CONTACT_GROUPS,
                ...(unknownContacts.length > 0
                  ? [{
                      key: "other",
                      labelKey: "admin.companies.contactGroups.other",
                      fallbackLabel: "Other",
                      types: new Set<string>(),
                      defaultType: "email" as AdminCompanyContactType,
                      layout: "full" as ContactGroupLayout,
                      rowGroup: "rg_other",
                    }]
                  : []),
              ]

              // Collect row groups preserving order
              const rowGroupOrder: string[] = []
              const groupsByRow: Record<string, ContactGroupDef[]> = {}
              for (const g of allGroups) {
                if (!groupsByRow[g.rowGroup]) {
                  groupsByRow[g.rowGroup] = []
                  rowGroupOrder.push(g.rowGroup)
                }
                groupsByRow[g.rowGroup].push(g)
              }

              const canRemoveContact = (index: number) => {
                const type = String(form.contacts[index]?.type ?? "") as AdminCompanyContactType
                if (!PROTECTED_LAST_CONTACT_TYPES.has(type)) return form.contacts.length > 1

                const sameTypeCount = form.contacts.filter(
                  (contact) => String(contact.type ?? "") === type
                ).length

                return sameTypeCount > 1
              }

              const renderRemoveButton = (index: number) =>
                !readOnly ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 shrink-0"
                    onClick={() => onRemoveContact(index)}
                    disabled={!canRemoveContact(index)}
                    aria-label={t("common.remove", { defaultValue: "Remove" })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : null

              const renderGroup = (group: ContactGroupDef) => {
                const groupContacts =
                  group.key === "other"
                    ? unknownContacts
                    : indexedContacts.filter(({ contact }) =>
                        group.types.has(String(contact.type || ""))
                      )
                const groupLabel = t(group.labelKey, { defaultValue: group.fallbackLabel })

                return (
                  <div key={group.key} className="min-w-0 space-y-1.5">
                    {/* Group header */}
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                        {groupLabel}
                      </span>
                      {!readOnly && (
                        <button
                          type="button"
                          className="text-primary border-primary/35 bg-body-bg-light inline-flex h-6 shrink-0 items-center justify-center gap-1 rounded-full border px-2 text-[11px] font-medium transition-colors hover:bg-primary hover:text-white"
                          onClick={() => onAddContact(group.defaultType)}
                          aria-label={t("common.add", { defaultValue: "Add" })}
                          title={t("common.add", { defaultValue: "Add" })}
                        >
                          <Plus className="h-3 w-3" />
                          <span>{t("common.add", { defaultValue: "Add" })}</span>
                        </button>
                      )}
                    </div>

                    {/* person layout: Name | Phone */}
                    {group.layout === "person" &&
                      groupContacts.map(({ contact, index }) => {
                        const error = errors.contacts[index] ?? {}
                        return (
                          <div
                            key={`contact-${index}`}
                            className="grid grid-cols-1 items-start gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_36px]"
                          >
                            <FieldWithError error={error.value}>
                              <Input
                                value={contact.contactName ?? ""}
                                onChange={(e) =>
                                  onContactChange(index, "contactName", e.target.value)
                                }
                                disabled={readOnly}
                                placeholder={t("admin.companies.contactNameExample", {
                                  defaultValue: "Nguyen Van A",
                                })}
                              />
                            </FieldWithError>
                            <FieldWithError error={error.value}>
                              <Input
                                value={contact.value}
                                onChange={(e) => onContactChange(index, "value", e.target.value)}
                                disabled={readOnly}
                                placeholder={CONTACT_TYPE_EXAMPLES["contact_person"] || ""}
                              />
                            </FieldWithError>
                            {renderRemoveButton(index)}
                          </div>
                        )
                      })}

                    {/* simple layout: Value only (email, website, address) */}
                    {group.layout === "simple" &&
                      groupContacts.map(({ contact, index }) => {
                        const error = errors.contacts[index] ?? {}
                        const example =
                          CONTACT_TYPE_EXAMPLES[
                            String(contact.type || "") as AdminCompanyContactType
                          ]
                        return (
                          <div
                            key={`contact-${index}`}
                            className="grid grid-cols-1 items-start gap-2 md:grid-cols-[minmax(0,1fr)_36px]"
                          >
                            <FieldWithError error={error.value}>
                              <Input
                                value={contact.value}
                                onChange={(e) => onContactChange(index, "value", e.target.value)}
                                disabled={readOnly}
                                placeholder={example || ""}
                              />
                            </FieldWithError>
                            {renderRemoveButton(index)}
                          </div>
                        )
                      })}

                    {/* full layout: Type | Value | (Contact Name) */}
                    {group.layout === "full" &&
                      groupContacts.map(({ contact, index }) => {
                        const error = errors.contacts[index] ?? {}
                        const example =
                          CONTACT_TYPE_EXAMPLES[
                            String(contact.type || "") as AdminCompanyContactType
                          ]
                        const groupTypeOptions = CONTACT_TYPE_OPTIONS.filter((o) =>
                          group.key === "other"
                            ? !ALL_KNOWN_CONTACT_TYPES.has(o.value)
                            : group.types.has(o.value)
                        ).map((option) => ({
                          value: option.value,
                          label: t(`admin.companies.contactTypes.${option.value}`, {
                            defaultValue: option.label,
                          }),
                        }))
                        return (
                          <div
                            key={`contact-${index}`}
                            className={`grid grid-cols-1 items-start gap-2 ${group.showContactName ? "md:grid-cols-[130px_minmax(0,1fr)_minmax(0,1fr)_36px]" : "md:grid-cols-[130px_minmax(0,1fr)_36px]"}`}
                          >
                            <FieldWithError error={error.type}>
                              <SearchableSelect
                                value={String(contact.type || "")}
                                onValueChange={(value) => onContactChange(index, "type", value)}
                                disabled={readOnly}
                                options={groupTypeOptions}
                                placeholder={t("admin.companies.contactType", {
                                  defaultValue: "Type",
                                })}
                                searchPlaceholder={t("common.search", { defaultValue: "Search" })}
                                emptyText={t("common.noResults", { defaultValue: "No results." })}
                              />
                            </FieldWithError>
                            <FieldWithError error={error.value}>
                              <Input
                                value={contact.value}
                                onChange={(e) => onContactChange(index, "value", e.target.value)}
                                disabled={readOnly}
                                placeholder={example || ""}
                              />
                            </FieldWithError>
                            {group.showContactName && (
                              <Input
                                value={contact.contactName ?? ""}
                                onChange={(e) =>
                                  onContactChange(index, "contactName", e.target.value)
                                }
                                disabled={readOnly}
                                placeholder={t("admin.companies.contactNameExample", {
                                  defaultValue: "Nguyen Van A",
                                })}
                              />
                            )}
                            {renderRemoveButton(index)}
                          </div>
                        )
                      })}
                  </div>
                )
              }

              return rowGroupOrder.map((rgKey) => {
                const groups = groupsByRow[rgKey]
                const isSideBySide = groups.length > 1
                const contents = groups.map(renderGroup)
                if (contents.every((c) => c === null)) return null
                return (
                  <div
                    key={rgKey}
                    className={isSideBySide ? "grid grid-cols-1 gap-4 md:grid-cols-2" : ""}
                  >
                    {contents}
                  </div>
                )
              })
            })()}
          </div>

          <div className="space-y-3 border-t pt-4">
            <Field className="gap-1.5">
              <FieldLabel className="text-foreground text-sm font-medium">
                {t("register.placeholders.introduction", { defaultValue: "Description" })}
              </FieldLabel>
              <Textarea
                value={form.description}
                onChange={(e) => onFieldChange("description", e.target.value)}
                placeholder={t("admin.companies.fieldExamples.description", {
                  defaultValue: "Ex: Manufacturing industrial valves and fittings",
                })}
                rows={3}
                disabled={readOnly}
              />
            </Field>
          </div>

          <div className="flex gap-3 border-t border-gray-400 pt-4">
            <Button
              variant="outline"
              className="hover:!bg-header-red-dark flex-1 border !border-gray-400 bg-transparent hover:!text-white"
              onClick={onClose}
            >
              {readOnly
                ? t("common.close", { defaultValue: "Close" })
                : t("account.cancel", { defaultValue: "Cancel" })}
            </Button>
            {!readOnly && (
              <Button
                className="!bg-header-red-dark hover:!bg-header-red-dark/80 flex-1 text-white hover:!text-white"
                onClick={onSave}
                disabled={isSaving}
              >
                <Save className="mr-2 h-4 w-4" />
                {t("account.saveChanges", { defaultValue: "Save Changes" })}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
