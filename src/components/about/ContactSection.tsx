import { Link } from "react-router-dom"
import { Mail, ArrowRight } from "lucide-react"
import Button from "../ui/Button"

export default function ContactSection() {
    const email = "kienhaovn6688@gmail.com"

    return (
        <div className="rounded-2xl bg-primary/5 p-8 md:p-10">
            <div className="mb-4 flex items-center gap-3">
                <div className="h-8 w-1 rounded-full bg-primary" />
                <h2 className="text-2xl font-bold md:text-3xl">聯絡我們</h2>
            </div>
            <p className="mb-6 max-w-2xl leading-relaxed text-muted-foreground">
                如果您對我們的服務有任何疑問，或希望將您的企業加入越南華商採購名錄，歡迎隨時與我們聯繫。更多聯絡資訊請參考頁尾。
            </p>
            <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" variant="primary" className="font-semibold text-primary-foreground hover:bg-header-red-dark/90">
                    <a href={`mailto:${email}`}>
                        <Mail className="mr-2 h-4 w-4" />
                        寄送郵件
                    </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="!border-primary/30 !bg-transparent font-semibold !text-header-red-dark hover:!text-white hover:!bg-primary/5">
                    <Link to="/contact">
                        廣告聯繫
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </div>
    )
}
