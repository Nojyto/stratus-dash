import { AuthButton } from "@/components/common/auth-button"
import { CalendarWidget } from "@/components/features/new-tab/calendar/calendar-widget"
import { NewTabContent } from "@/components/features/new-tab/new-tab-content"
import { NewsWidget } from "@/components/features/new-tab/news/news-widget"
import { StockWidgets } from "@/components/features/new-tab/stock/stock-widgets"
import { WeatherWidget } from "@/components/features/new-tab/weather/weather-widget"
import {
  DEMO_DAILY_TASKS,
  DEMO_GENERAL_TODOS,
  DEMO_LINKS,
  DEMO_NEWS,
  DEMO_SETTINGS,
  DEMO_STOCKS,
  DEMO_WALLPAPER,
  DEMO_WEATHER,
  getDemoCalendarEvents,
} from "@/lib/demo-data"

export default function DemoPage() {
  const demoEvents = getDemoCalendarEvents()

  return (
    <NewTabContent
      initialLinks={DEMO_LINKS}
      initialSettings={DEMO_SETTINGS}
      initialWallpaper={DEMO_WALLPAPER}
      initialGeneralTodos={DEMO_GENERAL_TODOS}
      initialDailyTasks={DEMO_DAILY_TASKS}
      authButton={<AuthButton />}
      weatherWidget={<WeatherWidget initialData={DEMO_WEATHER} />}
      stockWidgets={<StockWidgets initialData={DEMO_STOCKS} />}
      newsWidget={
        <NewsWidget initialNews={DEMO_NEWS} initialSettings={DEMO_SETTINGS} />
      }
      calendarWidget={
        <CalendarWidget initialEvents={demoEvents} hasCalendar={true} />
      }
      isDemo={true}
    />
  )
}
