import { Link } from "react-router-dom"
import { Mail, ArrowRight } from "lucide-react"
import { useTranslation } from "react-i18next"
import Button from "../ui/Button"

export default function ContactSection() {
    const { t } = useTranslation()
    const email = "kienhaovn6688@gmail.com"

    return (
        <div className="rounded-2xl bg-primary/5 p-8 md:p-10">
            <div className="mb-4 flex items-center gap-3">
                <div className="h-8 w-1 rounded-full bg-primary" />
                <h2 className="text-2xl font-bold md:text-3xl">{t("contact.title")}</h2>
            </div>
            <p className="mb-6 max-w-2xl leading-relaxed text-muted-foreground">
                {t("contact.description")}
            </p>
            <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" variant="primary" className="font-semibold text-primary-foreground hover:bg-header-red-dark/90">
                    <a href={`mailto:${email}`}>
                        <Mail className="mr-2 h-4 w-4" />
                        {t("contact.sendEmail")}
                    </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="!border-primary/30 !bg-transparent font-semibold !text-header-red-dark hover:!text-white hover:!bg-primary/5">
                    <Link to="/contact">
                        {t("contact.adContact")}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </div>
    )
}
