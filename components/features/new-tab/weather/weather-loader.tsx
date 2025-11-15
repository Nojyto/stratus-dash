import { getWeatherData } from "@/app/new-tab/actions/data"
import type { UserSettings } from "@/types/new-tab"
import { WeatherWidget } from "./weather-widget"

export async function WeatherLoader({ settings }: { settings: UserSettings }) {
  const weather = await getWeatherData(settings)
  return <WeatherWidget initialData={weather} />
}
