import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { useTranslation } from "react-i18next"
import Button from "../ui/Button"

export default function AboutHero() {
    const { t } = useTranslation()

    return (
        <section className="relative h-[500px] lg:h-[550px] w-full overflow-hidden">
            <div className="absolute inset-0">
                <img
                    src="/src/assets/images/hero-banner.png"
                    alt={t("about.hero.imageAlt")}
                    className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
            </div>
            <div className="relative h-full container mx-auto px-4 lg:px-8">
                <div className="flex h-full flex-col justify-center max-w-7xl mx-auto w-full">
                    <span className="inline-block w-fit mb-6 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white">
                        {t("about.hero.badge")}
                    </span>
                    <h1 className="mb-6 max-w-3xl text-balance text-4xl font-bold text-white md:text-5xl lg:text-6xl">
                        {t("about.hero.title")}
                    </h1>
                    <p className="mb-8 max-w-2xl leading-relaxed text-lg text-white/90 md:text-xl">
                        {t("about.hero.description")}
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Button asChild size="lg" variant="primary" className="font-semibold">
                            <Link to="/directory">
                                {t("about.hero.goToDirectory")}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="border-white/30 bg-transparent font-semibold text-white hover:bg-white/10"
                        >
                            <a href="#contact">{t("about.hero.contactUs")}</a>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}
