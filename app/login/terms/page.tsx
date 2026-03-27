"use client"
import { useTranslation } from "react-i18next"

export default function TermsPage() {
  const { t } = useTranslation()
  const sections = ["acceptance", "use", "account", "prohibited", "termination"]

  return (
    <main className="container mx-auto max-w-3xl px-4 py-16 pt-24">
      <h1 className="text-primary mb-8 text-3xl font-bold">{t("terms.title")}</h1>
      <section className="space-y-6 text-sm leading-relaxed">
        {sections.map((key) => (
          <div key={key}>
            <h2 className="text-foreground mb-2 text-lg font-semibold">
              {t(`terms.sections.${key}.title`)}
            </h2>
            <p className="text-muted-foreground">{t(`terms.sections.${key}.content`)}</p>
          </div>
        ))}
      </section>
    </main>
  )
}