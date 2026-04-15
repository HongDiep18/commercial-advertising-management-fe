import { Field, FieldLabel } from "@/components/ui/field"
import { ReadOnlyFieldBox } from "@/components/ui/ReadOnlyFieldValue"
import { RequiredMark, stripTrailingAsterisk } from "@/components/ui/required-mark"
import Input from "@/components/ui/Input"
import { SearchableMultiSelect } from "@/components/ui/SearchableMultiSelect"
import { SearchableSelect } from "@/components/ui/SearchableSelect"
import Textarea from "@/components/ui/Textarea"
import type { TFunction } from "i18next"

type CountryOption = { value: string; label: string }
type RegionOption = { value: string; label: string }
type IndustryOption = { value: string; label: string }

type BasicFieldErrors = {
  companyNameVi?: string
  companyNameZh?: string
  taxId?: string
  country?: string
  region?: string
  industry?: string
  description?: string
}

type BasicInfoValue = {
  companyNameVi: string
  companyNameZh: string
  companyNameEn?: string
  taxId: string
  country: string
  region: string
  industry: string[]
  description: string
}

type Props = {
  value: BasicInfoValue
  errors?: BasicFieldErrors
  onChange: (field: keyof BasicInfoValue, value: string | string[]) => void
  countries: CountryOption[]
  allRegions: RegionOption[]
  industryOptions: IndustryOption[]
  disabled?: boolean
  readOnlyView?: boolean
  allowIndustryPreviewWhenDisabled?: boolean
  t: TFunction
  includeEnglishName?: boolean
}

function resolveSelectLabel(options: { value: string; label: string }[], raw: string): string {
  const v = raw.trim()
  if (!v) return ""
  return options.find((o) => o.value === v)?.label ?? raw
}

function formatIndustryRead(ids: string[], options: IndustryOption[]): string {
  return ids
    .map((id) => options.find((o) => o.value === id)?.label ?? id)
    .filter(Boolean)
    .join(", ")
}

