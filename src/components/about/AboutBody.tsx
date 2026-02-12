'use client'

import { useEffect, useRef, useState, useMemo } from "react"
import { useTranslation } from "react-i18next"
import HorizontalTimeline from "./HorizontalTimeline"
import MagazineCarousel from "./MagazineCarousel"
import ContactSection from "./ContactSection"

export default function AboutBody() {
    const { t } = useTranslation()
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

    const navItems = useMemo(() => [
        { href: "#about", label: t("about.body.nav.about") },
        { href: "#history", label: t("about.body.nav.history") },
        { href: "#directory", label: t("about.body.nav.directory") },
        { href: "#contact", label: t("about.body.nav.contact") },
    ], [t])

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
                                    <h2 className="text-2xl font-bold md:text-3xl">{t("about.body.sections.about.title")}</h2>
                                </div>
                                <div className="prose prose-lg max-w-none">
                                    <p className="mb-4 leading-relaxed text-muted-foreground">
                                        {t("about.body.sections.about.paragraph1")}
                                    </p>
                                    <p className="mb-4 leading-relaxed text-muted-foreground">
                                        {t("about.body.sections.about.paragraph2")}
                                    </p>
                                    <p className="leading-relaxed text-muted-foreground">
                                        {t("about.body.sections.about.paragraph3")}
                                    </p>
                                </div>

                                {/* Image Gallery */}
                                <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                                    {[
                                        { src: "/assets/images/companies/modern-tech-office.png", altKey: "manufacturing" },
                                        { src: "/assets/images/companies/modern-manufacturing-facility.png", altKey: "office" },
                                        { src: "/assets/images/taiwanese-vietnamese-business-meeting.jpg", altKey: "meeting" },
                                    ].map((img, i) => (
                                        <div key={i} className="group relative aspect-[4/3] overflow-hidden rounded-xl">
                                            <img
                                                src={img.src || "/placeholder.svg"}
                                                alt={t(`about.body.images.${img.altKey}`)}
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
                                    <h2 className="text-2xl font-bold md:text-3xl">{t("about.body.sections.history.title")}</h2>
                                </div>
                                <p className="mb-8 text-muted-foreground">
                                    {t("about.body.sections.history.description")}
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
                                    <h2 className="text-2xl font-bold md:text-3xl">{t("about.body.sections.directory.title")}</h2>
                                </div>
                                <p className="mb-8 text-muted-foreground">
                                    {t("about.body.sections.directory.description")}
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
