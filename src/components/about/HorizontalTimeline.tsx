'use client'

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
            {/* Horizontal line */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary/50 to-primary/20" />

            <div className="grid grid-cols-5 gap-2">
                {timelineEvents.map((event) => (
                    <div key={event.year} className="relative pt-8">
                        {/* Dot */}
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 h-4 w-4 rounded-full border-4 border-background bg-primary shadow-sm" />

                        {/* Content */}
                        <div className="px-1 text-center">
                            <span className="mb-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                                {event.year}
                            </span>
                            <h3 className="mb-1 text-sm font-bold text-foreground">{event.title}</h3>
                            <p className="text-xs leading-relaxed text-muted-foreground">{event.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
