import { NewsSkeleton } from "@/components/features/new-tab/news/news-skeleton"
import { QuickLinksSkeleton } from "@/components/features/new-tab/quick-links/quick-links-skeleton"
import { StockSkeleton } from "@/components/features/new-tab/stock/stock-skeleton"
import { TaskSkeleton } from "@/components/features/new-tab/todos/task-skeleton"
import { WeatherSkeleton } from "@/components/features/new-tab/weather/weather-skeleton"

export default function Loading() {
  return (
    <div className="relative z-10 flex min-h-screen w-full flex-col items-center gap-8 p-4 sm:p-6">
      {/* Top-left */}
      <div className="absolute left-4 right-4 top-4 flex flex-row flex-wrap gap-2 sm:left-6 sm:right-auto sm:top-6 sm:flex-nowrap">
        <WeatherSkeleton />
        <StockSkeleton count={1} />
      </div>

      {/* Main content */}
      <div className="flex w-full max-w-7xl flex-1 flex-col items-center gap-8 pt-48 sm:pt-32 xl:flex-row xl:items-start xl:justify-between">
        {/* Left slot placeholder */}
        <div className="hidden w-64 xl:block"></div>
        {/* Center */}
        <div className="flex w-full max-w-lg flex-col items-center gap-8">
          <QuickLinksSkeleton count={4} />
          <div className="shimmer-bg hidden h-12 w-full max-w-lg rounded-full md:block"></div>
        </div>
        {/* Right */}
        <div className="w-full max-w-lg xl:w-64">
          <TaskSkeleton />
        </div>
      </div>

      {/* Bottom-center: NewsWidget */}
      <NewsSkeleton />
    </div>
  )
}
