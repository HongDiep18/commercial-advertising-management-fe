"use client"

import { useMemo, useRef, useState, type ReactNode } from "react"
import { AlertCircle, Lock } from "lucide-react"
import { useTranslation } from "react-i18next"
import {
  adminCompanyDetailToRegisterFormData,
  unlinkedCompanyToAdminCompanyDetail,
} from "@/api/admin-companies/mapper"
import {
  useAdminCompaniesNoUser,
  useAdminCreateCompanyMutation,
  useAssignUserToCompanyMutation,
} from "@/api/admin-companies/hooks"
import { getAdminCompanyDetail } from "@/api/admin-companies/service"
import { REGISTER_CATEGORIES } from "@/components/register/registerCategories"
import {
  INITIAL_REGISTER_FORM,
  type RegisterFormData,
} from "@/components/register/registerConstants"
import { getRegisterCountryOptions } from "@/components/register/registerOptions"
import {
  REGISTER_COMPANY_SELECT_READONLY_FIELDS,
  REGISTER_ERROR_KEYS,
  validateRegisterForm,
} from "@/components/register/registerValidation"
import Button from "@/components/ui/Button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import Input from "@/components/ui/Input"
import { RequiredMark, stripTrailingAsterisk } from "@/components/ui/required-mark"
import { UnlinkedCompanySelect } from "@/components/admin/UnlinkedCompanySelect"
import { SearchableMultiSelect } from "@/components/ui/SearchableMultiSelect"
import { SearchableSelect } from "@/components/ui/SearchableSelect"
import Textarea from "@/components/ui/Textarea"
import { Toast, type ToastVariant } from "@/components/ui/Toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formDataToAdminCreatePayload } from "@/types/auth"
import { cn } from "@/lib/utils"

function ReadOnlyFieldShell({
  readOnly,
  readOnlyLabel,
  children,
}: {
  readOnly: boolean
  readOnlyLabel: string
  children: ReactNode
}) {
  if (!readOnly) return <>{children}</>

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="group relative w-full">
          {children}
          <span
            className="text-muted-foreground border-border/60 bg-background/95 pointer-events-none absolute top-1/2 right-2 z-[1] flex -translate-y-1/2 items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
            aria-hidden
          >
            <Lock className="h-3 w-3 shrink-0" />
            {readOnlyLabel}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={6}>
        {readOnlyLabel}
      </TooltipContent>
    </Tooltip>
  )
}

const FIELD_ORDER: (keyof RegisterFormData)[] = [
  "companyNameVi",
  "companyNameCn",
  "phone",
  "taxId",
  "contactPerson",
  "contactPhone",
  "companyAddress",
  "email",
  "companyEmail",
  "country",
  "industry",
  "website",
  "introduction",
]

type Props = {
  onSuccess: () => void
  onCancel: () => void
}

