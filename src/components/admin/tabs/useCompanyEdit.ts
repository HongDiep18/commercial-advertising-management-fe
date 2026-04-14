"use client"

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react"
import type { TFunction } from "i18next"
import { useAdminCompanyDetail, useUpdateAdminCompanyMutation } from "@/api/admin-companies/hooks"
import {
  EMPTY_ADMIN_COMPANY_FORM,
  adminCompanyDetailToForm,
  adminCompanyFormToUpdatePayload,
  ensureAdminCompanyFormContacts,
  type AdminCompanyForm,
  pickAdminCompanyLogoUrl,
} from "@/api/admin-companies/mapper"
import type { AdminCompanyContact, AdminCompanyMember } from "@/api/admin-companies/types"
import { REGION_KEYS_BY_COUNTRY } from "@/components/account"
import {
  getRegisterCountryOptions,
  getRegionOptions,
  REGION_OPTIONS_BY_COUNTRY,
  REGISTER_COUNTRY_OTHER_VALUE,
} from "@/components/register/registerOptions"
import type { ProfileRequestRow } from "@/types/admin"
import { normalizeWebsiteHttpScheme } from "@/types/auth"
import { formatDate } from "@/utils/datetime"
import { isValidEmailFormat, translateInvalidEmailHint } from "@/utils/validation/emailFormatHint"
import { isValidPhone } from "@/utils/validation/phone"
import { translateSocialMessagingValueError } from "@/utils/validation/socialMessagingContact"

type ToastVariant = "info" | "success" | "error"

type ContactFieldErrors = {
  type?: string
  value?: string
}

type FormErrors = {
  companyNameVi?: string
  companyNameZh?: string
  taxId?: string
  country?: string
  region?: string
  industry?: string
  description?: string
  contacts: ContactFieldErrors[]
}

type EditLogoState = { url: string | null; file: File | null; uploaded: boolean; changed: boolean }
type EditAccountSummary = {
  userName: string
  registeredEmail: string
  memberSince: string
  memberRange: string
}

type EditState = {
  editModalOpen: boolean
  editCompanyId: string | null
  editForm: AdminCompanyForm
  editFieldErrors: FormErrors
  editLogo: EditLogoState
  editAccountSummary: EditAccountSummary
}

type UseCompanyEditParams = {
  canEditCompanyProfile: boolean
  language: string
  t: TFunction
  onShowToast: (message: string, variant?: ToastVariant) => void
  onRefetchCompanyRequests?: (() => Promise<unknown>) | (() => void)
  onCompanyDataChanged: (companyId: string) => void
}

const EMPTY_EDIT_LOGO: EditLogoState = {
  url: null,
  file: null,
  uploaded: false,
  changed: false,
}

const EMPTY_ERRORS: FormErrors = {
  contacts: [],
}

const EMPTY_ACCOUNT_SUMMARY: EditAccountSummary = {
  userName: "",
  registeredEmail: "",
  memberSince: "",
  memberRange: "",
}

const PROTECTED_LAST_CONTACT_TYPES = new Set<AdminCompanyContact["type"]>([
  "email",
  "contact_person",
  "website",
  "address",
])

const initialEditState: EditState = {
  editModalOpen: false,
  editCompanyId: null,
  editForm: EMPTY_ADMIN_COMPANY_FORM,
  editFieldErrors: EMPTY_ERRORS,
  editLogo: EMPTY_EDIT_LOGO,
  editAccountSummary: EMPTY_ACCOUNT_SUMMARY,
}

function editReducer(state: EditState, patch: Partial<EditState>): EditState {
  return { ...state, ...patch }
}

function normalizeErrorsLength(errors: FormErrors, contacts: AdminCompanyContact[]): FormErrors {
  const next = [...errors.contacts]
  while (next.length < contacts.length) next.push({})
  return { ...errors, contacts: next.slice(0, contacts.length) }
}

function hasAnyRowContent(contact: AdminCompanyContact): boolean {
  return Boolean(String(contact.value ?? "").trim() || String(contact.contactName ?? "").trim())
}

