export interface Company {
  id: string
  nameCn: string
  nameEn: string
  nameVn?: string
  logo: string
  category: string
  categoryTags: string[]
  address: string
  phone: string
  email: string
  website: string
  contactPerson: string
  region: string
  origin?: string
  taxId?: string
  employeeCount?: string
  introduction: string
  services: string[]
  products: string[]
}

export const mockCompanies: Record<string, Company> = {
  "textile-1": {
    id: "textile-1",
    nameCn: "力鑫工業責任有限公司",
    nameEn: "CÔNG TY TNHH LI SHIN",
    nameVn: "CÔNG TY TNHH LI SHIN",
    logo: "/assets/images/companies/TNHH-LI-SHIN.png",
    category: "紡織、成衣及配件",
    categoryTags: ["紡織", "LATEX", "SPANDEX"],
    address:
      "Lô A-6-CN, Đường N7, khu công nghiệp Mỹ Phước, Phường Mỹ Phước, Thị xã Bến Cát, Tỉnh Bình Dương",
    phone: "0274-3553278 / 0274-3553282 / 0919-130299 (黃穎成) / 0919-152326 (郭均懷)",
    email: "lishin@ntptw.com.tw",
    website: "www.ntptw.com.tw",
    contactPerson: "黃穎成 / 郭均懷",
    region: "寶島台灣",
    taxId: "3700546833",
    employeeCount: "18497",
    introduction:
      "「冠荔實業股份有限公司」由「張新建」先生於1995年創辦成立，由5台包紗機LATEX包紗代工開始，歷經三十多年的努力，前進越南陸續增設力鑫、力隆及台灣三期廠房。\n\n力鑫工業責任有限公司成立於越南平陽省檳吉市美福工業區，是一家專業的包覆紗生產廠及紡織原料供應商。\n\n產品與服務\n▶ 天然 LATEX 圓型膠絲及橡膠絲包紗加工銷售。\n▶ 化學 SPANDEX 彈性絲及彈性絲包紗加工銷售。\n▶ 牛仔布專用的空氣包覆紗。\n▶ 撚紗加工銷售。\n\n適用產品\n織帶、鞋類、成衣、貼身用品、平織布、針織布、運動用品、醫療用品、家飾布、窗簾布及工業用紗... 等其他產品。",
    services: [],
    products: [],
  },
  "finance-1": {
    id: "finance-1",
    nameCn: "星展銀行（越南）有限公司",
    nameEn: "DBS Bank (Vietnam) Limited",
    nameVn: "Ngân hàng DBS (Việt Nam)",
    logo: "/assets/images/companies/DBS.jpg",
    category: "金融及保險",
    categoryTags: ["銀行", "金融", "貿易融資"],
    address: "11th Floor, Saigon Centre, 65 Le Loi Boulevard, Sai Gon Ward, Ho Chi Minh City",
    phone:
      "+84 (90) 8489826 (江炎燊 Eason) / +84 (90) 8310468 (任佩盈) / +84 (778) 869122 (韋瑞淵) / +84 0983 125 983 (李佩瑩)",
    email:
      "giangdiemtan@dbs.com / nhamdinhdinh@dbs.com / vythuyuyen@dbs.com / chungphoidieu@dbs.com",
    website: "www.dbs.com/vn",
    contactPerson:
      "江炎燊 Eason Giang Diem Tan / 任佩盈 Nham Dinh Dinh / 韋瑞淵 Vy Thuy Uyen / 李佩瑩 Chung Phoi Dieu",
    region: "新加坡",
    taxId: "0310011749",
    employeeCount: "1235",
    introduction:
      "星展銀行總部設於新加坡，在越南設有分行。\n\n主要服務：存放款及外匯業務，現金管理業務，信用狀及貿易融資業務及數位轉型業務",
    services: ["存放款及外匯業務", "現金管理業務", "信用狀及貿易融資業務", "數位轉型業務"],
    products: [],
  },
  "machinery-1": {
    id: "machinery-1",
    nameCn: "蔡雄商業有限公司",
    nameEn: "CÔNG TY TNHH XÂY DỰNG VÀ THƯƠNG MẠI THÁI HÙNG",
    nameVn: "CÔNG TY TNHH XÂY DỰNG VÀ THƯƠNG MẠI THÁI HÙNG",
    logo: "/assets/images/companies/tsaihsiung-construction.jpg",
    category: "機械、機電及工業用相關產品",
    categoryTags: ["機械", "製鞋設備", "工業設備"],
    address: "47D, Quốc Lộ 1A, Khu Phố 1, Phường Tân Thới Hiệp, Quận 12, TP HCM",
    phone: "028-37153233 / 0902557899 (MR.KHANH)",
    email: "khanh198002@gmail.com",
    website: "",
    contactPerson: "MR.KHANH",
    region: "越南",
    taxId: "0304585576",
    employeeCount: "398",
    introduction: "蔡雄商業有限公司是一家專門提供製鞋機械設備的公司。",
    services: ["製鞋機械設備銷售", "設備維修服務"],
    products: ["製鞋機械設備"],
  },
}

