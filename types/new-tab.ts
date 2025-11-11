export type FormState = {
  error?: string
  success?: boolean
  message?: string
  data?: GeneralTodo | DailyTask
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
  news_country: string
  news_category: string[]
  tracked_stocks: string[]
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

export type NewsArticle = {
  title: string
  description: string
  url: string
  sourceName: string
  urlToImage: string
  author: string | null
  publishedAt: string
}

export type StockData = {
  symbol: string
  current: number
  percentChange: number
  change: number
  previousClose: number
  urlSymbol: string
}

export type NewTabItems = {
  links: QuickLink[]
  settings: UserSettings
  wallpaper: WallpaperInfo
  weather: WeatherData | null
  generalTodos: GeneralTodo[]
  dailyTasks: DailyTaskWithCompletion[]
  news: NewsArticle[] | null
  stocks: StockData[] | null
}

export type GeneralTodo = {
  id: string
  user_id: string
  task: string
  link: string | null
  is_completed: boolean
  sort_order: number
  created_at: string
}

export type DailyTask = {
  id: string
  user_id: string
  task: string
  link: string | null
  sort_order: number
  created_at: string
}

export type DailyTaskWithCompletion = DailyTask & {
  is_completed_today: boolean
}

export type TaskItemType = {
  id: string
  task: string
  link: string | null
  is_completed: boolean
  sort_order: number
}
