// News categories
export const newsCategories = [
  { id: 'all', name: '全部' },
  { id: 'life', name: '生活' },
  { id: 'travel', name: '旅遊' },
  { id: 'regulation', name: '資訊法規' },
] as const

// Industry categories (from directory) - IDs match directory categories
export const industryCategories = [
  { id: "textile", name: "紡織成衣" },
  { id: "shoes", name: "鞋業皮革" },
  { id: "vehicle", name: "汽機車零配件" },
  { id: "furniture", name: "木竹藤家具" },
  { id: "construction", name: "建築工程" },
  { id: "electronics", name: "電子電器" },
  { id: "machinery", name: "機械設備" },
  { id: "plastic", name: "塑膠橡膠" },
  { id: "agriculture", name: "農林漁牧" },
  { id: "metal", name: "金屬五金" },
  { id: "paper", name: "包裝印刷" },
  { id: "logistics", name: "海空貨運" },
  { id: "finance", name: "金融保險" },
  { id: "gifts", name: "禮品工藝" },
  { id: "tourism", name: "旅遊餐飲" },
  { id: "food", name: "食品飲料" },
  { id: "education", name: "教育醫療" },
  { id: "other", name: "其他服務" },
] as const

// Mock news data
export const mockNews = [
  // 生活類 - 2篇
  {
    id: 'news-1',
    title: '2025年越南生活成本報告：台商家庭月支出分析與節省策略',
    excerpt: '根據最新調查，越南主要城市的生活成本在過去一年上漲約8%。本報告詳細分析胡志明市、河內及平陽省等台商聚集區的住房、交通、餐飲等各項支出，並提供實用的節省建議。',
    category: 'life',
    date: '2025-01-20',
    image: '/assets/images/news/news-life-1.jpg',
    industries: ['construction', 'food', 'other'],
    author: '越南華商編輯部',
  },
  {
    id: 'news-2',
    title: '越南醫療保險新制上路：外籍人士投保指南與注意事項',
    excerpt: '越南社會保險局公布2025年外籍人士醫療保險新規定，包含投保資格、給付範圍及申請流程等重大變更。本文整理台商及其眷屬必知的投保須知，協助您做好健康保障規劃。',
    category: 'life',
    date: '2025-01-15',
    image: '/assets/images/news/news-life-2.jpg',
    industries: ['education', 'finance', 'other'],
    author: '越南華商編輯部',
  },
  // 旅遊類 - 2篇
  {
    id: 'news-3',
    title: '2025農曆新年越南旅遊攻略：台商返台與在地過節全指南',
    excerpt: '農曆新年將至，無論您計劃返台與家人團聚，或選擇在越南體驗當地年節氣氛，本篇提供最新機票預訂資訊、越南春節習俗介紹，以及胡志明市、河內等地的年節活動推薦。',
    category: 'travel',
    date: '2025-01-18',
    image: '/assets/images/news/news-travel-1.jpg',
    industries: ['tourism', 'logistics', 'food'],
    author: '越南華商編輯部',
  },
  {
    id: 'news-4',
    title: '越南中部峴港、會安商務考察兼休閒旅遊推薦路線',
    excerpt: '越南中部近年成為新興投資熱點，峴港高科技園區及會安手工藝產業吸引眾多台商關注。本文規劃3天2夜商務考察行程，結合世界遺產景點與在地美食，讓出差也能兼顧休閒。',
    category: 'travel',
    date: '2025-01-12',
    image: '/assets/images/news/news-travel-2.jpg',
    industries: ['tourism', 'electronics', 'gifts', 'textile'],
    author: '越南華商編輯部',
  },
  // 資訊法規類 - 2篇
  {
    id: 'news-5',
    title: '越南2025年最低工資調整：各區域新標準與企業因應策略',
    excerpt: '越南政府宣布自2025年7月1日起調整最低工資，四個區域平均漲幅達6%。本文詳列各區域新工資標準、對製造業成本影響分析，以及企業可採取的人力資源調整策略。',
    category: 'regulation',
    date: '2025-01-22',
    image: '/assets/images/news/news-regulation-1.jpg',
    industries: ['textile', 'shoes', 'electronics', 'machinery', 'plastic'],
    author: '越南華商法規研究室',
  },
  {
    id: 'news-6',
    title: '越南進出口新規：2025年海關申報系統升級與通關流程變更',
    excerpt: '越南海關總署推出新一代電子申報系統，自2025年3月起全面實施。新系統整合原產地證明、商品檢驗等功能，本文說明系統操作變更重點及企業提前準備事項。',
    category: 'regulation',
    date: '2025-01-10',
    image: '/assets/images/news/news-regulation-2.jpg',
    industries: ['logistics', 'textile', 'shoes', 'electronics', 'food', 'metal'],
    author: '越南華商法規研究室',
  },
] as const
