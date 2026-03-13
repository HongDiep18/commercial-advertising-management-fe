export function NewsPageSkeleton() {
  return (
    <>
      {/* Banner skeleton */}
      <div className="bg-muted h-[280px] animate-pulse md:h-[320px]" />

      {/* Filter bar skeleton */}
      <div className="border-border border-b">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-muted h-8 w-20 animate-pulse rounded-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Cards skeleton */}
      <section className="bg-body-bg-dark">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card border-border overflow-hidden rounded-lg border">
                <div className="bg-muted aspect-[16/9] animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="bg-muted h-3 w-1/3 animate-pulse rounded" />
                  <div className="bg-muted h-5 w-full animate-pulse rounded" />
                  <div className="bg-muted h-5 w-4/5 animate-pulse rounded" />
                  <div className="bg-muted h-4 w-full animate-pulse rounded" />
                  <div className="bg-muted h-4 w-2/3 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
