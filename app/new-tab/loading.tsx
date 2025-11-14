export default function Loading() {
  const skeletonCount = 4

  return (
    <div className="relative z-10 flex min-h-screen w-full flex-col items-center gap-8 p-4 sm:p-6">
      {/* Top-left: Weather/Stock Skeleton */}
      <div className="absolute left-4 right-4 top-4 flex flex-row flex-wrap gap-2 sm:left-6 sm:right-auto sm:top-6 sm:flex-nowrap">
        <div className="shimmer-bg h-16 w-60 rounded-full"></div>
        <div className="shimmer-bg h-16 w-24 rounded-full"></div>
      </div>

      {/* Main content */}
      <div className="flex w-full max-w-7xl flex-1 flex-col items-center gap-8 pt-48 sm:pt-32 xl:flex-row xl:items-start xl:justify-between">
        {/* Left slot placeholder */}
        <div className="hidden w-64 xl:block"></div>
        {/* Center: QuickLinks & Search */}
        <div className="flex w-full max-w-lg flex-col items-center gap-8">
          {/* QuickLinks */}
          <div className="flex max-w-lg flex-wrap items-start justify-center gap-x-4 gap-y-6">
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <div key={i} className="flex w-14 flex-col items-center gap-1.5">
                <div className="shimmer-bg h-14 w-14 rounded-2xl"></div>
                <div className="shimmer-bg h-2 w-14 rounded-md"></div>
              </div>
            ))}
          </div>
          {/* SearchBar Skeleton */}
          <div className="shimmer-bg hidden h-12 w-full max-w-lg rounded-full md:block"></div>
        </div>
        {/* Right: Tasks */}
        <div className="w-full max-w-lg xl:w-64">
          <div className="flex h-full w-full flex-col gap-2 rounded-lg bg-secondary/50 p-4 backdrop-blur-sm">
            <div className="shimmer-bg h-6 w-32 rounded-md"></div>
            <div className="shimmer-bg h-8 w-full rounded-md"></div>
            <div className="shimmer-bg h-8 w-full rounded-md"></div>
            <div className="shimmer-bg h-8 w-full rounded-md"></div>
          </div>
        </div>
      </div>
      {/* Bottom-center: NewsWidget */}
      <div className="relative mx-auto mb-6 w-full max-w-md">
        <div className="shimmer-bg h-20 w-full rounded-lg"></div>
      </div>
    </div>
  )
}
