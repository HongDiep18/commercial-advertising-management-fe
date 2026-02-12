'use client'

import { useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

const statsConfig = [
  {
    value: 3980,
    suffix: "+",
    labelKey: "companies",
    descriptionKey: "companiesDesc",
  },
  {
    value: 13937000,
    suffix: "+",
    labelKey: "views",
    descriptionKey: "viewsDesc",
  },
  {
    value: 9000,
    suffix: "+",
    labelKey: "products",
    descriptionKey: "productsDesc",
  },
  {
    value: 20,
    suffixKey: "years",
    labelKey: "experience",
    descriptionKey: "experienceDesc",
  },
]

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(0) + "M"
  }
  if (num >= 1000) {
    return num.toLocaleString()
  }
  return num.toString()
}

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const duration = 2000
    const steps = 60
    const increment = value / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [isVisible, value])

  return (
    <div ref={ref} className="text-4xl font-bold tracking-tight text-primary md:text-5xl lg:text-6xl">
      {formatNumber(count)}
      <span className="text-primary/70">{suffix}</span>
    </div>
  )
}

export default function StatsSection() {
  const { t } = useTranslation()

  const stats = useMemo(() => {
    return statsConfig.map((stat) => ({
      value: stat.value,
      suffix: (stat.suffixKey ? (t(`stats.${stat.suffixKey}`) || stat.suffix) : stat.suffix) as string,
      label: (t(`stats.${stat.labelKey}`) || "") as string,
      description: (t(`stats.${stat.descriptionKey}`) || "") as string,
    }))
  }, [t])

  return (
    <section className="relative bg-body-bg-dark-foreground py-20">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">
            {t("stats.title")}
          </h2>
          <p className="text-muted-foreground">{t("stats.subtitle")}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-8 md:gap-12 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              <div className="mt-3 text-base font-semibold text-foreground md:text-lg">
                {stat.label}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
