export type RegisterMembershipTier = "none" | "bronze" | "silver" | "gold" | "diamond"

export interface RegisterFormData {
  companyNameVi: string
  companyNameCn: string
  phone: string
  taxId: string
  contactPerson: string
  contactPhone: string
  companyAddress: string
  email: string
  country: string
  region: string
  industry: string
  website: string
  introduction: string
  membershipTier: RegisterMembershipTier
}

export const INITIAL_REGISTER_FORM: RegisterFormData = {
  companyNameVi: "",
  companyNameCn: "",
  phone: "",
  taxId: "",
  contactPerson: "",
  contactPhone: "",
  companyAddress: "",
  email: "",
  country: "",
  region: "",
  industry: "",
  website: "",
  introduction: "",
  membershipTier: "none",
}
