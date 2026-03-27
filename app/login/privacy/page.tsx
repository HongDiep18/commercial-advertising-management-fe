"use client"
import { useTranslation } from "react-i18next"

export default function PrivacyPage() {
  const { t } = useTranslation()
  const sections = ["collect", "use", "sharing", "security", "contact"]

  return (
    <main className="container mx-auto max-w-3xl px-4 py-16 pt-24">
      <h1 className="text-primary mb-8 text-3xl font-bold">{t("privacy.title")}</h1>
      <section className="space-y-6 text-sm leading-relaxed">
        {sections.map((key) => (
          <div key={key}>
            <h2 className="text-foreground mb-2 text-lg font-semibold">
              {t(`privacy.sections.${key}.title`)}
            </h2>
            <p className="text-muted-foreground">{t(`privacy.sections.${key}.content`)}</p>
          </div>
        ))}
      </section>
    </main>
  )
}