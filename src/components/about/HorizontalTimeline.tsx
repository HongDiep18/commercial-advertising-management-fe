"use client"

import { useMemo } from "react"
import { useTranslation } from "react-i18next"

const timelineYears = ["2016", "2018", "2020", "2022", "2024"]

export default function HorizontalTimeline() {
  const { t } = useTranslation()

  const timelineEvents = useMemo(() => {
    return timelineYears.map((year) => ({
      year,
      title: t(`about.body.timeline.${year}.title`),
      description: t(`about.body.timeline.${year}.description`),
    }))
  }, [t])
  return (
    <div className="relative">
      <div className="from-primary via-primary/50 to-primary/20 absolute top-4 right-0 left-0 h-0.5 bg-gradient-to-r" />

      <div className="grid grid-cols-5 gap-2">
        {timelineEvents.map((event) => (
          <div key={event.year} className="relative pt-8">
            <div className="border-background bg-primary absolute top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full border-4 shadow-sm" />

            <div className="px-1 text-center">
              <span className="bg-primary/10 text-primary mb-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold">
                {event.year}
              </span>
              <h3 className="text-foreground mb-1 text-sm font-bold">{event.title}</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