function FieldWithError({ error, children }: { error?: string; children: React.ReactNode }) {
  return (
    <div data-profile-field-error={error ? true : undefined}>
      {children}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}

export function CompanyBasicInfoSection({
  value,
  errors = {},
  onChange,
  countries,
  allRegions,
  industryOptions,
  disabled = false,
  readOnlyView = false,
  allowIndustryPreviewWhenDisabled = false,
  t,
  includeEnglishName = false,
}: Props) {
  const industryLocked = disabled && !allowIndustryPreviewWhenDisabled
  const emptyLabel = t("common.emptyField", { defaultValue: "Not provided" })

  if (readOnlyView) {
    const countryText = resolveSelectLabel(countries, value.country)
    const regionText = resolveSelectLabel(allRegions, value.region)
    const industryText = formatIndustryRead(value.industry ?? [], industryOptions)

    return (
      <>
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
              <ReadOnlyFieldBox value={value.companyNameVi} emptyLabel={emptyLabel} />
            </Field>
          </FieldWithError>

          {includeEnglishName ? (
            <Field className="gap-1.5">
              <FieldLabel className="text-foreground text-sm font-medium">
                {t("admin.companies.companyNameEn", { defaultValue: "Company Name (English)" })}
              </FieldLabel>
              <ReadOnlyFieldBox value={value.companyNameEn ?? ""} emptyLabel={emptyLabel} />
            </Field>
          ) : (
            <FieldWithError error={errors.companyNameZh}>
              <Field className="gap-1.5">
                <FieldLabel className="text-foreground text-sm font-medium">
                  {stripTrailingAsterisk(
                    t("register.placeholders.companyNameZh", {
                      defaultValue: "Company Name (Chinese)",
                    })
                  )}
                  <RequiredMark />
                </FieldLabel>
                <ReadOnlyFieldBox value={value.companyNameZh} emptyLabel={emptyLabel} />
              </Field>
            </FieldWithError>
          )}

          {includeEnglishName && (
            <FieldWithError error={errors.companyNameZh}>
              <Field className="gap-1.5">
                <FieldLabel className="text-foreground text-sm font-medium">
                  {stripTrailingAsterisk(
                    t("register.placeholders.companyNameZh", {
                      defaultValue: "Company Name (Chinese)",
                    })
                  )}
                  <RequiredMark />
                </FieldLabel>
                <ReadOnlyFieldBox value={value.companyNameZh} emptyLabel={emptyLabel} />
              </Field>
            </FieldWithError>
          )}

          <FieldWithError error={errors.taxId}>
            <Field className="gap-1.5">
              <FieldLabel className="text-foreground text-sm font-medium">
                {stripTrailingAsterisk(
                  t("register.placeholders.taxId", { defaultValue: "Tax ID" })
                )}
                <RequiredMark />
              </FieldLabel>
              <ReadOnlyFieldBox value={value.taxId} emptyLabel={emptyLabel} />
            </Field>
          </FieldWithError>
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
              <ReadOnlyFieldBox value={countryText} emptyLabel={emptyLabel} />
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
              <ReadOnlyFieldBox value={regionText} emptyLabel={emptyLabel} />
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
            <ReadOnlyFieldBox value={industryText} emptyLabel={emptyLabel} />
          </Field>
        </FieldWithError>

        <FieldWithError error={errors.description}>
          <Field className="gap-1.5">
            <FieldLabel className="text-foreground text-sm font-medium">
              {stripTrailingAsterisk(
                t("register.placeholders.introduction", { defaultValue: "Description" })
              )}
              <RequiredMark />
            </FieldLabel>
            <ReadOnlyFieldBox value={value.description} emptyLabel={emptyLabel} multiline />
          </Field>
        </FieldWithError>
      </>
    )
  }

  return (
    <>
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
              value={value.companyNameVi}
              onChange={(e) => onChange("companyNameVi", e.target.value)}
              placeholder={t("admin.companies.fieldExamples.companyNameVi", {
                defaultValue: "Ex: Cong Ty TNHH ABC",
              })}
              disabled={disabled}
            />
          </Field>
        </FieldWithError>

        {includeEnglishName ? (
          <Field className="gap-1.5">
            <FieldLabel className="text-foreground text-sm font-medium">
              {t("admin.companies.companyNameEn", { defaultValue: "Company Name (English)" })}
            </FieldLabel>
            <Input
              value={value.companyNameEn ?? ""}
              onChange={(e) => onChange("companyNameEn", e.target.value)}
              placeholder={t("admin.companies.fieldExamples.companyNameEn", {
                defaultValue: "Ex: ABC Co., Ltd.",
              })}
              disabled={disabled}
            />
          </Field>
        ) : (
          <FieldWithError error={errors.companyNameZh}>
            <Field className="gap-1.5">
              <FieldLabel className="text-foreground text-sm font-medium">
                {stripTrailingAsterisk(
                  t("register.placeholders.companyNameZh", {
                    defaultValue: "Company Name (Chinese)",
                  })
                )}
                <RequiredMark />
              </FieldLabel>
              <Input
                value={value.companyNameZh}
                onChange={(e) => onChange("companyNameZh", e.target.value)}
                placeholder={t("admin.companies.fieldExamples.companyNameZh", {
                  defaultValue: "Ex: ABC有限公司",
                })}
                disabled={disabled}
              />
            </Field>
          </FieldWithError>
        )}

        {includeEnglishName && (
          <FieldWithError error={errors.companyNameZh}>
            <Field className="gap-1.5">
              <FieldLabel className="text-foreground text-sm font-medium">
                {stripTrailingAsterisk(
                  t("register.placeholders.companyNameZh", {
                    defaultValue: "Company Name (Chinese)",
                  })
                )}
                <RequiredMark />
              </FieldLabel>
              <Input
                value={value.companyNameZh}
                onChange={(e) => onChange("companyNameZh", e.target.value)}
                placeholder={t("admin.companies.fieldExamples.companyNameZh", {
                  defaultValue: "Ex: ABC有限公司",
                })}
                disabled={disabled}
              />
            </Field>
          </FieldWithError>
        )}

        <FieldWithError error={errors.taxId}>
          <Field className="gap-1.5">
            <FieldLabel className="text-foreground text-sm font-medium">
              {stripTrailingAsterisk(t("register.placeholders.taxId", { defaultValue: "Tax ID" }))}
              <RequiredMark />
            </FieldLabel>
            <Input
              value={value.taxId}
              onChange={(e) => onChange("taxId", e.target.value)}
              placeholder={t("admin.companies.fieldExamples.taxId", {
                defaultValue: "Ex: 0302776159",
              })}
              disabled={disabled}
            />
          </Field>
        </FieldWithError>
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
              value={value.country}
              onValueChange={(next) => onChange("country", next)}
              disabled={disabled}
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
              {stripTrailingAsterisk(t("register.placeholders.region", { defaultValue: "Region" }))}
              <RequiredMark />
            </FieldLabel>
            <SearchableSelect
              value={value.region}
              onValueChange={(next) => onChange("region", next)}
              disabled={disabled}
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
            value={value.industry}
            onValueChange={(next) => {
              if (disabled) return
              onChange("industry", next)
            }}
            disabled={industryLocked}
            options={industryOptions}
            placeholder={t("register.placeholders.industry", { defaultValue: "Industry" })}
            searchPlaceholder={t("common.search", { defaultValue: "Search" })}
            emptyText={t("common.noResults", { defaultValue: "No results." })}
          />
        </Field>
      </FieldWithError>

      <FieldWithError error={errors.description}>
        <Field className="gap-1.5">
          <FieldLabel className="text-foreground text-sm font-medium">
            {stripTrailingAsterisk(
              t("register.placeholders.introduction", { defaultValue: "Description" })
            )}
            <RequiredMark />
          </FieldLabel>
          <Textarea
            value={value.description}
            onChange={(e) => onChange("description", e.target.value)}
            placeholder={t("admin.companies.fieldExamples.description", {
              defaultValue: "Ex: Manufacturing industrial valves and fittings",
            })}
            rows={3}
            disabled={disabled}
          />
        </Field>
      </FieldWithError>
    </>
  )
}
