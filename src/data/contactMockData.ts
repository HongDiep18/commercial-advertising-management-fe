export const tabConfigBase = {
  platform: {
    title: '平台廣告刊登',
    description: '網站首頁彈窗、精選企業、企業名錄等高曝光廣告版位',
    contact: {
      company: 'CÔNG TY TNHH TM VÀ DV KIẾN HÀO VIỆT NAM',
      companyZh: '建豪（越南）責任有限公司',
      name: '阿草',
      phone: '0906660599',
      altPhone: '0909822101',
      hotline: '028-38 298 298 & 028-38 476 181',
      email: 'kienhaovn6688@gmail.com',
      line: '可使用 Line, 微信, Zalo',
    },
  },
  directory: {
    title: '越南華商採購名錄',
    description: '2025年紙本名錄廣告，涵蓋越南、新加坡、香港、中國及台灣華商',
    contact: {
      name: '阿草小姐 / 張益宏',
      phone: '+84-0906 66 05 99',
      altPhone: '+84-28-38 298 298',
      altPhone2: '+84-836884766',
      taiwanFax: '+886-2-25080919',
      email: 'vipbook1688@gmail.com',
      altEmail: 'kienhaovn6688@gmail.com',
      line: '通用 Line, 微信和 Zalo',
    },
  },
  product: {
    title: '商品銷售刊登',
    description: '在商品銷售專區刊登您的產品，拓展越南市場',
    contact: {
      company: 'CÔNG TY TNHH TM VÀ DV KIẾN HÀO VIỆT NAM',
      companyZh: '建豪（越南）責任有限公司',
      name: '阿草',
      phone: '0906660599',
      altPhone: '0909822101',
      hotline: '028-38 298 298 & 028-38 476 181',
      email: 'kienhaovn6688@gmail.com',
      line: '可使用 Line, 微信, Zalo',
    },
  },
} as const


export const platformPricing = {
  popup: {
    title: '首頁彈窗廣告',
    items: [
      { id: 'popup-priority-1m', name: '優先顯示（第1順位）', duration: '1個月', price: '2,500,000' },
      { id: 'popup-priority-3m', name: '優先顯示（第1順位）', duration: '3個月', price: '6,375,000', discount: '15%' },
      { id: 'popup-priority-6m', name: '優先顯示（第1順位）', duration: '6個月', price: '11,250,000', discount: '25%' },
      { id: 'popup-priority-1y', name: '優先顯示（第1順位）', duration: '1年', price: '19,500,000', discount: '35%' },
      { id: 'popup-normal-1m', name: '一般輪播（第2-5順位）', duration: '1個月', price: '1,800,000' },
      { id: 'popup-normal-3m', name: '一般輪播（第2-5順位）', duration: '3個月', price: '4,590,000', discount: '15%' },
      { id: 'popup-normal-6m', name: '一般輪播（第2-5順位）', duration: '6個月', price: '8,100,000', discount: '25%' },
      { id: 'popup-normal-1y', name: '一般輪播（第2-5順位）', duration: '1年', price: '14,040,000', discount: '35%' },
      { id: 'popup-link', name: '「查看詳情」連結設定', duration: '單次', price: '500,000' },
      { id: 'popup-sort', name: '排序調整（提升順位）', duration: '每次', price: '300,000' },
    ],
  },
  featured: {
    title: '精選企業曝光',
    items: [
      { id: 'featured-1m', name: '首頁精選企業展示', duration: '1個月', price: '3,000,000' },
      { id: 'featured-3m', name: '首頁精選企業展示', duration: '3個月', price: '7,650,000', discount: '15%' },
      { id: 'featured-6m', name: '首頁精選企業展示', duration: '6個月', price: '13,500,000', discount: '25%' },
      { id: 'featured-1y', name: '首頁精選企業展示', duration: '1年', price: '23,400,000', discount: '35%' },
      { id: 'featured-highlight', name: '精選企業加強標示', duration: '1個月', price: '800,000' },
    ],
  },
  listing: {
    title: '企業名錄廣告',
    items: [
      { id: 'listing-top-1m', name: '分類置頂顯示', duration: '1個月', price: '1,500,000' },
      { id: 'listing-top-3m', name: '分類置頂顯示', duration: '3個月', price: '3,825,000', discount: '15%' },
      { id: 'listing-top-6m', name: '分類置頂顯示', duration: '6個月', price: '6,750,000', discount: '25%' },
      { id: 'listing-top-1y', name: '分類置頂顯示', duration: '1年', price: '11,700,000', discount: '35%' },
      { id: 'listing-highlight', name: '企業資訊加強顯示', duration: '1個月', price: '1,000,000' },
    ],
  },
} as const


