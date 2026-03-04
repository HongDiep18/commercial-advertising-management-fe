"use client"

import type { RefObject } from "react"
import { Edit3, X, Upload, Save, ImageIcon } from "lucide-react"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Textarea from "@/components/ui/Textarea"
import Select from "@/components/ui/Select"
import { categories } from "@/components/directory/DirectorySidebar"
import { CONTRIBUTION_VALUES } from "@/contexts/user-context"
import { COUNTRY_NONE } from "./accountConstants"
import type { ProfileFormData } from "@/types/account"
import type { TFunction } from "i18next"

type CountryOption = { value: string; label: string }
type RegionOption = { value: string; label: string }

type AccountProfileModalProps = {
  open: boolean
  onClose: () => void
  profileData: ProfileFormData
  onProfileChange: (field: string, value: string) => void
  companyLogo: string | null
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  fileInputRef: RefObject<HTMLInputElement | null>
  logoUploaded: boolean
  onSave: () => void
  isSaving: boolean
  countries: CountryOption[]
  availableRegions: RegionOption[]
  regionValue: string
  hasCountry: boolean
  t: TFunction
}

export function AccountProfileModal({
  open,
  onClose,
  profileData,
  onProfileChange,
  companyLogo,
  onLogoUpload,
  fileInputRef,
  logoUploaded,
  onSave,
  isSaving,
  countries,
  availableRegions,
  regionValue,
  hasCountry,
  t,
}: AccountProfileModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-body-bg-dark max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg">
        <div className="bg-body-bg-dark border-border sticky top-0 z-10 flex items-center justify-between border-b border-gray-300 px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Edit3 className="text-primary h-5 w-5" />
            {t("account.editProfile") || "編輯會員資料"}
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
              <input
                type="file"
                ref={fileInputRef}
                onChange={onLogoUpload}
                accept="image/*"
                className="hidden"
              />
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
                {!logoUploaded && (
                  <p className="text-primary text-xs">
                    {t("account.uploadLogoPoints", {
                      count: CONTRIBUTION_VALUES.logo,
                    }) || `上傳 Logo 可獲得 ${CONTRIBUTION_VALUES.logo.toLocaleString()} 點`}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3 className="text-muted-foreground text-sm font-medium">
              {t("account.companyInfo") || "公司資料"}
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                placeholder={t("register.placeholders.companyNameVi") || "公司名稱（越文）"}
                value={profileData.companyNameVi}
                onChange={(e) => onProfileChange("companyNameVi", e.target.value)}
              />
              <Input
                placeholder={t("register.placeholders.companyNameCn") || "公司名稱（中文）"}
                value={profileData.companyNameCn}
                onChange={(e) => onProfileChange("companyNameCn", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                placeholder={t("register.placeholders.phone") || "電話"}
                value={profileData.phone}
                onChange={(e) => onProfileChange("phone", e.target.value)}
              />
              <Input
                placeholder={t("register.placeholders.taxId") || "稅號"}
                value={profileData.taxId}
                onChange={(e) => onProfileChange("taxId", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                placeholder={t("register.placeholders.contactPerson") || "聯絡人"}
                value={profileData.contactPerson}
                onChange={(e) => onProfileChange("contactPerson", e.target.value)}
              />
              <Input
                placeholder={t("register.placeholders.contactPhone") || "聯絡人電話號碼"}
                value={profileData.contactPhone}
                onChange={(e) => onProfileChange("contactPhone", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                placeholder={t("register.placeholders.companyAddress") || "公司地址"}
                value={profileData.companyAddress}
                onChange={(e) => onProfileChange("companyAddress", e.target.value)}
              />
              <Input
                placeholder={t("register.placeholders.email") || "E-Mail"}
                value={profileData.email}
                onChange={(e) => onProfileChange("email", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                value={profileData.country || COUNTRY_NONE}
                onValueChange={(value) => onProfileChange("country", value)}
                options={[
                  {
                    value: COUNTRY_NONE,
                    label: t("register.placeholders.country") || "Select Country *",
                  },
                  ...countries,
                ]}
              >
                <Select.Trigger className="w-full">
                  <Select.Value
                    placeholder={t("register.placeholders.country") || "Select Country *"}
                  />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value={COUNTRY_NONE} key="country-empty">
                    {t("register.placeholders.country") || "Select Country *"}
                  </Select.Item>
                  {countries.map((c) => (
                    <Select.Item key={c.value} value={c.value}>
                      {c.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>

              <Select
                key={profileData.country || "__no_country__"}
                value={regionValue}
                onValueChange={(value) => onProfileChange("region", value)}
                disabled={!hasCountry}
                options={availableRegions}
              >
                <Select.Trigger className="w-full">
                  <Select.Value
                    placeholder={
                      !hasCountry
                        ? t("register.placeholders.selectCountryFirst") ||
                          "Please select country first"
                        : t("register.placeholders.region") || "Select Region *"
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
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Select
                value={profileData.industry}
                onValueChange={(value) => onProfileChange("industry", value)}
              >
                <Select.Trigger className="w-full min-w-0">
                  <Select.Value
                    placeholder={t("register.placeholders.industry") || "選擇產業類別"}
                  />
                </Select.Trigger>
                <Select.Content>
                  {categories.map((cat) => (
                    <Select.Item key={cat.id} value={cat.id}>
                      {t(`directory.categories.${cat.id}`) || cat.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>

            <Input
              placeholder="Website"
              value={profileData.website}
              onChange={(e) => onProfileChange("website", e.target.value)}
            />
            <Textarea
              placeholder={t("register.placeholders.introduction") || "簡單介紹"}
              value={profileData.introduction}
              onChange={(e) => onProfileChange("introduction", e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex gap-3 border-t border-gray-400 pt-4">
            <Button
              variant="outline"
              className="hover:!bg-header-red-dark flex-1 border !border-gray-400 bg-transparent hover:!text-white"
              onClick={onClose}
            >
              {t("account.cancel") || "取消"}
            </Button>
            <Button
              className="!bg-header-red-dark hover:!bg-header-red-dark/80 flex-1 text-white hover:!text-white"
              onClick={onSave}
              disabled={isSaving}
            >
              <Save className="mr-2 h-4 w-4" />
              {t("account.saveChanges") || "儲存變更"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
