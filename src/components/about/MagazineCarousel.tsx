import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Button from "../ui/Button"

const magazines = [
  { id: 1, title: "越南華商採購名錄 2025", image: "/src/assets/images/magazines/2025.png", year: 2025 },
  { id: 2, title: "越南華商採購名錄 2024", image: "/src/assets/images/magazines/2024.png", year: 2024 },
  { id: 3, title: "越南華商採購名錄 2023", image: "/src/assets/images/magazines/2023.png", year: 2023 },
  { id: 4, title: "越南華商採購名錄 2022", image: "/src/assets/images/magazines/2022.png", year: 2022 },
  { id: 5, title: "越南華商採購名錄 2021", image: "/src/assets/images/magazines/2021.png", year: 2021 },
  { id: 6, title: "越南華商採購名錄 2020", image: "/src/assets/images/magazines/2020.png", year: 2020 },
  { id: 7, title: "越南華商採購名錄 2019", image: "/src/assets/images/magazines/2019.png", year: 2019 },
  { id: 8, title: "越南華商採購名錄 2018", image: "/src/assets/images/magazines/2018.png", year: 2018 },
  { id: 9, title: "越南華商採購名錄 2017", image: "/src/assets/images/magazines/2017.png", year: 2017 },
  { id: 10, title: "越南華商採購名錄 2016", image: "/src/assets/images/magazines/2016.png", year: 2016 },
]

export default function MagazineCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsPerView = 5
  const maxIndex = Math.max(0, magazines.length - itemsPerView)

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1))
  }

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-xl">
        <div
          className="flex gap-4 transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * (160 + 16)}px)` }}
        >
          {magazines.map((magazine) => (
            <div key={magazine.id} className="w-[160px] flex-shrink-0">
              <div className="group cursor-pointer">
                <div className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-muted shadow-md transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl">
                  <img
                    src={magazine.image || "/placeholder.svg"}
                    alt={magazine.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="absolute bottom-0 left-0 right-0 translate-y-full p-3 transition-transform duration-300 group-hover:translate-y-0">
                    <p className="text-sm font-medium text-white">{magazine.year}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex gap-1">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex ? "w-8 bg-primary" : "w-1.5 bg-border hover:bg-muted-foreground"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="h-10 w-10 rounded-full border-2 bg-transparent disabled:opacity-50"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={currentIndex === maxIndex}
            className="h-10 w-10 rounded-full border-2 bg-transparent disabled:opacity-50"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
