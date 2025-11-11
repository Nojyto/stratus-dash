import { AuthButton } from "@/components/common/auth-button"
import { NewTabContent } from "@/components/features/new-tab/new-tab-content"
import { getNewTabItems } from "./actions/data"

export default async function NewTabPage() {
  const {
    links,
    settings,
    wallpaper,
    weather,
    generalTodos,
    dailyTasks,
    news,
    stocks,
  } = await getNewTabItems()

  return (
    <NewTabContent
      initialLinks={links}
      initialSettings={settings}
      initialWallpaper={wallpaper}
      initialWeather={weather}
      initialGeneralTodos={generalTodos}
      initialDailyTasks={dailyTasks}
      initialNews={news}
      initialStocks={stocks}
      authButton={<AuthButton />}
    />
  )
}
