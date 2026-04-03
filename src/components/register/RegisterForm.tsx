"use client"

import { useRegisterMutation } from "@/api/auth/hooks"
import { formDataToRegisterPayload } from "@/types/auth"
import { INITIAL_REGISTER_FORM, type RegisterFormData } from "./registerConstants"
import { getCountryOptions } from "./registerOptions"
import { REGISTER_CATEGORIES } from "./registerCategories"
import { useCaptcha } from "./useCaptcha"
import { createRegisterFormSchema } from "./registerSchema"
import type { ZodIssue } from "zod"
import { useForm } from "@tanstack/react-form-nextjs"
import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, RefreshCw, CheckCircle2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import Input from "../ui/Input"
import Select from "../ui/Select"
import Textarea from "../ui/Textarea"
import Button from "../ui/Button"
import { Toast, type ToastVariant } from "../ui/Toast"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { RequiredMark, stripTrailingAsterisk } from "@/components/ui/required-mark"
import { SearchableSelect } from "@/components/ui/SearchableSelect"

function getErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as { data?: { message?: string } }).data
    if (data && typeof data.message === "string") return data.message
  }
  return ""
}

function isCaptchaInvalidOrExpired(status: number | undefined, message: string): boolean {
  if (status !== 400) return false
  const normalized = message.trim().toLowerCase()
  return (
    normalized.includes("captcha") &&
    (normalized.includes("invalid") || normalized.includes("expired"))
  )
}

function zodIssuesToFieldErrors(
  issues: ZodIssue[]
): Partial<Record<keyof RegisterFormData, string>> {
  const next: Partial<Record<keyof RegisterFormData, string>> = {}
  for (const issue of issues) {
    const k = issue.path[0]
    if (typeof k === "string" && !(k in next) && k in INITIAL_REGISTER_FORM) {
      next[k as keyof RegisterFormData] = issue.message
    }
  }
  return next
}