const categoryMap: Record<string, { cn: string; en: string; category: string }> = {
  textile: { cn: "紡織", en: "Textile", category: "紡織、成衣及配件" },
  shoes: { cn: "鞋業", en: "Footwear", category: "鞋業、鞋材、皮革類、行李袋" },
  vehicle: { cn: "汽車零件", en: "Auto Parts", category: "汽、機、自行車及零配件" },
  furniture: { cn: "家具", en: "Furniture", category: "木、竹、藤、家具及工具" },
  construction: { cn: "建材", en: "Construction", category: "建築工程及建材（含環保）" },
  electronics: { cn: "電子", en: "Electronics", category: "電子、電器及通訊器材" },
  machinery: { cn: "機械", en: "Machinery", category: "機械、機電及工業用相關產品" },
  plastic: { cn: "塑膠", en: "Plastic", category: "塑膠、橡膠加工製品及化工業" },
  agriculture: { cn: "農業", en: "Agriculture", category: "農林漁牧業" },
  metal: { cn: "金屬", en: "Metal", category: "金屬製品" },
  paper: { cn: "紙器包裝", en: "Paper & Packaging", category: "紙器包裝、印刷" },
  logistics: { cn: "物流", en: "Logistics", category: "航運及倉儲物流" },
  finance: { cn: "金融", en: "Finance", category: "金融及保險" },
  gifts: { cn: "禮品", en: "Gifts", category: "禮品及文具" },
  tourism: { cn: "旅遊", en: "Tourism", category: "觀光旅遊及餐飲住宿" },
  food: { cn: "食品", en: "Food", category: "食品加工" },
  education: { cn: "教育", en: "Education", category: "文教及醫療服務" },
  other: { cn: "服務", en: "Service", category: "其他服務業" },
}

export function getCompanyData(id: string): Company {
  if (mockCompanies[id]) {
    return mockCompanies[id]
  }

  const [categoryPrefix, number] = id.split("-")
  const categoryInfo = categoryMap[categoryPrefix] || {
    cn: "企業",
    en: "Company",
    category: "其他服務業",
  }

  return {
    id,
    nameCn: `${categoryInfo.cn}公司 ${number || "1"}`,
    nameEn: `${categoryInfo.en} Company ${number || "1"} Co., Ltd.`,
    nameVn: `Công ty ${categoryInfo.en} ${number || "1"}`,
    logo: "/assets/images/companies/TNHH-LI-SHIN.png",
    category: categoryInfo.category,
    categoryTags: [categoryInfo.cn, "製造", "出口"],
    address: "越南胡志明市第七郡阮文靈大道123號",
    phone: "+84 28 1234 5678",
    email: `contact@${categoryPrefix}${number || "1"}.com.vn`,
    website: `www.${categoryPrefix}${number || "1"}.com.vn`,
    contactPerson: "陳經理",
    region: "胡志明市",
    introduction: `${categoryInfo.cn}公司 ${number || "1"} 是越南知名的${categoryInfo.cn}產品製造商，專注於高品質產品的研發與生產。公司成立多年以來，始終秉持品質至上的經營理念，為客戶提供優質的產品和服務。我們擁有先進的生產設備和專業的技術團隊，能夠滿足客戶的各種需求。`,
    services: ["OEM代工", "ODM設計", "產品開發", "品質檢測", "物流配送"],
    products: ["標準產品", "定制產品", "高端系列", "經濟系列", "環保系列"],
  }
}
