"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, RefreshCw, CheckCircle2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import Input from "../ui/Input"
import Select from "../ui/Select"
import Textarea from "../ui/Textarea"
import Button from "../ui/Button"
import { Toast, type ToastVariant } from "../ui/Toast"
import { register } from "@/api/auth"
import { formDataToRegisterPayload } from "@/types/auth"
import {
  INITIAL_REGISTER_FORM,
  type RegisterFormData,
  type RegisterMembershipTier,
} from "./registerConstants"
import { MEMBERSHIP_TIER_OPTIONS, getCountryOptions, getRegionOptions } from "./registerOptions"
import { useCaptcha } from "./useCaptcha"
import { REGISTER_ERROR_KEYS, validateRegisterForm } from "./registerValidation"

function getErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as { data?: { message?: string } }).data
    if (data && typeof data.message === "string") return data.message
  }
  return ""
}

function FieldWithError({ error, children }: { error?: string; children: React.ReactNode }) {
  return (
    <div data-field-error={error ? true : undefined}>
      {children}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}

export default function RegisterForm() {
  const { t } = useTranslation()
  const router = useRouter()
  const [formData, setFormData] = useState<RegisterFormData>(INITIAL_REGISTER_FORM)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>(
    {}
  )
  const [isLoading, setIsLoading] = useState(false)
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
  const {
    input: captchaInput,
    setInput: setCaptchaInput,
    canvasRef,
    refresh: refreshCaptcha,
    isValid: isCaptchaValid,
  } = useCaptcha()

  const countries = getCountryOptions(t)
  const availableRegions = getRegionOptions(formData.country, t)
  const hasCountry = Boolean(formData.country?.trim())
  const regionInList = hasCountry && availableRegions.some((r) => r.value === formData.region)
  const regionValue = hasCountry && regionInList ? formData.region : ""

  const categories = [
    { id: "semi", name: t("search.categories.semi") },
    { id: "elec", name: t("search.categories.elec") },
    { id: "textile", name: t("search.categories.textile") },
    { id: "food", name: t("search.categories.food") },
    { id: "machine", name: t("search.categories.machine") },
    { id: "plastic", name: t("search.categories.plastic") },
  ]

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData((prev: RegisterFormData) =>
      field === "country" ? { ...prev, [field]: value, region: "" } : { ...prev, [field]: value }
    )
    if (fieldErrors[field])
      setFieldErrors((prev: Partial<Record<keyof RegisterFormData, string>>) => ({
        ...prev,
        [field]: undefined,
      }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validation = validateRegisterForm(formData)
    if (!validation.valid) {
      const next: Partial<Record<keyof RegisterFormData, string>> = {}
      validation.errors.forEach(({ field, kind }) => {
        next[field] = t(REGISTER_ERROR_KEYS[kind])
      })
      setFieldErrors(next)
      setTimeout(
        () =>
          document.querySelector("[data-field-error]")?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          }),
        100
      )
      return
    }
    setFieldErrors({})
    if (!isCaptchaValid) {
      showToast(t("register.errors.captcha") || "驗證碼錯誤，請重新輸入", "warning")
      refreshCaptcha()
      return
    }

    setIsLoading(true)
    try {
      const payload = formDataToRegisterPayload({ ...formData, captcha: captchaInput })
      await register(payload)
      setFormData({ ...INITIAL_REGISTER_FORM })
      refreshCaptcha()
      setRegistrationSuccess(true)
    } catch (err) {
      const msg = getErrorMessage(err)
      showToast(msg || t("register.errors.submit") || "註冊失敗，請稍後再試", "error")
    } finally {
      setIsLoading(false)
    }
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

          <form onSubmit={handleSubmit} className="registration-form space-y-4">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FieldWithError error={fieldErrors.companyNameVi}>
                  <Input
                    placeholder={t("register.placeholders.companyNameVi") || "公司名稱（越文）"}
                    value={formData.companyNameVi}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("companyNameVi", e.target.value)
                    }
                    required
                  />
                </FieldWithError>
                <FieldWithError error={fieldErrors.companyNameCn}>
                  <Input
                    placeholder={t("register.placeholders.companyNameCn") || "公司名稱（中文）"}
                    value={formData.companyNameCn}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("companyNameCn", e.target.value)
                    }
                    required
                  />
                </FieldWithError>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FieldWithError error={fieldErrors.phone}>
                  <Input
                    placeholder={t("register.placeholders.phone") || "電話"}
                    value={formData.phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("phone", e.target.value)
                    }
                    required
                  />
                </FieldWithError>
                <FieldWithError error={fieldErrors.taxId}>
                  <Input
                    placeholder={t("register.placeholders.taxId") || "稅號"}
                    value={formData.taxId}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("taxId", e.target.value)
                    }
                    required
                  />
                </FieldWithError>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FieldWithError error={fieldErrors.contactPerson}>
                  <Input
                    placeholder={t("register.placeholders.contactPerson") || "聯絡人"}
                    value={formData.contactPerson}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("contactPerson", e.target.value)
                    }
                    required
                  />
                </FieldWithError>
                <FieldWithError error={fieldErrors.contactPhone}>
                  <Input
                    placeholder={t("register.placeholders.contactPhone") || "聯絡人電話號碼"}
                    value={formData.contactPhone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("contactPhone", e.target.value)
                    }
                    required
                  />
                </FieldWithError>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FieldWithError error={fieldErrors.companyAddress}>
                  <Input
                    placeholder={t("register.placeholders.companyAddress") || "公司地址"}
                    value={formData.companyAddress}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("companyAddress", e.target.value)
                    }
                    required
                  />
                </FieldWithError>
                <FieldWithError error={fieldErrors.email}>
                  <Input
                    type="email"
                    placeholder={t("register.placeholders.email") || "電子郵件"}
                    value={formData.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("email", e.target.value)
                    }
                    required
                  />
                </FieldWithError>
              </div>

              <div className="registration-form grid grid-cols-1 gap-4 md:grid-cols-3">
                <FieldWithError error={fieldErrors.country}>
                  <Select
                    value={formData.country}
                    onValueChange={(v) => handleInputChange("country", v)}
                    required
                  >
                    <Select.Trigger className="w-full">
                      <Select.Value
                        placeholder={t("register.placeholders.country") || "選擇國家 *"}
                      />
                    </Select.Trigger>
                    <Select.Content>
                      {countries.map((c) => (
                        <Select.Item key={c.value} value={c.value}>
                          {c.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </FieldWithError>
                <FieldWithError error={fieldErrors.region}>
                  <Select
                    key={formData.country || "__no_country__"}
                    value={regionValue}
                    onValueChange={(v) => handleInputChange("region", v)}
                    disabled={!hasCountry}
                    required
                  >
                    <Select.Trigger className="w-full">
                      <Select.Value
                        placeholder={
                          !hasCountry
                            ? t("register.placeholders.selectCountryFirst") || "請先選擇國家"
                            : t("register.placeholders.region") || "選擇地區 *"
                        }
                      />
                    </Select.Trigger>
                    <Select.Content>
                      {availableRegions.length > 0 ? (
                        availableRegions.map((r) => (
                          <Select.Item key={r.value} value={r.value}>
                            {r.label}
                          </Select.Item>
                        ))
                      ) : (
                        <div className="text-muted-foreground px-2 py-1.5 text-sm">
                          {t("register.noRegions") || "無可用地區"}
                        </div>
                      )}
                    </Select.Content>
                  </Select>
                </FieldWithError>
                <FieldWithError error={fieldErrors.industry}>
                  <Select
                    value={formData.industry}
                    onValueChange={(v) => handleInputChange("industry", v)}
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
                </FieldWithError>
              </div>

              <FieldWithError error={fieldErrors.website}>
                <Input
                  placeholder={t("register.placeholders.website") || "網站 *"}
                  value={formData.website}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("website", e.target.value)
                  }
                  required
                />
              </FieldWithError>

              <div className="space-y-2">
                <label className="text-foreground text-sm font-medium">
                  {t("register.membershipTierLabel") || "會員等級"}
                </label>
                <Select
                  value={formData.membershipTier}
                  onValueChange={(value) =>
                    handleInputChange("membershipTier", value as RegisterMembershipTier)
                  }
                >
                  <Select.Trigger className="w-full">
                    <Select.Value
                      placeholder={t("register.placeholders.membershipTier") || "選擇會員等級"}
                    />
                  </Select.Trigger>
                  <Select.Content>
                    {MEMBERSHIP_TIER_OPTIONS.map((opt) => (
                      <Select.Item key={opt.value} value={opt.value}>
                        {t(opt.labelKey)}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
                <p className="text-muted-foreground text-xs">
                  {t("register.membershipTierHint") ||
                    "註冊後將以此等級權限自動登入，可於會員中心查看權益。"}
                </p>
              </div>

              <FieldWithError error={fieldErrors.introduction}>
                <Textarea
                  placeholder={t("register.placeholders.introduction") || "簡單介紹 *"}
                  value={formData.introduction}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    handleInputChange("introduction", e.target.value)
                  }
                  rows={4}
                  required
                />
              </FieldWithError>
            </div>

            <div className="flex items-center justify-center gap-4 pt-4">
              <Input
                placeholder={captchaPlaceholder}
                value={captchaInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCaptchaInput(e.target.value)
                }
                required
                className="w-[20%]"
              />
              <canvas
                ref={canvasRef}
                width={150}
                height={45}
                className="border-border cursor-pointer rounded border"
                onClick={refreshCaptcha}
                title={captchaRefreshTitle}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={refreshCaptcha}
                className="h-9 w-9"
                title={captchaRefreshTitle}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex justify-center pt-6">
              <Button
                type="submit"
                variant="primary"
                className="bg-primary hover:bg-primary/90 text-primary-foreground w-full max-w-md py-6 font-semibold"
                disabled={isLoading}
              >
                {isLoading
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
