"use client"

import { useMemo, useReducer, useRef } from "react"
import type { TFunction } from "i18next"
import { COUNTRY_NONE, REGION_KEYS_BY_COUNTRY } from "@/components/account"
import {
  adminCompanyResponseToProfileForm,
  companyDetailToProfileForm,
  EMPTY_PROFILE_FORM,
  pickLogoUrlFromApiResponse,
  profileFormDataToAdminCompanyPatchBody,
  rowToProfileForm,
} from "@/api/companies/adminCompany.mapper"
import {
  getCompanyDetail,
  patchAdminCompany,
  patchAdminCompanyWithLogo,
} from "@/api/companies/service"
import { useAddAdminCompanyContacts } from "@/api/companies/hooks"
import type { ProfileFormData } from "@/types/account"
import { PROFILE_ERROR_KEYS, validateProfileForm } from "@/components/register/registerValidation"
import {
  getRegisterCountryOptions,
  getRegionOptions,
  REGISTER_COUNTRY_OTHER_VALUE,
} from "@/components/register/registerOptions"
import type { ProfileRequestRow } from "@/types/admin"

type ToastVariant = "info" | "success" | "error"
type EditLogoState = { url: string | null; file: File | null; uploaded: boolean; changed: boolean }
type FieldErrors = Partial<Record<keyof ProfileFormData, string>>
type EditState = {
  editModalOpen: boolean
  editCompanyId: string | null
  editProfile: ProfileFormData
  editFieldErrors: FieldErrors
  editSaving: boolean
  editOpening: boolean
  editLogo: EditLogoState
}

type UseCompanyEditParams = {
  canEditCompanyProfile: boolean
  language: string
  t: TFunction
  onShowToast: (message: string, variant?: ToastVariant) => void
  onRefetchCompanyRequests?: (() => Promise<unknown>) | (() => void)
  onCompanyEmailResolved: (companyId: string, email: string | null) => void
}

const EMPTY_EDIT_LOGO: EditLogoState = {
  url: null,
  file: null,
  uploaded: false,
  changed: false,
}

const initialEditState: EditState = {
  editModalOpen: false,
  editCompanyId: null,
  editProfile: EMPTY_PROFILE_FORM,
  editFieldErrors: {},
  editSaving: false,
  editOpening: false,
  editLogo: EMPTY_EDIT_LOGO,
}

function editReducer(state: EditState, patch: Partial<EditState>): EditState {
  return { ...state, ...patch }
}

