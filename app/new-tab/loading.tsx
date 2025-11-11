export default function Loading() {
  const skeletonCount = 5

  return (
    <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-start gap-12 p-6">
      {/* Top-left: Weather/Stock Skeleton */}
      <div className="absolute left-6 top-6 flex flex-row gap-2 text-white">
        <div className="shimmer-bg h-16 w-60 rounded-full"></div>
        <div className="shimmer-bg h-16 w-24 rounded-full"></div>
      </div>

      <div className="flex w-full max-w-7xl flex-1 items-start justify-center gap-8 pt-32 xl:justify-between">
        {/* Left slot placeholder */}
        <div className="hidden w-64 xl:block"></div>

        {/* Center: QuickLinks & SearchBar Skeleton */}
        <div className="flex w-full max-w-lg flex-col items-center gap-12">
          {/* QuickLinksSkeleton inline */}
          <div className="flex max-w-lg flex-wrap items-start justify-center gap-x-4 gap-y-6">
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <div key={i} className="flex w-20 flex-col items-center gap-1.5">
                <div className="shimmer-bg h-14 w-14 rounded-2xl"></div>
                <div className="shimmer-bg h-4 w-16 rounded-md"></div>
              </div>
            ))}
          </div>
          {/* SearchBar Skeleton */}
          <div className="shimmer-bg h-12 w-full max-w-lg rounded-full"></div>
        </div>

        {/* Right: TasksWidget Skeleton */}
        <div className="hidden w-64 xl:block">
          {/* TaskSkeleton inline */}
          <div className="flex h-full w-64 flex-col gap-2 rounded-lg bg-secondary/50 p-4 backdrop-blur-sm">
            <div className="shimmer-bg h-6 w-32 rounded-md"></div>
            <div className="shimmer-bg h-8 w-full rounded-md"></div>
            <div className="shimmer-bg h-8 w-full rounded-md"></div>
            <div className="shimmer-bg h-8 w-full rounded-md"></div>
          </div>
        </div>
      </div>

      {/* Bottom-center: NewsWidget Skeleton */}
      <div className="absolute bottom-6 left-1/2 w-full max-w-md -translate-x-1/2">
        <div className="shimmer-bg h-20 w-full rounded-lg"></div>
      </div>
    </div>
  )
}
