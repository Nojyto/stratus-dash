import { getNewsData } from "@/app/new-tab/actions/data"
import type { UserSettings } from "@/types/new-tab"
import { NewsWidget } from "./news-widget"

export async function NewsLoader({ settings }: { settings: UserSettings }) {
  const news = await getNewsData(settings)
  return <NewsWidget initialNews={news} initialSettings={settings} />
}