export function useCompanyEdit({
  canEditCompanyProfile,
  language,
  t,
  onShowToast,
  onRefetchCompanyRequests,
  onCompanyEmailResolved,
}: UseCompanyEditParams) {
  const [state, setState] = useReducer(editReducer, initialEditState)
  const editFileInputRef = useRef<HTMLInputElement>(null)
  const addContacts = useAddAdminCompanyContacts()
  const {
    editModalOpen,
    editCompanyId,
    editProfile,
    editFieldErrors,
    editSaving,
    editOpening,
    editLogo,
  } = state

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
      for (const r of list) {
        if (!byValue.has(r.value)) byValue.set(r.value, r)
      }
    }
    return Array.from(byValue.values())
  }, [regionsByCountry])

  const closeCompanyEdit = () => {
    if (editLogo.url?.startsWith("blob:")) URL.revokeObjectURL(editLogo.url)
    setState({
      editModalOpen: false,
      editCompanyId: null,
      editProfile: EMPTY_PROFILE_FORM,
      editFieldErrors: {},
      editLogo: EMPTY_EDIT_LOGO,
    })
  }

  const openCompanyEdit = async (row: ProfileRequestRow) => {
    setState({ editOpening: true })
    try {
      const companyId = row.companyId?.trim()
      if (!companyId) {
        onShowToast(
          t("admin.companies.companyIdRequired", "Company ID not available for this row."),
          "error"
        )
        return
      }

      let nextProfile = rowToProfileForm(row)
      let nextLogo: EditLogoState = { ...EMPTY_EDIT_LOGO }

      try {
        const detail = await getCompanyDetail(companyId)
        if (detail && typeof detail === "object") {
          const d = detail as Record<string, unknown>
          nextProfile = companyDetailToProfileForm(d, row)
          const logoUrl = pickLogoUrlFromApiResponse(detail)
          nextLogo = {
            ...EMPTY_EDIT_LOGO,
            url: logoUrl,
            uploaded: Boolean(logoUrl),
          }
        }
      } catch (err) {
        console.error("Error getting company detail", err)
      }

      setState({
        editCompanyId: companyId,
        editProfile: nextProfile,
        editFieldErrors: {},
        editLogo: nextLogo,
        editModalOpen: true,
      })
    } finally {
      setState({ editOpening: false })
    }
  }

  const handleEditProfileChange = (field: string, value: string | string[]) => {
    if (!canEditCompanyProfile) return
    const nextProfile = (() => {
      if (field === "country") {
        const nextCountry = typeof value === "string" && value === COUNTRY_NONE ? "" : value
        return {
          ...editProfile,
          country: typeof nextCountry === "string" ? nextCountry : editProfile.country,
        }
      }
      return { ...editProfile, [field]: value }
    })()
    setState({ editProfile: nextProfile })
    if (editFieldErrors[field as keyof ProfileFormData]) {
      setState({ editFieldErrors: { ...editFieldErrors, [field]: undefined } })
    }
  }

  const handleEditLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEditCompanyProfile) return
    const file = e.target.files?.[0]
    if (file) {
      if (editLogo.url?.startsWith("blob:")) URL.revokeObjectURL(editLogo.url)
      setState({
        editLogo: {
          ...editLogo,
          url: URL.createObjectURL(file),
          file,
          uploaded: true,
          changed: true,
        },
      })
    }
    e.target.value = ""
  }

  const handleSaveCompanyEdit = async (extras?: { emails: string[]; contactPhones: string[] }) => {
    if (!canEditCompanyProfile || !editCompanyId) {
      if (!editCompanyId) {
        onShowToast(
          t("admin.companies.companyIdRequired", "Company ID not available for this row."),
          "error"
        )
      }
      return
    }

    const companyId = editCompanyId
    const validation = validateProfileForm(editProfile)
    if (!validation.valid) {
      const next: Partial<Record<keyof ProfileFormData, string>> = {}
      validation.errors.forEach(({ field, kind }) => {
        next[field] = t(PROFILE_ERROR_KEYS[kind])
      })
      setState({ editFieldErrors: next })
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

    setState({ editFieldErrors: {}, editSaving: true })
    try {
      const res =
        editLogo.changed && editLogo.file
          ? await patchAdminCompanyWithLogo(editCompanyId, editProfile, editLogo.file)
          : await patchAdminCompany(
              editCompanyId,
              profileFormDataToAdminCompanyPatchBody(editProfile)
            )
      setState({ editProfile: adminCompanyResponseToProfileForm(res, editProfile.email) })

      const nextEmail = typeof res.email === "string" && res.email.trim() ? res.email.trim() : null
      onCompanyEmailResolved(companyId, nextEmail)

      const savedLogoUrl = pickLogoUrlFromApiResponse(res)
      if (savedLogoUrl) {
        if (editLogo.url?.startsWith("blob:")) URL.revokeObjectURL(editLogo.url)
        setState({
          editLogo: {
            ...editLogo,
            url: savedLogoUrl,
            file: null,
            uploaded: true,
            changed: false,
          },
        })
      } else {
        setState({ editLogo: { ...editLogo, changed: false } })
      }

      const emails = extras?.emails ?? []
      const contactPhones = extras?.contactPhones ?? []
      if (emails.length > 0 || contactPhones.length > 0) {
        try {
          const contactsRes = await addContacts.mutateAsync({
            companyId,
            payload: {
              emails: emails.length > 0 ? emails : undefined,
              contactPhones: contactPhones.length > 0 ? contactPhones : undefined,
              contactName: editProfile.contactName?.trim()
                ? editProfile.contactName.trim()
                : undefined,
            },
          })
          onShowToast(
            t("admin.companies.contactsProcessed", {
              defaultValue: "Contacts processed (added: {{added}}, skipped: {{skipped}})",
              added: contactsRes.added,
              skipped: contactsRes.skippedDuplicates,
            }),
            "success"
          )
        } catch (err) {
          const messageRaw = (err as { message?: string | string[] }).message
          const msgFromApi = Array.isArray(messageRaw)
            ? messageRaw.join(", ")
            : typeof messageRaw === "string"
              ? messageRaw
              : ""
          onShowToast(
            msgFromApi ||
              t("admin.companies.contactsAddError", {
                defaultValue: "Failed to add extra contacts.",
              }),
            "error"
          )
          return
        }
      }
      onShowToast(t("admin.companies.profileUpdatedSuccess", "Company profile updated"), "success")
      onRefetchCompanyRequests?.()
      closeCompanyEdit()
    } catch (err) {
      const status = (err as { status?: number }).status
      const msgFromApi = (err as { message?: string }).message
      if (status === 409) {
        onShowToast(t("admin.companies.emailConflict409", "This email is already in use."), "error")
      } else if (status === 404) {
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
    } finally {
      setState({ editSaving: false })
    }
  }

  return {
    state: {
      editModalOpen,
      editProfile,
      editFieldErrors,
      editSaving,
      editOpening,
      editLogo,
    },
    ui: {
      countries,
      allRegions,
      editFileInputRef,
    },
    actions: {
      closeCompanyEdit,
      openCompanyEdit,
      handleEditProfileChange,
      handleEditLogoUpload,
      handleSaveCompanyEdit,
    },
  }
}
