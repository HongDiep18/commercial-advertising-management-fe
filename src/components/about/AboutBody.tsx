import { useEffect, useRef, useState } from "react"
import HorizontalTimeline from "./HorizontalTimeline"
import MagazineCarousel from "./MagazineCarousel"
import ContactSection from "./ContactSection"

export default function AboutBody() {
    const aboutRef = useRef<HTMLDivElement>(null)
    const historyRef = useRef<HTMLDivElement>(null)
    const directoryRef = useRef<HTMLDivElement>(null)
    const contactRef = useRef<HTMLDivElement>(null)

    const [aboutVisible, setAboutVisible] = useState(false)
    const [historyVisible, setHistoryVisible] = useState(false)
    const [directoryVisible, setDirectoryVisible] = useState(false)
    const [contactVisible, setContactVisible] = useState(false)

    useEffect(() => {
        const observers: IntersectionObserver[] = []

        const setupObserver = (ref: React.RefObject<HTMLDivElement | null>, setVisible: (value: boolean) => void) => {
            if (ref.current) {
                const observer = new IntersectionObserver(
                    ([entry]) => {
                        if (entry.isIntersecting) {
                            setVisible(true)
                        }
                    },
                    { threshold: 0.1 }
                )
                observer.observe(ref.current)
                observers.push(observer)
            }
        }

        setupObserver(aboutRef, setAboutVisible)
        setupObserver(historyRef, setHistoryVisible)
        setupObserver(directoryRef, setDirectoryVisible)
        setupObserver(contactRef, setContactVisible)

        return () => {
            observers.forEach(observer => observer.disconnect())
        }
    }, [])

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault()
        const element = document.querySelector(href)
        if (element) {
            const headerOffset = 96
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
            const offsetPosition = elementPosition - headerOffset

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth",
            })
        }
    }

    const navItems = [
        { href: "#about", label: "關於華商採購網" },
        { href: "#history", label: "發展歷程" },
        { href: "#directory", label: "探索採購名錄" },
        { href: "#contact", label: "聯絡我們" },
    ]

    return (
        <div className="w-full bg-body-bg-dark ">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ">
                <div className="flex gap-12 lg:gap-16">
                    {/* Sidebar Navigation - Left side */}
                    <aside className="hidden w-48 flex-shrink-0 lg:block">
                        <div className="sticky top-20 pt-12">
                            <nav className="space-y-1">
                                {navItems.map((item) => (
                                    <a
                                        key={item.href}
                                        href={item.href}
                                        onClick={(e) => handleNavClick(e, item.href)}
                                        className="block border-l-2 border-border py-2 pl-4 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                                    >
                                        {item.label}
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="min-w-0 flex-1 py-12 lg:py-16">
                        {/* About Section */}
                        <section id="about" className="mb-20 scroll-mt-24">
                            <div
                                ref={aboutRef}
                                className={`transition-all duration-700 ${aboutVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
                            >
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="h-8 w-1 rounded-full bg-primary" />
                                    <h2 className="text-2xl font-bold md:text-3xl">關於華商採購網</h2>
                                </div>
                                <div className="prose prose-lg max-w-none">
                                    <p className="mb-4 leading-relaxed text-muted-foreground">
                                        華商採購網是《越南華商採購名錄》的電子化延伸與升級，結合網際網路的便利與即時性，為全球華人企業提供全年無休的商務交流平台。不論您使用的是電腦、筆電、平板或智慧型手機，都能隨時登入平台，瀏覽最完整、最準確的產業資訊，掌握越南與東協地區最新的商機與市場動態。
                                    </p>
                                    <p className="mb-4 leading-relaxed text-muted-foreground">
                                        我們相信，資訊透明與聯繫緊密是華商成功的關鍵。透過華商採購網，企業不再受限於紙本名錄的更新周期，而能即時更新供應與需求、拓展人脈、深化合作，真正實現「隨時隨地、商機不斷」。
                                    </p>
                                    <p className="leading-relaxed text-muted-foreground">
                                        透過多年的努力，我們已經建立了涵蓋各行各業的完整企業資料庫，包括紡織、鞋類、車輛、家具、建材、電子、機械、塑膠、農業、金屬等多個產業領域。每年我們都會更新出版最新的採購名錄，確保資訊的時效性與準確性。
                                    </p>
                                </div>

                                {/* Image Gallery */}
                                <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                                    {[
                                        { src: "/src/assets/images/companies/modern-tech-office.png", alt: "製造工廠" },
                                        { src: "/src/assets/images/companies/modern-manufacturing-facility.png", alt: "現代辦公環境" },
                                        { src: "/src/assets/images/taiwanese-vietnamese-business-meeting.jpg", alt: "商業會議" },
                                    ].map((img, i) => (
                                        <div key={i} className="group relative aspect-[4/3] overflow-hidden rounded-xl">
                                            <img
                                                src={img.src || "/placeholder.svg"}
                                                alt={img.alt}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* History Section - Horizontal Timeline */}
                        <section id="history" className="mb-20 scroll-mt-24">
                            <div
                                ref={historyRef}
                                className={`transition-all duration-700 ${historyVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
                            >
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="h-8 w-1 rounded-full bg-primary" />
                                    <h2 className="text-2xl font-bold md:text-3xl">發展歷程</h2>
                                </div>
                                <p className="mb-8 text-muted-foreground">
                                    越南華商採購名錄自2016年創刊以來，持續深耕越南華商市場，逐步發展成為最具影響力的商業資訊平台。
                                </p>
                                <HorizontalTimeline />
                            </div>
                        </section>

                        {/* Magazine Directory Section */}
                        <section id="directory" className="mb-20 scroll-mt-24">
                            <div
                                ref={directoryRef}
                                className={`transition-all duration-700 ${directoryVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
                            >
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="h-8 w-1 rounded-full bg-primary" />
                                    <h2 className="text-2xl font-bold md:text-3xl">探索越南華商採購名錄</h2>
                                </div>
                                <p className="mb-8 text-muted-foreground">
                                    我們每年出版的越南華商採購名錄，收錄了數千家優質華商企業的詳細資訊。從2016年至今，我們已經出版了多個版本，每一版都經過嚴格的審核與更新。
                                </p>
                                <MagazineCarousel />
                            </div>
                        </section>

                        {/* Contact Section */}
                        <section id="contact" className="scroll-mt-24">
                            <div
                                ref={contactRef}
                                className={`transition-all duration-700 ${contactVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
                            >
                                <ContactSection />
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>

    )
}