export const directoryPricing = [
  { id: 'dir-cover', position: '封面', price: '150,000,000' },
  { id: 'dir-back', position: '封底', price: '112,500,000' },
  { id: 'dir-inside-cover', position: '封面裏（左）/ 封面裏（右）', price: '70,000,000' },
  { id: 'dir-inside-back', position: '封底裏（左）/ 封底裏（右）', price: '55,000,000' },
  { id: 'dir-p2-p5', position: '封面裡 P2-P5', price: '45,000,000' },
  { id: 'dir-last5', position: '封底前五頁（不含封底左）', price: '30,000,000' },
  { id: 'dir-category', position: '分類夾頁廣告', price: '45,000,000' },
  { id: 'dir-toc-full', position: '目錄旁（全頁）', price: '45,000,000' },
  { id: 'dir-toc-half', position: '目錄旁（半頁）', price: '25,000,000' },
  { id: 'dir-inner-color', position: '內頁彩色', price: '20,000,000' },
  { id: 'dir-inner-mono', position: '內頁單色', price: '12,500,000' },
  { id: 'dir-half-color', position: '半頁彩色', price: '10,000,000' },
  { id: 'dir-quarter', position: '1/4 內頁單（13x9.5cm）', price: '5,000,000' },
] as const


export const productPricing = [
  { id: 'prod-basic-1m', item: '基本方案', description: '單一商品，含圖片3張', duration: '1個月', price: '800,000' },
  { id: 'prod-basic-3m', item: '基本方案', description: '單一商品，含圖片3張', duration: '3個月', price: '2,040,000', discount: '15%' },
  { id: 'prod-basic-6m', item: '基本方案', description: '單一商品，含圖片3張', duration: '6個月', price: '3,600,000', discount: '25%' },
  { id: 'prod-basic-1y', item: '基本方案', description: '單一商品，含圖片3張', duration: '1年', price: '6,240,000', discount: '35%' },
  { id: 'prod-adv-1m', item: '進階方案', description: '含圖片10張+影片', duration: '1個月', price: '1,500,000' },
  { id: 'prod-adv-3m', item: '進階方案', description: '含圖片10張+影片', duration: '3個月', price: '3,825,000', discount: '15%' },
  { id: 'prod-adv-6m', item: '進階方案', description: '含圖片10張+影片', duration: '6個月', price: '6,750,000', discount: '25%' },
  { id: 'prod-adv-1y', item: '進階方案', description: '含圖片10張+影片', duration: '1年', price: '11,700,000', discount: '35%' },
  { id: 'prod-featured', item: '首頁精選推薦', description: '商品顯示於首頁', duration: '1個月', price: '2,000,000' },
  { id: 'prod-top', item: '分類置頂', description: '分類頁面置頂', duration: '1個月', price: '1,200,000' },
] as const


export const bookedDates: Record<string, string[]> = {
  'popup-priority-1m': ['2025-02-01', '2025-03-01', '2025-04-01'],
  'popup-priority-3m': ['2025-02-01'],
  'popup-normal-1m': ['2025-02-15', '2025-03-15'],
  'featured-1m': ['2025-02-01', '2025-03-01'],
  'featured-3m': ['2025-05-01'],
  'listing-top-1m': ['2025-02-01'],
}


export const getDurationMonths = (duration: string): number => {
  if (duration.includes('1年')) return 12
  if (duration.includes('6個月')) return 6
  if (duration.includes('3個月')) return 3
  if (duration.includes('1個月')) return 1
  return 0
}


export const addMonths = (dateStr: string, months: number): string => {
  const date = new Date(dateStr)
  date.setMonth(date.getMonth() + months)
  return date.toISOString().split('T')[0]
}


export const isDateBooked = (itemId: string, dateStr: string): boolean => {
  const booked = bookedDates[itemId] || []
  return booked.includes(dateStr)
}


export const getDisabledDates = (itemId: string): Date[] => {
  const booked = bookedDates[itemId] || []
  return booked.map((dateStr) => new Date(dateStr))
}


export const isDateDisabled = (itemId: string, date: Date): boolean => {
  const dateStr = date.toISOString().split('T')[0]
  return isDateBooked(itemId, dateStr)
}

 
export const tabConfig = tabConfigBase
