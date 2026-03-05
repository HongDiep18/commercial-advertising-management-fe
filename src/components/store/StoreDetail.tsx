"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslation } from "react-i18next"
import Link from "next/link"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Button from "@/components/ui/Button"
import { ArrowLeft, Minus, Plus, Check } from "lucide-react"

interface StoreDetailProps {
  productId: string
}

const products = {
  "vietnam-guide-2025": {
    id: "vietnam-guide-2025",
    name: "2025越南華商採購名錄",
    nameEn: "2025 VIETNAM BUYER'S GUIDE",
    category: "越南華商採購名錄",
    price: 550000,
    originalPrice: undefined,
    image: "/assets/images/magazines/2025.png",
    images: [
      "/assets/images/magazines/2025.png",
      "/assets/images/magazines/2025.png",
      "/assets/images/magazines/2025.png",
      "/assets/images/magazines/2025.png",
      "/assets/images/magazines/2025.png",
    ],
    code: "SA25",
    publisher: "NXB HONG DUC",
    author: "阮氏青草 著",
    pages: 672,
    year: 2025,
    description:
      "伴隨著社會的發展，每年都會建立起各經濟部門的許多企業。為了在尋找客戶的過程中為企業提供支持和創造有利條件，KIEN HAO CO.,LTD 作為連接平台每年出版《華商採購名錄》，越中雙語的具有多維查找系統、科學結構。《華商採購名錄》允許用戶快速以及輕鬆地查找在全越南有運營的數千家企業的必要信息。",
    features: ["出版社：NXB HONG DUC", "作者：阮氏青草 著", "頁數：672", "出版年：2025"],
    details: [
      "涵蓋18大產業分類，從紡織成衣、鞋業皮革到電子機械等",
      "收錄企業詳細聯絡資訊，包括地址、電話、Email、網站",
      "中越雙語對照，方便查找使用",
      "系統化分類，科學結構，快速查找",
    ],
    sizes: [],
    stock: "有庫存",
  },
  "vietnam-guide-2024": {
    id: "vietnam-guide-2024",
    name: "2024越南華商採購名錄",
    nameEn: "2024 VIETNAM BUYER'S GUIDE",
    category: "越南華商採購名錄",
    price: 300000,
    originalPrice: undefined,
    image: "/assets/images/magazines/2024.png",
    images: ["/assets/images/magazines/2024.png"],
    code: "SA24",
    publisher: "NXB HONG DUC",
    author: "阮氏青草 著",
    pages: 656,
    year: 2024,
    description:
      "《2024越南華商採購名錄》是建豪公司連續出版的第九版華商採購名錄，延續多年來為在越華商企業提供便捷查找平台的使命。本版名錄收錄全越南超過2800家華商企業的完整資訊，涵蓋各主要經濟部門，是連接供需雙方、促進商業合作的重要橋樑。",
    features: ["出版社：NXB HONG DUC", "作者：阮氏青草 著", "頁數：656", "出版年：2024"],
    details: [
      "收錄2800+越南華商企業完整資訊",
      "18大產業分類系統化整理",
      "中越雙語索引便於查找",
      "企業聯絡方式詳盡準確",
    ],
    sizes: [],
    stock: "有庫存",
  },
  "taiwan-tea-1": {
    id: "taiwan-tea-1",
    name: "台灣情 阿里山烏龍茶（環保盒裝）",
    nameEn: "ALISHAN OOLONG TEA",
    category: "台灣茶葉",
    price: 1805,
    originalPrice: 1900,
    image: "/assets/images/companies/modern-tech-office.png",
    images: ["/assets/images/companies/modern-tech-office.png"],
    code: "TD18-30087",
    brand: "台灣情",
    origin: "台灣阿里山",
    weight: "300G",
    description:
      "台灣情阿里山烏龍茶，產自海拔1200-1400公尺的阿里山高山茶區。得天獨厚的高山雲霧環境，孕育出茶葉獨特的清香與甘甜。每片茶葉都經過嚴格篩選，採用一心二葉採摘標準，確保茶葉品質。茶湯色澤金黃明亮，香氣清雅持久，滋味醇厚回甘，是品茗與送禮的上乘之選。",
    features: ["產地：台灣阿里山茶區", "海拔：1200-1400公尺", "重量：300G", "包裝：環保盒裝"],
    details: [
      "採用一心二葉採摘標準，確保茶葉品質",
      "高山雲霧環境孕育，茶香清雅持久",
      "茶湯金黃明亮，滋味醇厚回甘",
      "環保包裝設計，兼顧品質與環保",
    ],
    sizes: ["300G"],
    stock: "有庫存",
  },
  "taiwan-tea-2": {
    id: "taiwan-tea-2",
    name: "台灣情 嚴選高山烏龍茶（環保盒裝）",
    nameEn: "PREMIUM HIGH MOUNTAIN OOLONG TEA",
    category: "台灣茶葉",
    price: 900,
    originalPrice: 1000,
    image: "/assets/images/companies/modern-tech-office.png",
    images: ["/assets/images/companies/modern-tech-office.png"],
    code: "TD18-30088",
    brand: "台灣情",
    origin: "台灣高山茶區",
    weight: "150G",
    description:
      "台灣情嚴選高山烏龍茶，精選台灣中部高海拔茶區優質茶葉。高山茶園終年雲霧繚繞，日照充足但不強烈，晝夜溫差大，使茶葉生長緩慢，積累豐富的內含物質。茶葉嫩綠飽滿，香氣濃郁，口感清爽甘醇，韻味悠長，是日常品飲與待客的理想選擇。",
    features: ["產地：台灣高山茶區", "重量：150G", "包裝：環保盒裝", "等級：嚴選茶品"],
    details: [
      "精選高海拔茶區優質茶葉",
      "雲霧繚繞環境，茶葉內含物質豐富",
      "香氣濃郁，口感清爽甘醇",
      "小包裝設計，適合個人品飲",
    ],
    sizes: ["150G"],
    stock: "有庫存",
  },
  "tea-gift-1": {
    id: "tea-gift-1",
    name: "台灣情 高山烏龍茶（環保盒裝）",
    nameEn: "HIGH MOUNTAIN OOLONG TEA GIFT",
    category: "茶葉禮品",
    price: 665,
    originalPrice: 700,
    image: "/assets/images/companies/modern-tech-office.png",
    images: ["/assets/images/companies/modern-tech-office.png"],
    code: "TG18-30089",
    brand: "台灣情",
    origin: "台灣高山茶區",
    weight: "200G",
    description:
      "台灣情高山烏龍茶禮盒，精選台灣中部高海拔茶區的優質烏龍茶，以精美環保禮盒包裝。茶葉在高山雲霧環境中生長，吸收天地精華，茶香清雅，滋味甘醇。禮盒設計典雅大方，既展現台灣茶文化底蘊，又符合現代環保理念，是商務往來、節慶送禮的最佳選擇。",
    features: ["產地：台灣高山茶區", "重量：200G", "包裝：精美環保禮盒", "等級：精選茶品"],
    details: [
      "精選高山烏龍茶，品質上乘",
      "精美環保禮盒包裝，典雅大方",
      "適合商務送禮、節慶饋贈",
      "茶香清雅持久，滋味甘醇回甘",
    ],
    sizes: ["200G"],
    stock: "有庫存",
  },
  "tea-gift-2": {
    id: "tea-gift-2",
    name: "台灣情 精選茶葉禮盒",
    nameEn: "PREMIUM TEA GIFT SET",
    category: "茶葉禮品",
    price: 1200,
    originalPrice: 1500,
    image: "/assets/images/companies/modern-tech-office.png",
    images: ["/assets/images/companies/modern-tech-office.png"],
    code: "TG18-30090",
    brand: "台灣情",
    origin: "台灣各大茶區",
    weight: "組合裝",
    description:
      "台灣情精選茶葉禮盒，嚴選台灣各大知名茶區的優質茶葉，包含阿里山烏龍茶、凍頂烏龍茶、高山金萱茶等多款經典茶品。每款茶葉都經過專業茶師精心挑選，獨立小包裝保鮮，搭配豪華禮盒，展現台灣茶葉的多元風味。無論是自品或送禮，都能讓收禮者感受到台灣茶文化的精髓與誠意。",
    features: [
      "產地：台灣各大知名茶區",
      "內容：多款台灣經典茶品",
      "包裝：豪華禮盒裝",
      "規格：組合裝",
    ],
    details: [
      "嚴選阿里山、凍頂等名茶區茶葉",
      "包含烏龍茶、金萱茶等多種茶品",
      "獨立小包裝，保持茶葉新鮮度",
      "豪華禮盒包裝，適合高端商務送禮",
    ],
    sizes: ["組合裝"],
    stock: "有庫存",
  },
}

