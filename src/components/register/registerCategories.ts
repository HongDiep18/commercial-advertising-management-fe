export type RegisterCategory = {
  id: string
  code: string
  i18nKey: string
  fallback: string
}

export const REGISTER_CATEGORIES: RegisterCategory[] = [
  { id: "textile", code: "A", i18nKey: "register.industry.A", fallback: "Dệt may, phụ kiện" },
  {
    id: "shoes",
    code: "B",
    i18nKey: "register.industry.B",
    fallback: "Ngành giày, da, túi xách, vali",
  },
  {
    id: "vehicle",
    code: "C",
    i18nKey: "register.industry.C",
    fallback: "Ô tô xe máy, linh kiện",
  },
  {
    id: "furniture",
    code: "D",
    i18nKey: "register.industry.D",
    fallback: "Ngành gỗ, mây tre lá, nội thất",
  },
  {
    id: "construction",
    code: "E",
    i18nKey: "register.industry.E",
    fallback: "Kiến trúc, xây dựng",
  },
  {
    id: "electronics",
    code: "F",
    i18nKey: "register.industry.F",
    fallback: "Điện tử, điện gia dụng",
  },
  {
    id: "machinery",
    code: "G",
    i18nKey: "register.industry.G",
    fallback: "Cơ khí, điện công nghiệp",
  },
  {
    id: "plastic",
    code: "H",
    i18nKey: "register.industry.H",
    fallback: "Nhựa, cao su, hóa chất",
  },
  {
    id: "agriculture",
    code: "I",
    i18nKey: "register.industry.I",
    fallback: "Nông Lâm Ngư nghiệp, Chăn nuôi",
  },
  {
    id: "metal",
    code: "J",
    i18nKey: "register.industry.J",
    fallback: "Kim loại ngũ kim",
  },
  {
    id: "paper",
    code: "K",
    i18nKey: "register.industry.K",
    fallback: "Bao bì, in ấn",
  },
  {
    id: "logistics",
    code: "L",
    i18nKey: "register.industry.L",
    fallback: "Hàng hải, hàng không",
  },
  {
    id: "finance",
    code: "M",
    i18nKey: "register.industry.M",
    fallback: "Chứng khoán, tài chính, bảo hiểm",
  },
  {
    id: "gifts",
    code: "N",
    i18nKey: "register.industry.N",
    fallback: "Thủ công mỹ nghệ, quà tặng, trang sức, gia dụng",
  },
  {
    id: "tourism",
    code: "O",
    i18nKey: "register.industry.O",
    fallback: "Du lịch, nhà hàng, thể thao",
  },
  {
    id: "food",
    code: "P",
    i18nKey: "register.industry.P",
    fallback: "Thực phẩm, nước giải khát",
  },
  {
    id: "education",
    code: "Q",
    i18nKey: "register.industry.Q",
    fallback: "Giáo dục, Y tế & thiết bị y tế",
  },
  {
    id: "other",
    code: "S",
    i18nKey: "register.industry.S",
    fallback: "Các ngành phục vụ khác",
  },
]
