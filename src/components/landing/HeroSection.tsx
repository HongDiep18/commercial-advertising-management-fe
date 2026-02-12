import type React from "react"
import { ArrowRight } from "lucide-react"
import Button from "../ui/Button"

export default function HeroSection() {
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    const element = document.getElementById(targetId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  return (
    <section className="relative h-[450px] overflow-hidden lg:h-[550px]">
      <div className="absolute inset-0">
        <img
          src="/src/assets/images/taiwanese-vietnamese-business-meeting.jpg"
          alt="Taiwanese and Vietnamese Business Meeting"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
      </div>

      <div className="relative h-full container mx-auto px-4 lg:px-8">
        <div className="flex h-full max-w-3xl flex-col justify-center">
          <h1 className="mb-6 text-balance text-4xl font-bold leading-tight text-white lg:text-5xl">
            華商採購網－連結優質商業夥伴
          </h1>

          <p className="mb-6 max-w-2xl text-pretty text-base leading-relaxed text-white lg:text-lg">
            匯集超過 3,980
            家在越南的優質台灣企業，提供最完整的產業分類與企業資料，協助您快速找到理想的合作夥伴，開創更多商業機會
          </p>

          <div className="flex flex-wrap gap-4">
            <Button
              size="lg"
              variant="outline"
              className="border-white bg-white/10 font-semibold text-white backdrop-blur-sm hover:bg-white/20"
              asChild
            >
              <a href="/register">加入我們</a>
            </Button>
            <Button size="lg" variant="primary" className="font-semibold" asChild>
              <a href="#directory" onClick={(e) => handleScroll(e, "directory")}>
                尋找商業夥伴
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-body-bg-dark via-body-bg-dark/95 to-transparent" />
    </section>
  )
}
