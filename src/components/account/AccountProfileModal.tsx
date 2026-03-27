"use client"

import { categories } from "@/components/directory/DirectorySidebar"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import { SearchableSelect } from "@/components/ui/SearchableSelect"
import Textarea from "@/components/ui/Textarea"
import { CONTRIBUTION_VALUES } from "@/contexts/user-context"
import type { ProfileFormData } from "@/types/account"
import type { TFunction } from "i18next"
import { Edit3, ImageIcon, Save, Upload, X } from "lucide-react"
import type { RefObject } from "react"
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
  onProfileChange: (field: string, value: string) => void
  fieldErrors?: Partial<Record<keyof ProfileFormData, string>>
  companyLogo: string | null
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  fileInputRef: RefObject<HTMLInputElement | null>
  logoUploaded: boolean
  onSave: () => void
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
  logoUploaded,
  onSave,
  isSaving,
  countries,
  allRegions,
  readOnly = false,
  t,
}: AccountProfileModalProps) {
  if (!open) return null

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
                    {!logoUploaded && (
                      <p className="text-primary text-xs">
                        {t("account.uploadLogoPoints", {
                          count: CONTRIBUTION_VALUES.logo,
                        }) || `上傳 Logo 可獲得 ${CONTRIBUTION_VALUES.logo.toLocaleString()} 點`}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3 className="text-muted-foreground text-sm font-medium">
              {t("account.companyInfo") || "公司資料"}
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldWithError error={fieldErrors.companyNameVi}>
                <Input
                  placeholder={t("register.placeholders.companyNameVi") || "公司名稱（越文）"}
                  value={profileData.companyNameVi}
                  onChange={(e) => onProfileChange("companyNameVi", e.target.value)}
                  disabled={readOnly}
                />
              </FieldWithError>
              <FieldWithError error={fieldErrors.companyNameCn}>
                <Input
                  placeholder={t("register.placeholders.companyNameCn") || "公司名稱（中文）"}
                  value={profileData.companyNameCn}
                  onChange={(e) => onProfileChange("companyNameCn", e.target.value)}
                  disabled={readOnly}
                />
              </FieldWithError>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldWithError error={fieldErrors.phone}>
                <Input
                  placeholder={t("register.placeholders.phone") || "電話"}
                  value={profileData.phone}
                  onChange={(e) => onProfileChange("phone", e.target.value)}
                  disabled={readOnly}
                />
              </FieldWithError>
              <FieldWithError error={fieldErrors.taxId}>
                <Input
                  placeholder={t("register.placeholders.taxId") || "稅號"}
                  value={profileData.taxId}
                  onChange={(e) => onProfileChange("taxId", e.target.value)}
                  disabled={readOnly}
                />
              </FieldWithError>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldWithError error={fieldErrors.contactName}>
                <Input
                  placeholder={t("register.placeholders.contactPerson") || "聯絡人"}
                  value={profileData.contactName}
                  onChange={(e) => onProfileChange("contactName", e.target.value)}
                  disabled={readOnly}
                />
              </FieldWithError>
              <FieldWithError error={fieldErrors.contactPhone}>
                <Input
                  placeholder={t("register.placeholders.contactPhone") || "聯絡人電話號碼"}
                  value={profileData.contactPhone}
                  onChange={(e) => onProfileChange("contactPhone", e.target.value)}
                  disabled={readOnly}
                />
              </FieldWithError>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldWithError error={fieldErrors.address}>
                <Input
                  placeholder={t("register.placeholders.companyAddress") || "公司地址"}
                  value={profileData.address}
                  onChange={(e) => onProfileChange("address", e.target.value)}
                  disabled={readOnly}
                />
              </FieldWithError>
              <FieldWithError error={fieldErrors.email}>
                <Input
                  placeholder={t("register.placeholders.email") || "E-Mail"}
                  value={profileData.email}
                  onChange={(e) => onProfileChange("email", e.target.value)}
                  disabled={readOnly}
                />
              </FieldWithError>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldWithError error={fieldErrors.country}>
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
              </FieldWithError>

              <FieldWithError error={fieldErrors.region}>
                <SearchableSelect
                  value={profileData.region}
                  onValueChange={(value) => onProfileChange("region", value)}
                  disabled={readOnly}
                  options={allRegions}
                  placeholder={t("register.placeholders.region") || "Select Region *"}
                  searchPlaceholder={t("common.search", { defaultValue: "Search" })}
                  emptyText={t("common.noResults", { defaultValue: "No results." })}
                />
              </FieldWithError>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <FieldWithError error={fieldErrors.industry}>
                <Select
                  value={profileData.industry}
                  onValueChange={(value) => onProfileChange("industry", value)}
                  disabled={readOnly}
                  options={categories.map((cat) => ({
                    value: cat,
                    label: t(`directory.categories.${cat}`) || cat,
                  }))}
                >
                  <Select.Trigger className="w-full min-w-0">
                    <Select.Value
                      placeholder={t("register.placeholders.industry") || "選擇產業類別"}
                    />
                  </Select.Trigger>
                  <Select.Content>
                    {categories.map((cat) => (
                      <Select.Item key={cat} value={cat}>
                        {t(`directory.categories.${cat}`) || cat}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </FieldWithError>
            </div>

            <FieldWithError error={fieldErrors.website}>
              <div className="space-y-1">
                <Input
                  placeholder="Website"
                  value={profileData.website}
                  onChange={(e) => onProfileChange("website", e.target.value)}
                  disabled={readOnly}
                />
                <p className="text-muted-foreground text-xs">
                  {t("register.hints.websiteFormat") ||
                    "Example: https://your-company.com or your-company.com"}
                </p>
              </div>
            </FieldWithError>
            <FieldWithError error={fieldErrors.description}>
              <Textarea
                placeholder={t("register.placeholders.introduction") || "簡單介紹"}
                value={profileData.description}
                onChange={(e) => onProfileChange("description", e.target.value)}
                rows={3}
                disabled={readOnly}
              />
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
                onClick={onSave}
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
