export type FormState = {
  error?: string
  success?: boolean
  message?: string
}

export type QuickLink = {
  id: string
  title: string | null
  url: string
  user_id: string
  sort_order: number
}

export type UserSettings = {
  user_id: string
  default_search_engine: string
  wallpaper_mode: "image" | "gradient"
  wallpaper_query: string
  gradient_from: string | null
  gradient_to: string | null
  weather_lat: number | null
  weather_lon: number | null
}

export type WallpaperInfo = {
  url: string
  artist: string
  photoUrl: string
  isLocked: boolean
}

export type CurrentWeather = {
  temp: number
  min_temp: number
  max_temp: number
  icon: string
  description: string
  wind_speed: number
  wind_deg: number
  pop: number
}

export type HourlyWeather = {
  time: string
  temp: number
  icon: string
  description: string
  pop: number
}

export type WeatherData = {
  current: CurrentWeather
  hourly: HourlyWeather[]
}

export type NewTabItems = {
  links: QuickLink[]
  settings: UserSettings
  wallpaper: WallpaperInfo
  weather: WeatherData | null
}
