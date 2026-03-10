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
  industry: string
  website: string
  introduction: string
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
  industry: "",
  website: "",
  introduction: "",
}
