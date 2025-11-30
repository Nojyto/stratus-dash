import { CalendarLoader } from "@/components/features/new-tab/calendar/calendar-loader"
import { CalendarSkeleton } from "@/components/features/new-tab/calendar/calendar-skeleton"
import { NewTabContent } from "@/components/features/new-tab/new-tab-content"
import { NewsLoader } from "@/components/features/new-tab/news/news-loader"
import { NewsSkeleton } from "@/components/features/new-tab/news/news-skeleton"
import { StockLoader } from "@/components/features/new-tab/stock/stock-loader"
import { StockSkeleton } from "@/components/features/new-tab/stock/stock-skeleton"
import { WeatherLoader } from "@/components/features/new-tab/weather/weather-loader"
import { WeatherSkeleton } from "@/components/features/new-tab/weather/weather-skeleton"
import { Suspense } from "react"
import { getNewTabCoreData } from "./actions/data"

export default async function NewTabPage() {
  const { links, settings, wallpaper, generalTodos, dailyTasks } =
    await getNewTabCoreData()

  return (
    <NewTabContent
      initialLinks={links}
      initialSettings={settings}
      initialWallpaper={wallpaper}
      initialGeneralTodos={generalTodos}
      initialDailyTasks={dailyTasks}
      weatherWidget={
        <Suspense fallback={<WeatherSkeleton />}>
          <WeatherLoader settings={settings} />
        </Suspense>
      }
      stockWidgets={
        <Suspense
          fallback={<StockSkeleton count={settings.tracked_stocks.length} />}
        >
          <StockLoader settings={settings} />
        </Suspense>
      }
      newsWidget={
        <Suspense fallback={<NewsSkeleton />}>
          <NewsLoader settings={settings} />
        </Suspense>
      }
      calendarWidget={
        <Suspense fallback={<CalendarSkeleton />}>
          <CalendarLoader icalUrl={settings.calendar_ical_url} />
        </Suspense>
      }
    />
  )
}