export default function RegisterForm() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>(
    {}
  )
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant; visible: boolean }>({
    message: "",
    variant: "info",
    visible: false,
  })
  const showToast = (message: string, variant: ToastVariant = "info") =>
    setToast({ message, variant, visible: true })
  const hideToast = () =>
    setToast((prev: { message: string; variant: ToastVariant; visible: boolean }) => ({
      ...prev,
      visible: false,
    }))

  const registerSchema = useMemo(() => createRegisterFormSchema(t), [t])

  const registerMutation = useRegisterMutation()

  const {
    input: captchaInput,
    setInput: setCaptchaInput,
    captchaId,
    visual: captchaVisual,
    canvasRef,
    refresh: refreshCaptcha,
    isValid: isCaptchaValid,
    isLoading: isCaptchaLoading,
    loadFailed: captchaLoadFailed,
    isRateLimited: isCaptchaRateLimited,
  } = useCaptcha()

  const tooManyRequestsMsg =
    t("register.errors.tooManyRequests") || "Too many requests. Please wait and try again."
  const refreshCaptchaWith429Notice = async () => {
    const result = await refreshCaptcha()
    if (result === "rate_limited") {
      showToast(tooManyRequestsMsg, "warning")
    }
  }

  const countries = getCountryOptions(i18n.language)
  const categories = REGISTER_CATEGORIES.map((cat) => ({
    id: cat.id,
    name: t(cat.i18nKey) || `${cat.code}. ${cat.fallback}`,
  }))

  const form = useForm({
    defaultValues: INITIAL_REGISTER_FORM,
    onSubmit: async ({ value }) => {
      setFieldErrors({})
      const parsed = registerSchema.safeParse(value)
      if (!parsed.success) {
        setFieldErrors(zodIssuesToFieldErrors(parsed.error.issues))
        setTimeout(
          () =>
            document.querySelector("[data-slot='field-error']")?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            }),
          100
        )
        return
      }

      if (!isCaptchaValid) {
        showToast(t("register.errors.captcha") || "驗證碼錯誤，請重新輸入", "warning")
        await refreshCaptchaWith429Notice()
        return
      }
      if (captchaLoadFailed || !captchaId) {
        if (isCaptchaRateLimited) {
          showToast(tooManyRequestsMsg, "warning")
          return
        }
        showToast(
          t("register.errors.submit") ||
            "Captcha challenge unavailable. Please refresh and try again.",
          "error"
        )
        return
      }

      const payload = formDataToRegisterPayload({
        ...parsed.data,
        captchaId,
        captcha: captchaInput,
      })
      if (process.env.NODE_ENV !== "production") {
        console.debug("[Register] Request payload:", payload)
      }

      try {
        await registerMutation.mutateAsync(payload)
        form.reset()
        await refreshCaptchaWith429Notice()
        setRegistrationSuccess(true)
      } catch (err) {
        const status =
          err && typeof err === "object" && "status" in err
            ? (err as { status: number }).status
            : undefined
        const data =
          err && typeof err === "object" && "data" in err
            ? (err as { data: unknown }).data
            : undefined
        console.error("[Register] Error:", { status, data, fullError: err })
        const msg = getErrorMessage(err)
        if (status === 409) {
          showToast(
            msg ||
              t("register.errors.duplicate409") ||
              "This account has already submitted a registration request.",
            "error"
          )
        } else if (isCaptchaInvalidOrExpired(status, msg)) {
          showToast(
            msg || t("register.errors.captcha") || "Invalid captcha, please try again.",
            "warning"
          )
          await refreshCaptchaWith429Notice()
        } else {
          showToast(msg || t("register.errors.submit") || "註冊失敗，請稍後再試", "error")
        }
      }
    },
  })

  const clearFieldError = (name: keyof RegisterFormData) => {
    setFieldErrors((prev) => {
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  const captchaPlaceholder = t("register.placeholders.captcha") || "請輸入驗證碼"
  const captchaRefreshTitle = t("register.captchaRefresh") || "點擊刷新驗證碼"

  if (registrationSuccess) {
    return (
      <div className="bg-body-bg-dark pt-14">
        <div className="container mx-auto max-w-2xl px-4 py-8">
          <div className="bg-body-bg-light rounded-lg border border-gray-300 p-8 text-center">
            <CheckCircle2 className="text-primary mx-auto mb-4 h-16 w-16" />
            <h2 className="text-foreground mb-2 text-xl font-bold">
              {t("register.successPending")}
            </h2>
            <p className="text-muted-foreground mb-6">{t("register.successPendingWait")}</p>
            <ul className="text-muted-foreground mb-8 list-inside list-disc space-y-2 text-left text-sm">
              <li>{t("register.successPendingIfApproved")}</li>
              <li>{t("register.successPendingIfNotApproved")}</li>
            </ul>
            <Button type="button" variant="primary" onClick={() => router.push("/")}>
              {t("register.successPendingBackHome")}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-body-bg-dark pt-14">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Link
          href="/"
          className="text-muted-foreground hover:text-primary mb-6 inline-flex items-center text-sm"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          {t("register.backToHome") || "返回首頁"}
        </Link>

        <div className="bg-body-bg-light rounded-lg border border-gray-300 p-6 md:p-8">
          <h1 className="text-primary mb-8 text-center text-2xl font-bold md:text-3xl">
            {t("register.title") || "會員註冊"}
          </h1>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              void form.handleSubmit()
            }}
            className="registration-form space-y-4"
          >
            <form.Subscribe
              selector={(state) => state.values}
              children={(values) => (
                <>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field className="gap-1.5">
                        <FieldLabel className="text-foreground text-sm font-medium">
                          {stripTrailingAsterisk(
                            t("register.placeholders.companyNameVi") || "公司名稱（越文）"
                          )}
                          <RequiredMark />
                        </FieldLabel>
                        <Input
                          placeholder={
                            t("register.placeholders.companyNameVi") || "公司名稱（越文）"
                          }
                          value={values.companyNameVi}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            form.setFieldValue("companyNameVi", e.target.value)
                            clearFieldError("companyNameVi")
                          }}
                          required
                        />
                        <FieldError
                          errors={
                            fieldErrors.companyNameVi
                              ? [{ message: fieldErrors.companyNameVi }]
                              : undefined
                          }
                        />
                      </Field>
                      <Field className="gap-1.5">
                        <FieldLabel className="text-foreground text-sm font-medium">
                          {stripTrailingAsterisk(
                            t("register.placeholders.companyNameCn") || "公司名稱（中文）"
                          )}
                          <RequiredMark />
                        </FieldLabel>
                        <Input
                          placeholder={
                            t("register.placeholders.companyNameCn") || "公司名稱（中文）"
                          }
                          value={values.companyNameCn}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            form.setFieldValue("companyNameCn", e.target.value)
                            clearFieldError("companyNameCn")
                          }}
                          required
                        />
                        <FieldError
                          errors={
                            fieldErrors.companyNameCn
                              ? [{ message: fieldErrors.companyNameCn }]
                              : undefined
                          }
                        />
                      </Field>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Field className="gap-1.5">
                        <FieldLabel className="text-foreground text-sm font-medium">
                          {stripTrailingAsterisk(t("register.placeholders.phone") || "電話")}
                          <RequiredMark />
                        </FieldLabel>
                        <Input
                          placeholder={t("register.placeholders.phone") || "電話"}
                          value={values.phone}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            form.setFieldValue("phone", e.target.value)
                            clearFieldError("phone")
                          }}
                          required
                        />
                        <FieldError
                          errors={fieldErrors.phone ? [{ message: fieldErrors.phone }] : undefined}
                        />
                      </Field>
                      <Field className="gap-1.5">
                        <FieldLabel className="text-foreground text-sm font-medium">
                          {stripTrailingAsterisk(t("register.placeholders.taxId") || "稅號")}
                          <RequiredMark />
                        </FieldLabel>
                        <Input
                          placeholder={t("register.placeholders.taxId") || "稅號"}
                          value={values.taxId}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            form.setFieldValue("taxId", e.target.value)
                            clearFieldError("taxId")
                          }}
                          required
                        />
                        <FieldError
                          errors={fieldErrors.taxId ? [{ message: fieldErrors.taxId }] : undefined}
                        />
                      </Field>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Field className="gap-1.5">
                        <FieldLabel className="text-foreground text-sm font-medium">
                          {stripTrailingAsterisk(
                            t("register.placeholders.contactPerson") || "聯絡人"
                          )}
                          <RequiredMark />
                        </FieldLabel>
                        <Input
                          placeholder={t("register.placeholders.contactPerson") || "聯絡人"}
                          value={values.contactPerson}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            form.setFieldValue("contactPerson", e.target.value)
                            clearFieldError("contactPerson")
                          }}
                          required
                        />
                        <FieldError
                          errors={
                            fieldErrors.contactPerson
                              ? [{ message: fieldErrors.contactPerson }]
                              : undefined
                          }
                        />
                      </Field>
                      <Field className="gap-1.5">
                        <FieldLabel className="text-foreground text-sm font-medium">
                          {stripTrailingAsterisk(
                            t("register.placeholders.contactPhone") || "聯絡人電話號碼"
                          )}
                          <RequiredMark />
                        </FieldLabel>
                        <Input
                          placeholder={t("register.placeholders.contactPhone") || "聯絡人電話號碼"}
                          value={values.contactPhone}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            form.setFieldValue("contactPhone", e.target.value)
                            clearFieldError("contactPhone")
                          }}
                          required
                        />
                        <FieldError
                          errors={
                            fieldErrors.contactPhone
                              ? [{ message: fieldErrors.contactPhone }]
                              : undefined
                          }
                        />
                      </Field>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Field className="gap-1.5">
                        <FieldLabel className="text-foreground text-sm font-medium">
                          {stripTrailingAsterisk(
                            t("register.placeholders.companyAddress") || "公司地址"
                          )}
                          <RequiredMark />
                        </FieldLabel>
                        <Input
                          placeholder={t("register.placeholders.companyAddress") || "公司地址"}
                          value={values.companyAddress}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            form.setFieldValue("companyAddress", e.target.value)
                            clearFieldError("companyAddress")
                          }}
                          required
                        />
                        <FieldError
                          errors={
                            fieldErrors.companyAddress
                              ? [{ message: fieldErrors.companyAddress }]
                              : undefined
                          }
                        />
                      </Field>
                      <Field className="gap-1.5">
                        <FieldLabel className="text-foreground text-sm font-medium">
                          {stripTrailingAsterisk(t("register.placeholders.email") || "電子郵件")}
                          <RequiredMark />
                        </FieldLabel>
                        <Input
                          type="email"
                          placeholder={t("register.placeholders.emailExample", {
                            defaultValue: "name@company.com",
                          })}
                          value={values.email}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            form.setFieldValue("email", e.target.value)
                            clearFieldError("email")
                          }}
                          required
                        />
                        <FieldError
                          errors={fieldErrors.email ? [{ message: fieldErrors.email }] : undefined}
                        />
                      </Field>
                    </div>

                    <Field className="gap-1.5">
                      <FieldLabel className="text-foreground text-sm font-medium">
                        {stripTrailingAsterisk(
                          t("register.placeholders.country") || "Select Country *"
                        )}
                        <RequiredMark />
                      </FieldLabel>
                      <SearchableSelect
                        value={values.country}
                        onValueChange={(v) => {
                          form.setFieldValue("country", v)
                          clearFieldError("country")
                        }}
                        options={countries}
                        placeholder={t("register.placeholders.country") || "Select Country *"}
                        searchPlaceholder={t("common.search", { defaultValue: "Search" })}
                        emptyText={t("common.noResults", { defaultValue: "No results." })}
                      />
                      <FieldError
                        errors={
                          fieldErrors.country ? [{ message: fieldErrors.country }] : undefined
                        }
                      />
                    </Field>

                    <Field className="gap-1.5">
                      <FieldLabel className="text-foreground text-sm font-medium">
                        {stripTrailingAsterisk(
                          t("register.placeholders.industry") || "選擇產業類別 *"
                        )}
                        <RequiredMark />
                      </FieldLabel>
                      <Select
                        value={values.industry}
                        onValueChange={(v) => {
                          form.setFieldValue("industry", v)
                          clearFieldError("industry")
                        }}
                        required
                      >
                        <Select.Trigger className="w-full">
                          <Select.Value
                            placeholder={t("register.placeholders.industry") || "選擇產業類別 *"}
                          />
                        </Select.Trigger>
                        <Select.Content>
                          {categories.map((cat) => (
                            <Select.Item key={cat.id} value={cat.id}>
                              {cat.name}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                      <FieldError
                        errors={
                          fieldErrors.industry ? [{ message: fieldErrors.industry }] : undefined
                        }
                      />
                    </Field>

                    <Field className="gap-1.5">
                      <FieldLabel className="text-foreground text-sm font-medium">
                        {stripTrailingAsterisk(t("register.placeholders.website") || "網站 *")}
                        <RequiredMark />
                      </FieldLabel>
                      <div className="space-y-1">
                        <Input
                          placeholder={
                            t("register.hints.websiteFormat") ||
                            "Example: https://your-company or http://your-company"
                          }
                          value={values.website}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            form.setFieldValue("website", e.target.value)
                            clearFieldError("website")
                          }}
                          required
                        />
                      </div>
                      <FieldError
                        errors={
                          fieldErrors.website ? [{ message: fieldErrors.website }] : undefined
                        }
                      />
                    </Field>

                    <Field className="gap-1.5">
                      <FieldLabel className="text-foreground text-sm font-medium">
                        {stripTrailingAsterisk(
                          t("register.placeholders.introduction") || "簡單介紹 *"
                        )}
                        <RequiredMark />
                      </FieldLabel>
                      <Textarea
                        placeholder={t("register.placeholders.introduction") || "簡單介紹 *"}
                        value={values.introduction}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                          form.setFieldValue("introduction", e.target.value)
                          clearFieldError("introduction")
                        }}
                        rows={4}
                        required
                      />
                      <FieldError
                        errors={
                          fieldErrors.introduction
                            ? [{ message: fieldErrors.introduction }]
                            : undefined
                        }
                      />
                    </Field>
                  </div>

                  <div className="flex w-full justify-center overflow-x-auto pt-4">
                    <div
                      role="group"
                      className="flex w-full max-w-4xl min-w-0 flex-nowrap items-center justify-center gap-3 sm:gap-4"
                    >
                      <FieldLabel className="text-foreground mb-0 shrink-0 text-sm font-medium whitespace-nowrap">
                        {stripTrailingAsterisk(captchaPlaceholder)}
                        <RequiredMark />
                      </FieldLabel>
                      <Input
                        placeholder={captchaPlaceholder}
                        value={captchaInput}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setCaptchaInput(e.target.value)
                        }
                        required
                        className="h-10 w-[min(160px,28vw)] shrink-0 sm:w-40"
                      />
                      {captchaVisual?.kind === "image" ? (
                        <button
                          type="button"
                          className="border-border bg-muted flex h-[45px] w-[150px] shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded border"
                          onClick={() => void refreshCaptchaWith429Notice()}
                          title={captchaRefreshTitle}
                          disabled={isCaptchaLoading}
                        >
                          <img
                            src={captchaVisual.src}
                            alt=""
                            className="max-h-[45px] max-w-[150px] object-contain"
                          />
                        </button>
                      ) : (
                        <canvas
                          ref={canvasRef}
                          width={150}
                          height={45}
                          className="border-border bg-muted shrink-0 cursor-pointer rounded border"
                          onClick={() => void refreshCaptchaWith429Notice()}
                          title={captchaRefreshTitle}
                        />
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => void refreshCaptchaWith429Notice()}
                        className="h-9 w-9 shrink-0"
                        title={captchaRefreshTitle}
                        disabled={isCaptchaLoading}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-center pt-6">
                    <Button
                      type="submit"
                      variant="primary"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground w-full max-w-md py-6 font-semibold"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending
                        ? t("register.processing") || "處理中..."
                        : t("register.submit") || "會員註冊"}
                    </Button>
                  </div>

                  <div className="text-muted-foreground pt-2 text-center text-sm">
                    {t("register.hasAccount") || "已經有帳號？"}{" "}
                    <Link href="/login" className="text-primary font-medium hover:underline">
                      {t("register.loginLink") || "立即登入"}
                    </Link>
                  </div>
                </>
              )}
            />
          </form>
        </div>
      </div>

      <Toast
        message={toast.message}
        variant={toast.variant}
        visible={toast.visible}
        onClose={hideToast}
        duration={3500}
      />
    </div>
  )
}
