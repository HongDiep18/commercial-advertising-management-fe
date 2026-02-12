import { useEffect, useRef, useState } from "react"

const stats = [
  {
    value: 3980,
    suffix: "+",
    label: "企業",
    description: "涵蓋各產業領域",
  },
  {
    value: 13937000,
    suffix: "+",
    label: "曝光數",
    description: "單年度瀏覽人次",
  },
  {
    value: 9000,
    suffix: "+",
    label: "商品",
    description: "多元品項",
  },
  {
    value: 20,
    suffix: "年",
    label: "服務經驗",
    description: "值得信賴的平台",
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
  return (
    <section className="relative bg-body-bg-dark-foreground py-20">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">平台實力</h2>
          <p className="text-muted-foreground">用數據見證我們的專業與用心</p>
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