const getProductById = (id: string) => {
  return products[id as keyof typeof products] || products["vietnam-guide-2025"]
}

export function StoreDetail({ productId }: StoreDetailProps) {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const fromCategory = searchParams.get("fromCategory")
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedImage, setSelectedImage] = useState(0)

  const product = getProductById(productId)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [productId])

  useEffect(() => {
    if (product.sizes.length > 0) {
      setSelectedSize(product.sizes[0])
    }
  }, [product.sizes])

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta))
  }

  return (
    <div className="bg-body-bg-dark min-h-screen">
      <Header />

      <div className="pt-14">
        {/* Breadcrumb */}
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href={fromCategory ? `/store?category=${encodeURIComponent(fromCategory)}` : "/store"}
            className="text-muted-foreground hover:text-primary inline-flex items-center text-sm transition-colors"
            onClick={() => window.scrollTo(0, 0)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("store.detail.backToList")}
          </Link>
        </div>

        {/* Product Detail */}
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Left - Images */}
            <div>
              {/* Main Image */}
              <div className="bg-card border-border relative mb-4 aspect-square overflow-hidden rounded-lg border">
                <img
                  src={product.images[selectedImage] || "/placeholder.svg"}
                  alt={product.name}
                  className="h-full w-full object-contain"
                />
              </div>

              {/* Thumbnail Images */}
              {product.images.length > 1 && (
                <div className="flex gap-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative h-20 w-20 overflow-hidden rounded-md border-2 transition-colors ${
                        selectedImage === idx ? "border-primary" : "border-border"
                      }`}
                    >
                      <img
                        src={img || "/placeholder.svg"}
                        alt={`${product.name} ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right - Product Info */}
            <div>
              {/* Product Name */}
              <h1 className="text-foreground mb-2 text-2xl font-bold lg:text-3xl">
                {product.name}
              </h1>
              <p className="text-muted-foreground mb-6 text-sm">{product.nameEn}</p>

              {/* Description */}
              <div className="mb-6">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div className="mb-6">
                  <div className="space-y-2">
                    {product.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-foreground text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Details */}
              {product.details && product.details.length > 0 && (
                <div className="mb-6 rounded-lg bg-[#ECE9E1] p-4">
                  <div className="space-y-2">
                    {product.details.map((detail, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                        <span className="text-foreground text-sm">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-primary text-3xl font-bold">
                    {product.category === "越南華商採購名錄"
                      ? `${product.price.toLocaleString()} VNĐ`
                      : `NT$${product.price.toLocaleString()}`}
                  </span>
                  {product.originalPrice && (
                    <span className="text-muted-foreground text-lg line-through">
                      NT${product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Product Code */}
              <div className="mb-4">
                <p className="text-muted-foreground text-sm">
                  {t("store.detail.productCode")}:{" "}
                  <span className="text-foreground">{product.code}</span>
                </p>
                <p className="text-muted-foreground text-sm">
                  {t("store.detail.supplyStatus")}:{" "}
                  <span className="text-primary font-medium">{product.stock}</span>
                </p>
              </div>

              {/* Size Selector - Only for Vietnam Guide */}
              {product.category === "越南華商採購名錄" &&
                product.sizes &&
                product.sizes.length > 0 && (
                  <div className="mb-6">
                    <label className="mb-2 block text-sm font-medium">容量</label>
                    <div className="flex gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`rounded-md border px-6 py-2 text-sm font-medium transition-colors ${
                            selectedSize === size
                              ? "bg-foreground text-background border-foreground"
                              : "bg-background text-foreground border-border hover:border-foreground"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium">
                  {t("store.detail.quantity")}
                </label>
                <div className="flex w-fit items-center rounded-md border border-gray-300">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="hover:bg-muted px-4 py-2 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 border-x border-gray-300 bg-transparent py-2 text-center focus:outline-none"
                  />
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="hover:bg-muted px-4 py-2 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="flex-1 border border-black bg-transparent !text-black hover:bg-white"
                >
                  {t("store.detail.addToCart")}
                </Button>
                <Button
                  size="lg"
                  className="!bg-header-red-dark hover:bg-header-red-dark/90 flex-1 text-white"
                >
                  {t("store.detail.buyNow")}
                </Button>
              </div>
            </div>
          </div>

          {/* Product Introduction */}
          <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="bg-body-bg-light border-border rounded-lg border p-8">
              <h2 className="text-foreground mb-6 text-2xl font-bold">
                {t("store.detail.productIntroduction")}
              </h2>
              <div className="prose max-w-none">
                <p className="text-foreground mb-4 leading-relaxed">
                  《2025越南華商採購名錄》是專為在越南經商的華商企業量身打造的商業指南工具書。本名錄涵蓋越南各地區超過3000家華商企業的詳細資訊，是您拓展越南市場、尋找合作夥伴的最佳參考資料。
                </p>

                {/* Product Images Grid */}
                <div className="my-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="border-border overflow-hidden rounded-lg border">
                    <img
                      src="/assets/images/companies/modern-tech-office.png"
                      alt="越南華商採購名錄與廣告頁"
                      className="h-auto w-full object-contain"
                    />
                  </div>
                  <div className="border-border overflow-hidden rounded-lg border">
                    <img
                      src="/assets/images/companies/modern-tech-office.png"
                      alt="越南華商採購名錄堆疊展示"
                      className="h-auto w-full object-contain"
                    />
                  </div>
                  <div className="border-border overflow-hidden rounded-lg border">
                    <img
                      src="/assets/images/companies/modern-tech-office.png"
                      alt="越南華商採購名錄封面特寫"
                      className="h-auto w-full object-contain"
                    />
                  </div>
                  <div className="border-border overflow-hidden rounded-lg border">
                    <img
                      src="/assets/images/companies/modern-tech-office.png"
                      alt="越南華商採購名錄目錄頁"
                      className="h-auto w-full object-contain"
                    />
                  </div>
                  <div className="border-border col-span-1 overflow-hidden rounded-lg border md:col-span-2">
                    <img
                      src="/assets/images/companies/modern-tech-office.png"
                      alt="越南華商採購名錄內頁展示"
                      className="h-auto w-full object-contain"
                    />
                  </div>
                </div>

                <p className="text-foreground mb-4 leading-relaxed">
                  名錄內容包含18大產業分類，從紡織成衣、鞋業皮革、汽機車零配件、木竹藤製品、建築工程、電子電器，到機械設備、塑膠橡膠、農林漁牧業、金屬製品、包裝印刷、海空貨運物流、金融保險證券、禮品工藝品、旅遊餐廳娛樂、食品飲料、教育醫療顧問，以及其他服務業等，全方位覆蓋越南華商經濟活動。
                </p>
                <p className="text-foreground mb-4 leading-relaxed">
                  每家企業資料均包含公司名稱（中越雙語）、負責人、地址、電話、傳真、手機、電子郵件、網站等完整聯絡資訊，方便您快速精準地找到所需的商業夥伴。本名錄採用科學化分類系統，配合中越雙語索引，讓您能夠輕鬆查找目標企業。
                </p>
                <p className="text-foreground leading-relaxed">
                  由建豪（越南）責任有限公司精心編輯出版，每年更新資料，確保資訊的即時性與準確性。672頁的豐富內容，是您開拓越南市場不可或缺的商業工具書。
                </p>
              </div>
            </div>
          </section>

          {/* Related Products */}
          <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-foreground text-2xl font-bold">
                {t("store.detail.relatedProducts")}
              </h2>
              <Link
                href={`/store?category=${encodeURIComponent(product.category)}`}
                className="text-primary text-sm hover:underline"
              >
                {t("store.detail.viewMore")}
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {/* Vietnam Buyer's Guide Related Products */}
              {product.id === "vietnam-guide-2025" && (
                <Link
                  href="/store/vietnam-guide-2024?fromCategory=越南華商採購名錄"
                  className="group"
                >
                  <div className="bg-card border-border relative mb-3 aspect-square overflow-hidden rounded-lg border">
                    <img
                      src="/assets/images/magazines/2024.png"
                      alt="2024 越南華商採購名錄"
                      className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="mb-1 line-clamp-2 text-sm font-medium group-hover:underline">
                    2024 越南華商採購名錄
                  </h3>
                  <p className="text-primary text-lg font-bold">300.000 vnđ</p>
                </Link>
              )}
              {product.id === "vietnam-guide-2024" && (
                <Link
                  href="/store/vietnam-guide-2025?fromCategory=越南華商採購名錄"
                  className="group"
                >
                  <div className="bg-card border-border relative mb-3 aspect-square overflow-hidden rounded-lg border">
                    <img
                      src="/assets/images/magazines/2025.png"
                      alt="2025 越南華商採購名錄"
                      className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="mb-1 line-clamp-2 text-sm font-medium group-hover:underline">
                    2025 越南華商採購名錄
                  </h3>
                  <p className="text-primary text-lg font-bold">550.000 vnđ</p>
                </Link>
              )}

              {/* Taiwan Tea Related Products */}
              {product.id === "taiwan-tea-1" && (
                <Link href="/store/taiwan-tea-2?fromCategory=台灣茶葉" className="group">
                  <div className="bg-card border-border relative mb-3 aspect-square overflow-hidden rounded-lg border">
                    <img
                      src="/assets/images/companies/modern-tech-office.png"
                      alt="台灣情 嚴選高山烏龍茶"
                      className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="mb-1 line-clamp-2 text-sm font-medium group-hover:underline">
                    台灣情 嚴選高山烏龍茶（環保盒裝）
                  </h3>
                  <p className="text-primary text-lg font-bold">NT$900</p>
                </Link>
              )}
              {product.id === "taiwan-tea-2" && (
                <Link href="/store/taiwan-tea-1?fromCategory=台灣茶葉" className="group">
                  <div className="bg-card border-border relative mb-3 aspect-square overflow-hidden rounded-lg border">
                    <img
                      src="/assets/images/companies/modern-tech-office.png"
                      alt="台灣情 阿里山烏龍茶"
                      className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="mb-1 line-clamp-2 text-sm font-medium group-hover:underline">
                    台灣情 阿里山烏龍茶（環保盒裝）
                  </h3>
                  <p className="text-primary text-lg font-bold">NT$1,805</p>
                </Link>
              )}

              {/* Tea Gift Related Products */}
              {product.id === "tea-gift-1" && (
                <Link href="/store/tea-gift-2?fromCategory=茶葉禮品" className="group">
                  <div className="bg-card border-border relative mb-3 aspect-square overflow-hidden rounded-lg border">
                    <img
                      src="/assets/images/companies/modern-tech-office.png"
                      alt="台灣情 精選茶葉禮盒"
                      className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="mb-1 line-clamp-2 text-sm font-medium group-hover:underline">
                    台灣情 精選茶葉禮盒
                  </h3>
                  <p className="text-primary text-lg font-bold">NT$1,200</p>
                </Link>
              )}
              {product.id === "tea-gift-2" && (
                <Link href="/store/tea-gift-1?fromCategory=茶葉禮品" className="group">
                  <div className="bg-card border-border relative mb-3 aspect-square overflow-hidden rounded-lg border">
                    <img
                      src="/assets/images/companies/modern-tech-office.png"
                      alt="台灣情 高山烏龍茶"
                      className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="mb-1 line-clamp-2 text-sm font-medium group-hover:underline">
                    台灣情 高山烏龍茶（環保盒裝）
                  </h3>
                  <p className="text-primary text-lg font-bold">NT$665</p>
                </Link>
              )}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  )
}
