export function maskCompanyName(name: string): string {
  if (name.includes("責任有限公司")) {
    return "****責任有限公司"
  }
  if (name.length <= 4) return "****"
  return "****" + name.substring(name.length - 4)
}

export function maskAddress(address: string): string {
  const words = address.split(" ").slice(0, 3).join(" ")
  return words + " ***"
}

export function truncateIntroduction(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

export function maskIntroductionCompanyNames(text: string, companyName: string): string {
  let maskedText = text
  console.log("companyName", companyName)

  maskedText = maskedText.replace(
    /「[^」*]+(責任有限公司|股份有限公司|有限公司)」/g,
    "「****責任有限公司」"
  )

  maskedText = maskedText.replace(
    /(?<![*「])[一-龥]{2,}(責任有限公司|股份有限公司|有限公司)(?!」)/g,
    "****責任有限公司"
  )
  return maskedText
}

export const categoryNameToIdMap: Record<string, string> = {
  "紡織、成衣及配件": "textile",
  "鞋業、鞋材、皮革類、行李袋": "shoes",
  "汽、機、自行車及零配件": "vehicle",
  "木、竹、藤、家具及工具": "furniture",
  "建築工程及建材（含環保）": "construction",
  "電子、電器及通訊器材": "electronics",
  "機械、機電及工業用相關產品": "machinery",
  "塑膠、橡膠加工製品及化工業": "plastic",
  "農、林、漁、牧業": "agriculture",
  農林漁牧業: "agriculture",
  "金屬、五金製品、電鍍及模具": "metal",
  金屬製品: "metal",
  "紙器包裝、印刷及相關製品": "paper",
  "紙器包裝、印刷": "paper",
  "海、空、貨運運輸類及報關行": "logistics",
  航運及倉儲物流: "logistics",
  "金融、保險、證券業": "finance",
  金融及保險: "finance",
  "禮品、飾品、工藝品、日用品": "gifts",
  禮品及文具: "gifts",
  "旅遊、餐廳、娛樂、運動休閒及器材": "tourism",
  觀光旅遊及餐飲住宿: "tourism",
  "食品、飲料及加工產品": "food",
  食品加工: "food",
  "教育、醫療、顧問": "education",
  文教及醫療服務: "education",
  其他服務業: "other",
}
