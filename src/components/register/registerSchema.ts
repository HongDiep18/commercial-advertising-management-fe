import {
  REGISTER_ERROR_KEYS,
  type RegisterErrorKind,
} from "@/components/register/registerValidation"
import { normalizeWebsiteHttpScheme } from "@/types/auth"
import { isValidPhone } from "@/utils/validation/phone"
import type { TFunction } from "i18next"
import { z } from "zod"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function err(t: TFunction, kind: RegisterErrorKind): string {
  return t(REGISTER_ERROR_KEYS[kind])
}

export function createRegisterFormSchema(t: TFunction) {
  return z
    .object({
      companyNameVi: z.string(),
      companyNameCn: z.string(),
      phone: z.string(),
      taxId: z.string(),
      contactPerson: z.string(),
      contactPhone: z.string(),
      companyAddress: z.string(),
      email: z.string(),
      companyEmail: z.string(),
      country: z.string(),
      industry: z.array(z.string()),
      website: z.string(),
      introduction: z.string(),
      note: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      const req = (
        field:
          | "companyNameVi"
          | "companyNameCn"
          | "phone"
          | "taxId"
          | "contactPerson"
          | "contactPhone"
          | "companyAddress"
          | "email"
          | "companyEmail"
          | "country"
          | "website"
          | "introduction"
      ) => {
        if (typeof data[field] !== "string" || data[field].trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field],
            message: err(t, "required"),
          })
        }
      }

      ;(
        [
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
          "website",
          "introduction",
        ] as const
      ).forEach(req)

      if (!Array.isArray(data.industry) || data.industry.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["industry"],
          message: err(t, "required"),
        })
      }

      const emailVal = data.email?.trim() ?? ""
      if (emailVal && !EMAIL_REGEX.test(emailVal)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["email"],
          message: err(t, "invalidEmail"),
        })
      }
      const companyEmailVal = data.companyEmail?.trim() ?? ""
      if (companyEmailVal && !EMAIL_REGEX.test(companyEmailVal)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["companyEmail"],
          message: err(t, "invalidEmail"),
        })
      }

      for (const key of ["phone", "contactPhone"] as const) {
        const val = data[key]?.trim() ?? ""
        if (val && !isValidPhone(val)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [key],
            message: err(t, "invalidPhone"),
          })
        }
      }

      const rawWeb = data.website?.trim() ?? ""
      if (rawWeb) {
        let valid = false
        try {
          if (!/^https?:\/\//i.test(rawWeb)) throw new Error("missing_protocol")
          const normalized = normalizeWebsiteHttpScheme(rawWeb)
          const url = new URL(normalized)
          valid = url.protocol === "http:" || url.protocol === "https:"
          if (valid) {
            const host = url.hostname.trim()
            valid =
              host.length > 0 &&
              !host.startsWith(".") &&
              !host.endsWith(".") &&
              /[a-z0-9]/i.test(host)
          }
        } catch {
          valid = false
        }
        if (!valid) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["website"],
            message: err(t, "invalidWebsite"),
          })
        }
      }

      const tax = data.taxId?.trim() ?? ""
      if (tax && !/^\d+$/.test(tax)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["taxId"],
          message: err(t, "invalidTaxId"),
        })
      }

      const p = data.phone?.trim() ?? ""
      const cp = data.contactPhone?.trim() ?? ""
      if (p && cp && p === cp) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["contactPhone"],
          message: err(t, "duplicatePhone"),
        })
      }
    })
}

export type RegisterFormSchema = ReturnType<typeof createRegisterFormSchema>