export function AddMemberForm({ onSuccess, onCancel }: Props) {
  const { t, i18n } = useTranslation()

  const [form, setForm] = useState<RegisterFormData>(INITIAL_REGISTER_FORM)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>(
    {}
  )
  const [companyNameMode, setCompanyNameMode] = useState<"manual" | "select">("manual")
  const [selectedCompanyId, setSelectedCompanyId] = useState("")
  const [isLoadingCompanyDetail, setIsLoadingCompanyDetail] = useState(false)
  const [hasSubmitAttempted, setHasSubmitAttempted] = useState(false)
  const [toast, setToast] = useState<{
    message: string
    variant: ToastVariant
    visible: boolean
  }>({ message: "", variant: "info", visible: false })

  const showToast = (message: string, variant: ToastVariant = "info") =>
    setToast({ message, variant, visible: true })
  const hideToast = () => setToast((prev) => ({ ...prev, visible: false }))

  const formRef = useRef<HTMLFormElement>(null)

  const scrollToFirstError = (errors: Partial<Record<keyof RegisterFormData, string>>) => {
    setHasSubmitAttempted(true)
    setTimeout(() => {
      const firstKey = FIELD_ORDER.find((k) => errors[k])
      if (!firstKey) return
      document
        .getElementById(`field-${firstKey}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 50)
  }

  const adminCreateMutation = useAdminCreateCompanyMutation()
  const assignUserMutation = useAssignUserToCompanyMutation()

  const countries = useMemo(
    () =>
      getRegisterCountryOptions(
        i18n.language,
        t("register.countries.other", { defaultValue: "Other" })
      ),
    [i18n.language, t]
  )
  const categories = useMemo(
    () =>
      REGISTER_CATEGORIES.map((cat) => ({
        id: cat.id,
        name: t(cat.i18nKey) || `${cat.code}. ${cat.fallback}`,
      })),
    [t]
  )

  const {
    data: unlinkedCompaniesData,
    isLoading: isCompaniesLoading,
    isError: isCompaniesError,
    refetch: refetchUnlinkedCompanies,
  } = useAdminCompaniesNoUser(companyNameMode === "select")

  const clearFieldError = (name: keyof RegisterFormData) => {
    setFieldErrors((prev) => {
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  const applyCompanyToForm = (companyId: string) => {
    const item = unlinkedCompaniesData?.companies.find((c) => c.id === companyId)
    if (item) {
      setForm((f) => ({
        ...adminCompanyDetailToRegisterFormData(unlinkedCompanyToAdminCompanyDetail(item)),
        email: f.email,
      }))
      setFieldErrors({})
      return true
    }
    return false
  }

  const handleCompanySelect = async (companyId: string) => {
    setSelectedCompanyId(companyId)
    if (!companyId) {
      setForm((f) => ({ ...INITIAL_REGISTER_FORM, email: f.email }))
      setFieldErrors({})
      return
    }

    if (applyCompanyToForm(companyId)) return

    setIsLoadingCompanyDetail(true)
    try {
      const detail = await getAdminCompanyDetail(companyId)
      setForm((f) => ({
        ...adminCompanyDetailToRegisterFormData(detail),
        email: f.email,
      }))
      setFieldErrors({})
    } catch {
      showToast(
        t("admin.users.companyDetailLoadError", {
          defaultValue: "Unable to load company details.",
        }),
        "error"
      )
    } finally {
      setIsLoadingCompanyDetail(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    if (companyNameMode === "select") {
      if (!selectedCompanyId) {
        showToast(
          t("admin.users.companySelectRequired", {
            defaultValue: "Please select a company from the list.",
          }),
          "warning"
        )
        return
      }

      const validation = validateRegisterForm(form, {
        excludeFields: REGISTER_COMPANY_SELECT_READONLY_FIELDS,
      })
      if (!validation.valid) {
        const errors: Partial<Record<keyof RegisterFormData, string>> = {}
        for (const err of validation.errors) {
          if (!errors[err.field]) errors[err.field] = t(REGISTER_ERROR_KEYS[err.kind])
        }
        setFieldErrors(errors)
        scrollToFirstError(errors)
        return
      }

      try {
        await assignUserMutation.mutateAsync({
          companyId: selectedCompanyId,
          payload: { email: form.email },
        })
        onSuccess()
      } catch (err) {
        const status = (err as { status?: number })?.status
        const msg =
          err && typeof err === "object" && "data" in err
            ? ((err as { data?: { message?: string } }).data?.message ?? "")
            : ""
        if (status === 409) {
          showToast(
            msg ||
              t("admin.users.assignErrorConflict", {
                defaultValue:
                  "This company already has a user, or this email is already linked to another company.",
              }),
            "error"
          )
        } else if (status === 404) {
          showToast(
            msg || t("admin.users.assignErrorNotFound", { defaultValue: "Company not found." }),
            "error"
          )
        } else if (status === 400) {
          showToast(
            msg ||
              t("admin.users.assignErrorNotApproved", {
                defaultValue: "Company is not approved.",
              }),
            "error"
          )
        } else {
          showToast(msg || t("admin.users.createError"), "error")
        }
      }
      return
    }

    const validation = validateRegisterForm(form)
    if (!validation.valid) {
      const errors: Partial<Record<keyof RegisterFormData, string>> = {}
      for (const err of validation.errors) {
        if (!errors[err.field]) errors[err.field] = t(REGISTER_ERROR_KEYS[err.kind])
      }
      setFieldErrors(errors)
      scrollToFirstError(errors)
      return
    }

    try {
      await adminCreateMutation.mutateAsync(formDataToAdminCreatePayload(form))
      onSuccess()
    } catch (err) {
      const status = (err as { status?: number })?.status
      const msg =
        err && typeof err === "object" && "data" in err
          ? ((err as { data?: { message?: string } }).data?.message ?? "")
          : ""
      if (status === 409) {
        showToast(msg || t("admin.users.createErrorDuplicate"), "error")
      } else {
        showToast(msg || t("admin.users.createError"), "error")
      }
    }
  }

  const fieldsReadOnly = companyNameMode === "select"
  const readOnlyFieldLabel = t("admin.users.readOnlyField", { defaultValue: "Read-only" })
  const readOnlyInputClass = fieldsReadOnly
    ? "read-only:bg-muted/50 read-only:cursor-default read-only:pr-24 read-only:focus-visible:ring-0 read-only:focus-visible:ring-offset-0"
    : ""

  const companyNameFields = (
    <div className="grid gap-4 md:grid-cols-2">
      <Field className="gap-1.5">
        <FieldLabel className="text-foreground text-sm font-medium">
          {stripTrailingAsterisk(t("register.placeholders.companyNameVi") || "公司名稱（越文）")}
          <RequiredMark />
        </FieldLabel>
        <ReadOnlyFieldShell readOnly={fieldsReadOnly} readOnlyLabel={readOnlyFieldLabel}>
          <Input
            id="field-companyNameVi"
            readOnly={fieldsReadOnly}
            className={readOnlyInputClass}
            placeholder={t("register.placeholders.companyNameVi") || "公司名稱（越文）"}
            value={form.companyNameVi}
            onChange={(e) => {
              setForm((f) => ({ ...f, companyNameVi: e.target.value }))
              clearFieldError("companyNameVi")
            }}
          />
        </ReadOnlyFieldShell>
        <FieldError
          errors={fieldErrors.companyNameVi ? [{ message: fieldErrors.companyNameVi }] : undefined}
        />
      </Field>
      <Field className="gap-1.5">
        <FieldLabel className="text-foreground text-sm font-medium">
          {stripTrailingAsterisk(t("register.placeholders.companyNameZh") || "公司名稱（中文）")}
          <RequiredMark />
        </FieldLabel>
        <ReadOnlyFieldShell readOnly={fieldsReadOnly} readOnlyLabel={readOnlyFieldLabel}>
          <Input
            id="field-companyNameCn"
            readOnly={fieldsReadOnly}
            className={readOnlyInputClass}
            placeholder={t("register.placeholders.companyNameZh") || "公司名稱（中文）"}
            value={form.companyNameCn}
            onChange={(e) => {
              setForm((f) => ({ ...f, companyNameCn: e.target.value }))
              clearFieldError("companyNameCn")
            }}
          />
        </ReadOnlyFieldShell>
        <FieldError
          errors={fieldErrors.companyNameCn ? [{ message: fieldErrors.companyNameCn }] : undefined}
        />
      </Field>
    </div>
  )

  return (
    <TooltipProvider delayDuration={200}>
      <form
        ref={formRef}
        className="space-y-4 px-6 pt-4 pb-6"
        onSubmit={(e) => {
          void handleSubmit(e)
        }}
      >
        {hasSubmitAttempted && Object.keys(fieldErrors).length > 0 && (
          <div className="bg-destructive/10 border-destructive/20 text-destructive flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>
              {t("admin.users.formErrorBanner", {
                count: Object.keys(fieldErrors).length,
                defaultValue: "{{count}} field(s) need attention — scroll up to review",
              })}
            </span>
          </div>
        )}
        <div className="space-y-3">
          <div className="flex overflow-hidden rounded-md border">
            <button
              type="button"
              className={cn(
                "flex-1 px-3 py-1.5 text-sm transition-colors",
                companyNameMode === "manual"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-muted"
              )}
              onClick={() => {
                setCompanyNameMode("manual")
                setSelectedCompanyId("")
                setForm((f) => ({ ...INITIAL_REGISTER_FORM, email: f.email }))
                setFieldErrors({})
                setHasSubmitAttempted(false)
              }}
            >
              {t("admin.users.companyNameManual", { defaultValue: "Type manually" })}
            </button>
            <button
              type="button"
              className={cn(
                "flex-1 px-3 py-1.5 text-sm transition-colors",
                companyNameMode === "select"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-muted"
              )}
              onClick={() => {
                setCompanyNameMode("select")
                setSelectedCompanyId("")
                setForm((f) => ({ ...INITIAL_REGISTER_FORM, email: f.email }))
                setFieldErrors({})
                setHasSubmitAttempted(false)
              }}
            >
              {t("admin.users.companyNameSelect", { defaultValue: "Select from list" })}
            </button>
          </div>

          {fieldsReadOnly && (
            <p className="text-muted-foreground text-xs">
              {t("admin.users.selectFromListReadOnlyHint", {
                defaultValue:
                  "Company details are filled from your selection. Only Register Email and Captcha can be edited.",
              })}
            </p>
          )}

          {companyNameMode === "manual" ? (
            companyNameFields
          ) : (
            <div className="space-y-4">
              <Field className="gap-1.5">
                <FieldLabel className="text-foreground text-sm font-medium">
                  {t("admin.users.companyNameSelectLabel", { defaultValue: "Company" })}
                  <RequiredMark />
                </FieldLabel>
                <UnlinkedCompanySelect
                  value={selectedCompanyId}
                  onValueChange={(id) => {
                    void handleCompanySelect(id)
                  }}
                  companies={unlinkedCompaniesData?.companies ?? []}
                  isLoading={isCompaniesLoading}
                  isError={isCompaniesError}
                  onRetry={() => void refetchUnlinkedCompanies()}
                  disabled={isLoadingCompanyDetail}
                />
              </Field>
              {companyNameFields}
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field className="gap-1.5">
            <FieldLabel className="text-foreground text-sm font-medium">
              {stripTrailingAsterisk(t("register.placeholders.phone") || "電話")}
              <RequiredMark />
            </FieldLabel>
            <ReadOnlyFieldShell readOnly={fieldsReadOnly} readOnlyLabel={readOnlyFieldLabel}>
              <Input
                id="field-phone"
                readOnly={fieldsReadOnly}
                className={readOnlyInputClass}
                placeholder={t("register.placeholders.phone") || "電話"}
                value={form.phone}
                onChange={(e) => {
                  setForm((f) => ({ ...f, phone: e.target.value }))
                  clearFieldError("phone")
                }}
              />
            </ReadOnlyFieldShell>
            <FieldError errors={fieldErrors.phone ? [{ message: fieldErrors.phone }] : undefined} />
          </Field>
          <Field className="gap-1.5">
            <FieldLabel className="text-foreground text-sm font-medium">
              {stripTrailingAsterisk(t("register.placeholders.taxId") || "稅號")}
              <RequiredMark />
            </FieldLabel>
            <ReadOnlyFieldShell readOnly={fieldsReadOnly} readOnlyLabel={readOnlyFieldLabel}>
              <Input
                id="field-taxId"
                readOnly={fieldsReadOnly}
                className={readOnlyInputClass}
                placeholder={t("register.placeholders.taxId") || "稅號"}
                value={form.taxId}
                onChange={(e) => {
                  setForm((f) => ({ ...f, taxId: e.target.value }))
                  clearFieldError("taxId")
                }}
              />
            </ReadOnlyFieldShell>
            <FieldError errors={fieldErrors.taxId ? [{ message: fieldErrors.taxId }] : undefined} />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field className="gap-1.5">
            <FieldLabel className="text-foreground text-sm font-medium">
              {stripTrailingAsterisk(t("register.placeholders.contactPerson") || "聯絡人")}
              <RequiredMark />
            </FieldLabel>
            <ReadOnlyFieldShell readOnly={fieldsReadOnly} readOnlyLabel={readOnlyFieldLabel}>
              <Input
                id="field-contactPerson"
                readOnly={fieldsReadOnly}
                className={readOnlyInputClass}
                placeholder={t("register.placeholders.contactPerson") || "聯絡人"}
                value={form.contactPerson}
                onChange={(e) => {
                  setForm((f) => ({ ...f, contactPerson: e.target.value }))
                  clearFieldError("contactPerson")
                }}
              />
            </ReadOnlyFieldShell>
            <FieldError
              errors={
                fieldErrors.contactPerson ? [{ message: fieldErrors.contactPerson }] : undefined
              }
            />
          </Field>
          <Field className="gap-1.5">
            <FieldLabel className="text-foreground text-sm font-medium">
              {stripTrailingAsterisk(t("register.placeholders.contactPhone") || "聯絡人電話號碼")}
              <RequiredMark />
            </FieldLabel>
            <ReadOnlyFieldShell readOnly={fieldsReadOnly} readOnlyLabel={readOnlyFieldLabel}>
              <Input
                id="field-contactPhone"
                readOnly={fieldsReadOnly}
                className={readOnlyInputClass}
                placeholder={t("register.placeholders.contactPhone") || "聯絡人電話號碼"}
                value={form.contactPhone}
                onChange={(e) => {
                  setForm((f) => ({ ...f, contactPhone: e.target.value }))
                  clearFieldError("contactPhone")
                }}
              />
            </ReadOnlyFieldShell>
            <FieldError
              errors={
                fieldErrors.contactPhone ? [{ message: fieldErrors.contactPhone }] : undefined
              }
            />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field className="gap-1.5">
            <FieldLabel className="text-foreground text-sm font-medium">
              {stripTrailingAsterisk(t("register.placeholders.companyAddress") || "公司地址")}
              <RequiredMark />
            </FieldLabel>
            <ReadOnlyFieldShell readOnly={fieldsReadOnly} readOnlyLabel={readOnlyFieldLabel}>
              <Input
                id="field-companyAddress"
                readOnly={fieldsReadOnly}
                className={readOnlyInputClass}
                placeholder={t("register.placeholders.companyAddress") || "公司地址"}
                value={form.companyAddress}
                onChange={(e) => {
                  setForm((f) => ({ ...f, companyAddress: e.target.value }))
                  clearFieldError("companyAddress")
                }}
              />
            </ReadOnlyFieldShell>
            <FieldError
              errors={
                fieldErrors.companyAddress ? [{ message: fieldErrors.companyAddress }] : undefined
              }
            />
          </Field>
          <Field
            className={cn(
              "gap-1.5",
              fieldsReadOnly && "ring-primary/30 bg-primary/5 rounded-lg p-3 ring-2"
            )}
          >
            <FieldLabel className="text-foreground text-sm font-medium">
              {stripTrailingAsterisk(t("register.placeholders.email") || "電子郵件")}
              <RequiredMark />
              {fieldsReadOnly && (
                <span className="bg-primary/10 text-primary ml-2 rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                  {t("admin.users.onlyEditableField", { defaultValue: "Only editable field" })}
                </span>
              )}
            </FieldLabel>
            <Input
              id="field-email"
              type="email"
              placeholder={t("register.placeholders.emailExample", {
                defaultValue: "name@company.com",
              })}
              value={form.email}
              onChange={(e) => {
                setForm((f) => ({ ...f, email: e.target.value }))
                clearFieldError("email")
              }}
            />
            <FieldError errors={fieldErrors.email ? [{ message: fieldErrors.email }] : undefined} />
          </Field>
        </div>

        <Field className="gap-1.5">
          <FieldLabel className="text-foreground text-sm font-medium">
            {stripTrailingAsterisk(t("register.placeholders.companyEmail") || "Company Email")}
            <RequiredMark />
          </FieldLabel>
          <ReadOnlyFieldShell readOnly={fieldsReadOnly} readOnlyLabel={readOnlyFieldLabel}>
            <Input
              id="field-companyEmail"
              readOnly={fieldsReadOnly}
              className={readOnlyInputClass}
              type="email"
              placeholder={t("register.placeholders.emailExample", {
                defaultValue: "name@company.com",
              })}
              value={form.companyEmail}
              onChange={(e) => {
                setForm((f) => ({ ...f, companyEmail: e.target.value }))
                clearFieldError("companyEmail")
              }}
            />
          </ReadOnlyFieldShell>
          <FieldError
            errors={fieldErrors.companyEmail ? [{ message: fieldErrors.companyEmail }] : undefined}
          />
        </Field>

        <div id="field-country">
          <Field className="gap-1.5">
            <FieldLabel className="text-foreground text-sm font-medium">
              {stripTrailingAsterisk(t("register.placeholders.country") || "Select Country *")}
              <RequiredMark />
            </FieldLabel>
            <ReadOnlyFieldShell readOnly={fieldsReadOnly} readOnlyLabel={readOnlyFieldLabel}>
              <SearchableSelect
                value={form.country}
                onValueChange={(v) => {
                  setForm((f) => ({ ...f, country: v }))
                  clearFieldError("country")
                }}
                options={countries}
                placeholder={t("register.placeholders.country") || "Select Country *"}
                searchPlaceholder={t("common.search", { defaultValue: "Search" })}
                emptyText={t("common.noResults", { defaultValue: "No results." })}
                disabled={fieldsReadOnly}
              />
            </ReadOnlyFieldShell>
            <FieldError
              errors={fieldErrors.country ? [{ message: fieldErrors.country }] : undefined}
            />
          </Field>
        </div>

        <div id="field-industry">
          <Field className="gap-1.5">
            <FieldLabel className="text-foreground text-sm font-medium">
              {stripTrailingAsterisk(t("register.placeholders.industry") || "選擇產業類別 *")}
              <RequiredMark />
            </FieldLabel>
            <ReadOnlyFieldShell readOnly={fieldsReadOnly} readOnlyLabel={readOnlyFieldLabel}>
              <SearchableMultiSelect
                value={form.industry}
                onValueChange={(next) => {
                  setForm((f) => ({ ...f, industry: next }))
                  clearFieldError("industry")
                }}
                options={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
                placeholder={t("register.placeholders.industry") || "選擇產業類別 *"}
                searchPlaceholder={t("common.search", { defaultValue: "Search" })}
                emptyText={t("common.noResults", { defaultValue: "No results." })}
                disabled={fieldsReadOnly}
                listMaxHeightClassName="max-h-[11.25rem]"
                formatSummary={(selected, opts) => {
                  const labels = selected
                    .map((v) => opts.find((o) => o.value === v)?.label)
                    .filter(Boolean) as string[]
                  if (labels.length === 0) return ""
                  if (labels.length <= 2) return labels.join(", ")
                  return t("account.industriesSelectedCount", { count: labels.length })
                }}
              />
            </ReadOnlyFieldShell>
            <FieldError
              errors={fieldErrors.industry ? [{ message: fieldErrors.industry }] : undefined}
            />
          </Field>
        </div>

        <Field className="gap-1.5">
          <FieldLabel className="text-foreground text-sm font-medium">
            {stripTrailingAsterisk(t("register.placeholders.website") || "網站 *")}
            <RequiredMark />
          </FieldLabel>
          <ReadOnlyFieldShell readOnly={fieldsReadOnly} readOnlyLabel={readOnlyFieldLabel}>
            <Input
              id="field-website"
              readOnly={fieldsReadOnly}
              className={readOnlyInputClass}
              placeholder={
                t("register.hints.websiteFormat") ||
                "Example: https://your-company or http://your-company"
              }
              value={form.website}
              onChange={(e) => {
                setForm((f) => ({ ...f, website: e.target.value }))
                clearFieldError("website")
              }}
            />
          </ReadOnlyFieldShell>
          <FieldError
            errors={fieldErrors.website ? [{ message: fieldErrors.website }] : undefined}
          />
        </Field>

        <Field className="gap-1.5">
          <FieldLabel className="text-foreground text-sm font-medium">
            {stripTrailingAsterisk(t("register.placeholders.introduction") || "簡單介紹 *")}
            <RequiredMark />
          </FieldLabel>
          <ReadOnlyFieldShell readOnly={fieldsReadOnly} readOnlyLabel={readOnlyFieldLabel}>
            <Textarea
              id="field-introduction"
              readOnly={fieldsReadOnly}
              className={readOnlyInputClass}
              placeholder={t("register.placeholders.introduction") || "簡單介紹 *"}
              value={form.introduction}
              onChange={(e) => {
                setForm((f) => ({ ...f, introduction: e.target.value }))
                clearFieldError("introduction")
              }}
              rows={4}
            />
          </ReadOnlyFieldShell>
          <FieldError
            errors={fieldErrors.introduction ? [{ message: fieldErrors.introduction }] : undefined}
          />
        </Field>

        <Field className="gap-1.5">
          <FieldLabel className="text-foreground text-sm font-medium">
            {t("register.placeholders.note", { defaultValue: "Note:" })}
          </FieldLabel>
          <ReadOnlyFieldShell readOnly={fieldsReadOnly} readOnlyLabel={readOnlyFieldLabel}>
            <Textarea
              readOnly={fieldsReadOnly}
              className={readOnlyInputClass}
              placeholder={t("register.placeholders.note", { defaultValue: "Note" })}
              value={form.note}
              onChange={(e) => {
                setForm((f) => ({ ...f, note: e.target.value }))
              }}
              rows={3}
            />
          </ReadOnlyFieldShell>
        </Field>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={
              companyNameMode === "select"
                ? assignUserMutation.isPending
                : adminCreateMutation.isPending
            }
          >
            {companyNameMode === "select"
              ? assignUserMutation.isPending
                ? t("common.saving")
                : t("admin.users.formAssign", { defaultValue: "Assign User" })
              : adminCreateMutation.isPending
                ? t("common.saving")
                : t("admin.users.formCreate")}
          </Button>
        </div>
      </form>

      <Toast
        message={toast.message}
        variant={toast.variant}
        visible={toast.visible}
        onClose={hideToast}
        duration={4500}
      />
    </TooltipProvider>
  )
}
