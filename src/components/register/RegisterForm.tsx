"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, RefreshCw } from "lucide-react"
import { useTranslation } from "react-i18next"
import Input from "../ui/Input"
import Select from "../ui/Select"
import Textarea from "../ui/Textarea"
import Button from "../ui/Button"
import { register } from "@/api/auth"
import { formDataToRegisterPayload } from "@/types/auth"
import { useUser } from "@/contexts/user-context"
import {
  INITIAL_REGISTER_FORM,
  type RegisterFormData,
  type RegisterMembershipTier,
} from "./registerConstants"
import { useCaptcha } from "./useCaptcha"

function getErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as { data?: { message?: string } }).data
    if (data && typeof data.message === "string") return data.message
  }
  return ""
}

const MEMBERSHIP_TIER_OPTIONS: { value: RegisterMembershipTier; labelKey: string }[] = [
  { value: "bronze", labelKey: "register.tiers.bronze" },
  { value: "silver", labelKey: "register.tiers.silver" },
  { value: "gold", labelKey: "register.tiers.gold" },
  { value: "diamond", labelKey: "register.tiers.diamond" },
]

export default function RegisterForm() {
  const { t } = useTranslation()
  const router = useRouter()
  const { loginWithRegisteredUser } = useUser()
  const [formData, setFormData] = useState<RegisterFormData>(INITIAL_REGISTER_FORM)
  const [isLoading, setIsLoading] = useState(false)
  const {
    input: captchaInput,
    setInput: setCaptchaInput,
    canvasRef,
    refresh: refreshCaptcha,
    isValid: isCaptchaValid,
  } = useCaptcha()

  const countries = [
    { value: "vietnam", label: t("register.countries.vietnam") || "越南" },
    { value: "taiwan", label: t("register.countries.taiwan") || "台灣" },
    { value: "china", label: t("register.countries.china") || "中國" },
    { value: "singapore", label: t("register.countries.singapore") || "新加坡" },
    { value: "other", label: t("register.countries.other") || "其他" },
  ]

  const regions: Record<string, Array<{ value: string; label: string }>> = {
    vietnam: [
      { value: "hcm", label: t("register.regions.hcm") || "胡志明市" },
      { value: "hanoi", label: t("register.regions.hanoi") || "河內" },
      { value: "binhduong", label: t("register.regions.binhduong") || "平陽" },
      { value: "dongnai", label: t("register.regions.dongnai") || "同奈" },
      { value: "danang", label: t("register.regions.danang") || "峴港" },
      { value: "haiphong", label: t("register.regions.haiphong") || "海防" },
    ],
    taiwan: [
      { value: "taipei", label: t("register.regions.taipei") || "台北" },
      { value: "taichung", label: t("register.regions.taichung") || "台中" },
      { value: "kaohsiung", label: t("register.regions.kaohsiung") || "高雄" },
    ],
    china: [
      { value: "beijing", label: t("register.regions.beijing") || "北京" },
      { value: "shanghai", label: t("register.regions.shanghai") || "上海" },
      { value: "guangzhou", label: t("register.regions.guangzhou") || "廣州" },
    ],
    singapore: [{ value: "singapore", label: t("register.regions.singapore") || "新加坡" }],
    other: [{ value: "other", label: t("register.regions.other") || "其他" }],
  }

  const availableRegions = formData.country ? (regions[formData.country] ?? []) : []

  const categories = [
    { id: "semi", name: t("search.categories.semi") },
    { id: "elec", name: t("search.categories.elec") },
    { id: "textile", name: t("search.categories.textile") },
    { id: "food", name: t("search.categories.food") },
    { id: "machine", name: t("search.categories.machine") },
    { id: "plastic", name: t("search.categories.plastic") },
  ]

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData((prev) =>
      field === "country" ? { ...prev, [field]: value, region: "" } : { ...prev, [field]: value }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isCaptchaValid) {
      alert(t("register.errors.captcha") || "驗證碼錯誤，請重新輸入")
      refreshCaptcha()
      return
    }

    setIsLoading(true)
    try {
      const payload = formDataToRegisterPayload({ ...formData, captcha: captchaInput })
      await register(payload)
      loginWithRegisteredUser(
        formData.email,
        formData.contactPerson || formData.companyNameCn || formData.email.split("@")[0],
        formData.membershipTier
      )
      alert(t("register.success") || "註冊成功！")
      setFormData({ ...INITIAL_REGISTER_FORM })
      refreshCaptcha()
      router.push("/account")
    } catch (err) {
      const msg = getErrorMessage(err)
      alert(msg || t("register.errors.submit") || "註冊失敗，請稍後再試")
    } finally {
      setIsLoading(false)
    }
  }

  const captchaPlaceholder = t("register.placeholders.captcha") || "請輸入驗證碼"
  const captchaRefreshTitle = t("register.captchaRefresh") || "點擊刷新驗證碼"

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
                <Input
                  placeholder={t("register.placeholders.companyNameVi") || "公司名稱（越文）"}
                  value={formData.companyNameVi}
                  onChange={(e) => handleInputChange("companyNameVi", e.target.value)}
                  required
                />
                <Input
                  placeholder={t("register.placeholders.companyNameCn") || "公司名稱（中文）"}
                  value={formData.companyNameCn}
                  onChange={(e) => handleInputChange("companyNameCn", e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  placeholder={t("register.placeholders.phone") || "電話"}
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                />
                <Input
                  placeholder={t("register.placeholders.taxId") || "稅號"}
                  value={formData.taxId}
                  onChange={(e) => handleInputChange("taxId", e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  placeholder={t("register.placeholders.contactPerson") || "聯絡人"}
                  value={formData.contactPerson}
                  onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                  required
                />
                <Input
                  placeholder={t("register.placeholders.contactPhone") || "聯絡人電話號碼"}
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  placeholder={t("register.placeholders.companyAddress") || "公司地址"}
                  value={formData.companyAddress}
                  onChange={(e) => handleInputChange("companyAddress", e.target.value)}
                  required
                />
                <Input
                  type="email"
                  placeholder={t("register.placeholders.email") || "電子郵件"}
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>

              <div className="registration-form grid grid-cols-1 gap-4 md:grid-cols-3">
                <Select
                  value={formData.country}
                  onValueChange={(value) => handleInputChange("country", value)}
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
                <Select
                  value={formData.region}
                  onValueChange={(value) => handleInputChange("region", value)}
                  disabled={!formData.country}
                  required
                >
                  <Select.Trigger className="w-full">
                    <Select.Value
                      placeholder={
                        !formData.country
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
                <Select
                  value={formData.industry}
                  onValueChange={(value) => handleInputChange("industry", value)}
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
              </div>

              <Input
                placeholder={t("register.placeholders.website") || "網站 *"}
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                required
              />

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

              <Textarea
                placeholder={t("register.placeholders.introduction") || "簡單介紹 *"}
                value={formData.introduction}
                onChange={(e) => handleInputChange("introduction", e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="flex items-center justify-center gap-4 pt-4">
              <Input
                placeholder={captchaPlaceholder}
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
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
    </div>
  )
}
