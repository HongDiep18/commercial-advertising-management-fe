export interface RegisterFormData {
  companyNameVi: string
  companyNameCn: string
  phone: string
  taxId: string
  contactPerson: string
  contactPhone: string
  companyAddress: string
  email: string
  companyEmail: string
  country: string
  industry: string[]
  website: string
  introduction: string
  note: string
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
  companyEmail: "",
  country: "",
  industry: [],
  website: "",
  introduction: "",
  note: "",
}