function isTaxIdDigitsOnly(value: string): boolean {
  return /^\d+$/.test(value.trim())
}

function isValidWebUrl(value: string): boolean {
  const raw = value.trim()
  if (!raw) return false
  try {
    const normalized = /^https?:\/\//i.test(raw)
      ? normalizeWebsiteHttpScheme(raw)
      : `https://${raw}`
    const url = new URL(normalized)
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      Boolean(url.hostname.trim()) &&
      /[a-z0-9]/i.test(url.hostname)
    )
  } catch {
    return false
  }
}

function validateForm(form: AdminCompanyForm, t: TFunction): FormErrors {
  const errors: FormErrors = {
    contacts: form.contacts.map(() => ({})),
  }

  if (!form.companyNameVi.trim()) {
    errors.companyNameVi = t("register.errors.requiredField", {
      defaultValue: "This field is required.",
    })
  }
  if (!form.companyNameZh.trim()) {
    errors.companyNameZh = t("register.errors.requiredField", {
      defaultValue: "This field is required.",
    })
  }
  const taxIdTrimmed = form.taxId.trim()
  if (!taxIdTrimmed) {
    errors.taxId = t("register.errors.requiredField", {
      defaultValue: "This field is required.",
    })
  } else if (!isTaxIdDigitsOnly(form.taxId)) {
    errors.taxId = t("register.errors.invalidTaxId", {
      defaultValue: "Tax ID must contain numbers only",
    })
  }
  if (!form.country.trim()) {
    errors.country = t("register.errors.requiredField", {
      defaultValue: "This field is required.",
    })
  }
  if (!form.region.trim()) {
    errors.region = t("register.errors.requiredField", {
      defaultValue: "This field is required.",
    })
  }
  if (form.industry.length === 0) {
    errors.industry = t("register.errors.requiredField", {
      defaultValue: "This field is required.",
    })
  }

  form.contacts.forEach((contact, index) => {
    const type = String(contact.type ?? "").trim()
    const typeKey = type.toLowerCase()
    const value = String(contact.value ?? "").trim()

    if (typeKey === "email") {
      if (!value) {
        errors.contacts[index].value = t("register.errors.requiredField", {
          defaultValue: "This field is required.",
        })
        return
      }
      if (!isValidEmailFormat(value)) {
        errors.contacts[index].value = translateInvalidEmailHint(t, value)
      }
      return
    }

    if (typeKey === "website") {
      if (!value) {
        errors.contacts[index].value = t("register.errors.requiredField", {
          defaultValue: "This field is required.",
        })
        return
      }
      if (!isValidWebUrl(value)) {
        errors.contacts[index].value = t("register.errors.invalidWebsite", {
          defaultValue: "Please enter a valid website URL.",
        })
      }
      return
    }

    if (!hasAnyRowContent(contact)) return

    if (!type) {
      errors.contacts[index].type = t("register.errors.requiredField", {
        defaultValue: "This field is required.",
      })
    }
    if (!value) {
      errors.contacts[index].value = t("register.errors.requiredField", {
        defaultValue: "This field is required.",
      })
      return
    }

    if (["tel", "contact_person", "fax", "hotline"].includes(typeKey) && !isValidPhone(value)) {
      errors.contacts[index].value = t("register.errors.invalidPhone", {
        defaultValue: "Please enter a valid phone number.",
      })
    } else if (["facebook", "zalo", "wechat", "line", "skype", "viber"].includes(typeKey)) {
      const socialErr = translateSocialMessagingValueError(t, typeKey, value)
      if (socialErr) {
        errors.contacts[index].value = socialErr
      }
    } else if (typeKey === "website" && !isValidWebUrl(value)) {
      errors.contacts[index].value = t("register.errors.invalidWebsite", {
        defaultValue: "Please enter a valid website URL.",
      })
    }
  })

  return errors
}

function formHasErrors(errors: FormErrors): boolean {
  return Boolean(
    errors.companyNameVi ||
    errors.companyNameZh ||
    errors.taxId ||
    errors.country ||
    errors.region ||
    errors.industry ||
    errors.description ||
    errors.contacts.some((contact) => contact.type || contact.value)
  )
}

