import { MapPin, Phone, Award } from "lucide-react"
import Card from "../ui/Card"
import Badge from "../ui/Badge"

const companies = [
  {
    id: "textile-1",
    name: "力鑫工業責任有限公司",
    industry: "紡織、成衣及配件",
    location: "寶島台灣",
    phone: "0274-3553278",
    verified: true,
    description: "專業的包覆紗生產廠及紡織原料供應商，提供天然LATEX及化學SPANDEX彈性絲包紗加工銷售。",
    image: "/src/assets/images/companies/TNHH-LI-SHIN.png",
  },
  {
    id: "finance-1",
    name: "星展銀行（越南）有限公司",
    industry: "金融及保險",
    location: "新加坡",
    phone: "+84 (90) 8489826",
    verified: true,
    description: "星展銀行總部設於新加坡，在越南設有分行，提供存放款及外匯業務、現金管理業務、信用狀及貿易融資業務。",
    image: "/src/assets/images/companies/DBS.jpg",
  },
  {
    id: "machinery-1",
    name: "蔡雄商業有限公司",
    industry: "機械、機電及工業用相關產品",
    location: "越南",
    phone: "028-37153233",
    verified: true,
    description: "蔡雄商業有限公司是一家專門提供製鞋機械設備的公司。",
    image: "/src/assets/images/companies/tsaihsiung-construction.jpg",
  },
]

export default function FeaturedCompanies() {
  const handleCompanyClick = (companyId: string) => {
    console.log("Navigate to:", `/directory/${companyId}`)
  }

  return (
    <section id="featured" className="bg-body-bg-light py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="mb-4 text-3xl font-bold">精選企業</h2>
            <p className="text-base text-muted-foreground">嚴選優質企業，值得信賴的合作夥伴</p>
          </div>
          <a
            href="/directory"
            className="hidden font-normal text-primary hover:underline md:block"
          >
            查看更多 →
          </a>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <Card
              key={company.id}
              className="group cursor-pointer overflow-hidden border-border pt-12 transition-all duration-300 hover:shadow-xl"
              onClick={() => handleCompanyClick(company.id)}
            >
              <div className="aspect-video overflow-hidden bg-muted">
                <img
                  src={company.image || "/placeholder.svg"}
                  alt={company.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-6 bg-body-bg-light">
                <div className="mb-3 flex items-start justify-between ">
                  <Badge variant="body-bg-light" className="text-xs ">
                    {company.industry}
                  </Badge>
                  {company.verified && (
                    <div className="flex items-center gap-1 text-primary ">
                      <Award className="h-4 w-4" />
                      <span className="text-xs font-normal ">已認證</span>
                    </div>
                  )}
                </div>

                <h3 className="mb-2 line-clamp-1 text-base font-semibold transition-colors group-hover:text-primary">
                  {company.name}
                </h3>

                <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{company.description}</p>

                <div className="flex flex-col gap-2 text-sm text-muted-foreground ">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{company.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{company.phone}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <a href="/directory" className="font-normal text-primary hover:underline">
            查看更多 →
          </a>
        </div>
      </div>
    </section>
  )
}