function mapMemberToAccountSummary(
  member: AdminCompanyMember | null | undefined,
  language: string
): EditAccountSummary {
  if (!member) return EMPTY_ACCOUNT_SUMMARY

  return {
    userName: String(member.userName ?? "").trim(),
    registeredEmail: String(member.registeredEmail ?? "").trim(),
    memberSince: member.memberSince?.trim() ? formatDate(member.memberSince, language) : "",
    memberRange: String(member.membershipTier ?? "").trim(),
  }
}

export function useCompanyEdit({
  canEditCompanyProfile,
  language,
  t,
  onShowToast,
  onRefetchCompanyRequests,
  onCompanyDataChanged,
}: UseCompanyEditParams) {
  const [state, setState] = useReducer(editReducer, initialEditState)
  const editFileInputRef = useRef<HTMLInputElement>(null)
  const hydratedDetailDataUpdatedAtRef = useRef<number | null>(null)
  const { editModalOpen, editCompanyId, editForm, editFieldErrors, editLogo, editAccountSummary } =
    state

  const companyDetailQuery = useAdminCompanyDetail(
    editCompanyId,
    Boolean(editModalOpen && editCompanyId)
  )
  const updateCompanyMutation = useUpdateAdminCompanyMutation()

  const editOpening =
    Boolean(editModalOpen && editCompanyId) &&
    (companyDetailQuery.isPending || companyDetailQuery.isLoading) &&
    !companyDetailQuery.data

  const editSaving = updateCompanyMutation.isPending

  const countries = useMemo(
    () =>
      getRegisterCountryOptions(language, t("register.countries.other", { defaultValue: "Other" })),
    [language, t]
  )
  const regionsByCountry = useMemo(() => {
    const result: Record<string, { value: string; label: string }[]> = {}
    for (const [country, keys] of Object.entries(REGION_KEYS_BY_COUNTRY)) {
      result[country] = keys.map((key) => ({
        value: key,
        label: t(`register.regions.${key}`) || key,
      }))
    }
    result[REGISTER_COUNTRY_OTHER_VALUE] = getRegionOptions(REGISTER_COUNTRY_OTHER_VALUE, t)
    return result
  }, [t])

  const allRegions = useMemo(() => {
    const byValue = new Map<string, { value: string; label: string }>()

    for (const list of Object.values(regionsByCountry)) {
      for (const region of list) {
        if (!byValue.has(region.value)) byValue.set(region.value, region)
      }
    }

    for (const [groupKey, group] of Object.entries(REGION_OPTIONS_BY_COUNTRY)) {
      if (groupKey === REGISTER_COUNTRY_OTHER_VALUE) continue
      for (const option of group) {
        if (!byValue.has(option.value)) {
          byValue.set(option.value, {
            value: option.value,
            label: t(option.labelKey) || option.fallback,
          })
        }
      }
    }

    return Array.from(byValue.values())
  }, [regionsByCountry, t])

  const regionOptions = useMemo(() => {
    const raw = editForm.region.trim()
    if (!raw || allRegions.some((r) => r.value === raw)) return allRegions
    const label = t(`register.regions.${raw}`) || raw
    return [{ value: raw, label }, ...allRegions]
  }, [allRegions, editForm.region, t])

  const closeCompanyEdit = useCallback(() => {
    hydratedDetailDataUpdatedAtRef.current = null
    if (editLogo.url?.startsWith("blob:")) URL.revokeObjectURL(editLogo.url)
    setState(initialEditState)
  }, [editLogo.url])

  useEffect(() => {
    if (!editModalOpen || !editCompanyId) {
      hydratedDetailDataUpdatedAtRef.current = null
      return
    }
    const detail = companyDetailQuery.data
    if (!detail || detail.id !== editCompanyId) return
    const dataUpdatedAt = companyDetailQuery.dataUpdatedAt
    if (hydratedDetailDataUpdatedAtRef.current === dataUpdatedAt) return
    hydratedDetailDataUpdatedAtRef.current = dataUpdatedAt
    const nextForm = adminCompanyDetailToForm(detail)
    const nextLogoUrl = pickAdminCompanyLogoUrl(detail)
    setState({
      editForm: nextForm,
      editFieldErrors: normalizeErrorsLength(EMPTY_ERRORS, nextForm.contacts),
      editLogo: {
        ...EMPTY_EDIT_LOGO,
        url: nextLogoUrl,
        uploaded: Boolean(nextLogoUrl),
      },
      editAccountSummary: mapMemberToAccountSummary(detail.member, language),
    })
  }, [
    editModalOpen,
    editCompanyId,
    companyDetailQuery.data,
    companyDetailQuery.dataUpdatedAt,
    language,
  ])

  useEffect(() => {
    if (!editModalOpen || !editCompanyId || !companyDetailQuery.isError) return
    const err = companyDetailQuery.error as { status?: number; message?: string }
    const status = err?.status
    const msgFromApi = err?.message
    if (status === 404) {
      onShowToast(
        t("admin.companies.companyNotFound404", "Company or linked user was not found."),
        "error"
      )
    } else if (status === 403) {
      onShowToast(
        t("admin.companies.forbidden403", "You are not allowed to update this company."),
        "error"
      )
    } else {
      onShowToast(
        msgFromApi || t("admin.companies.loadCompanyDetailError", "Failed to load company detail."),
        "error"
      )
    }
    hydratedDetailDataUpdatedAtRef.current = null
    setState(initialEditState)
  }, [
    editModalOpen,
    editCompanyId,
    companyDetailQuery.isError,
    companyDetailQuery.error,
    onShowToast,
    t,
  ])

  const openCompanyEdit = (row: ProfileRequestRow) => {
    const companyId = row.companyId?.trim()
    if (!companyId) {
      onShowToast(
        t("admin.companies.companyIdRequired", "Company ID not available for this row."),
        "error"
      )
      return
    }
    hydratedDetailDataUpdatedAtRef.current = null
    setState({
      editCompanyId: companyId,
      editModalOpen: true,
      editForm: EMPTY_ADMIN_COMPANY_FORM,
      editFieldErrors: EMPTY_ERRORS,
      editLogo: EMPTY_EDIT_LOGO,
      editAccountSummary: EMPTY_ACCOUNT_SUMMARY,
    })
  }

  const handleEditFieldChange = (field: keyof AdminCompanyForm, value: string | string[]) => {
    if (!canEditCompanyProfile) return
    setState({
      editForm: { ...editForm, [field]: value },
    })

    if (field !== "contacts" && editFieldErrors[field as keyof Omit<FormErrors, "contacts">]) {
      setState({
        editFieldErrors: {
          ...editFieldErrors,
          [field]: undefined,
        },
      })
    }
  }

  const handleContactChange = (index: number, field: keyof AdminCompanyContact, value: string) => {
    if (!canEditCompanyProfile) return

    const nextContacts = ensureAdminCompanyFormContacts(
      editForm.contacts.map((contact, rowIndex) =>
        rowIndex === index ? { ...contact, [field]: value } : contact
      )
    )
    const nextErrors = normalizeErrorsLength(editFieldErrors, nextContacts)
    if (field === "type") nextErrors.contacts[index].type = undefined
    if (field === "value") nextErrors.contacts[index].value = undefined

    setState({
      editForm: {
        ...editForm,
        contacts: nextContacts,
      },
      editFieldErrors: nextErrors,
    })
  }

  const handleAddContact = (type: AdminCompanyContact["type"] = "email") => {
    if (!canEditCompanyProfile) return
    const nextContacts = ensureAdminCompanyFormContacts([
      ...editForm.contacts,
      { type, value: "", contactName: null },
    ])
    setState({
      editForm: {
        ...editForm,
        contacts: nextContacts,
      },
      editFieldErrors: normalizeErrorsLength(editFieldErrors, nextContacts),
    })
  }

  const handleRemoveContact = (index: number) => {
    if (!canEditCompanyProfile) return
    const target = editForm.contacts[index]
    const targetType = String(target?.type ?? "").trim() as AdminCompanyContact["type"]

    if (PROTECTED_LAST_CONTACT_TYPES.has(targetType)) {
      const sameTypeCount = editForm.contacts.filter(
        (contact) => String(contact.type ?? "").trim() === targetType
      ).length

      if (sameTypeCount <= 1) {
        onShowToast(
          t("admin.companies.contactDeleteRestricted", {
            defaultValue: "At least one {{contactType}} row must remain.",
            contactType: t(`admin.companies.contactTypes.${targetType}`, {
              defaultValue: targetType,
            }),
          }),
          "error"
        )
        return
      }
    }

    const safeContacts = ensureAdminCompanyFormContacts(
      editForm.contacts.filter((_, rowIndex) => rowIndex !== index)
    )
    setState({
      editForm: {
        ...editForm,
        contacts: safeContacts,
      },
      editFieldErrors: normalizeErrorsLength(EMPTY_ERRORS, safeContacts),
    })
  }

  const handleEditLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEditCompanyProfile) return
    const file = e.target.files?.[0]
    if (file) {
      const nextLogoUrl = URL.createObjectURL(file)
      if (editLogo.url?.startsWith("blob:")) URL.revokeObjectURL(editLogo.url)
      setState({
        editForm: {
          ...editForm,
          logoUrl: nextLogoUrl,
        },
        editLogo: {
          ...editLogo,
          url: nextLogoUrl,
          file,
          uploaded: true,
          changed: true,
        },
      })
    }
    e.target.value = ""
  }

  const handleSaveCompanyEdit = () => {
    if (!canEditCompanyProfile || !editCompanyId) {
      if (!editCompanyId) {
        onShowToast(
          t("admin.companies.companyIdRequired", "Company ID not available for this row."),
          "error"
        )
      }
      return
    }

    const validation = validateForm(editForm, t)
    if (formHasErrors(validation)) {
      setState({ editFieldErrors: validation })
      setTimeout(
        () =>
          document.querySelector("[data-profile-field-error]")?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          }),
        100
      )
      return
    }

    setState({
      editFieldErrors: normalizeErrorsLength(EMPTY_ERRORS, editForm.contacts),
    })

    const payload = adminCompanyFormToUpdatePayload(editForm, {
      registeredEmail: editAccountSummary.registeredEmail,
    })

    updateCompanyMutation.mutate(
      {
        companyId: editCompanyId,
        payload,
        logoChanged: editLogo.changed,
        logoFile: editLogo.file,
      },
      {
        onSuccess: () => {
          if (editLogo.url?.startsWith("blob:")) URL.revokeObjectURL(editLogo.url)
          onCompanyDataChanged(editCompanyId)
          onShowToast(
            t("admin.companies.profileUpdatedSuccess", "Company profile updated"),
            "success"
          )
          onRefetchCompanyRequests?.()
          closeCompanyEdit()
        },
        onError: (err) => {
          const status = err?.status
          const msgFromApi = err?.message
          if (status === 404) {
            onShowToast(
              t("admin.companies.companyNotFound404", "Company or linked user was not found."),
              "error"
            )
          } else if (status === 403) {
            onShowToast(
              t("admin.companies.forbidden403", "You are not allowed to update this company."),
              "error"
            )
          } else {
            onShowToast(
              msgFromApi ||
                t("admin.companies.profileUpdateError", "Failed to update company profile."),
              "error"
            )
          }
        },
      }
    )
  }

  return {
    state: {
      editModalOpen,
      editForm,
      editFieldErrors,
      editSaving,
      editOpening,
      editLogo,
      editAccountSummary,
    },
    ui: {
      countries,
      allRegions: regionOptions,
      editFileInputRef,
    },
    actions: {
      closeCompanyEdit,
      openCompanyEdit,
      handleEditFieldChange,
      handleContactChange,
      handleAddContact,
      handleRemoveContact,
      handleEditLogoUpload,
      handleSaveCompanyEdit,
    },
  }
}
