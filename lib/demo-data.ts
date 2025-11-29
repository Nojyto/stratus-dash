import type {
  ClientVEvent,
  DailyTaskWithCompletion,
  GeneralTodo,
  NewsArticle,
  QuickLink,
  StockData,
  UserSettings,
  WallpaperInfo,
  WeatherData,
} from "@/types/new-tab"

export const DEMO_SETTINGS: UserSettings = {
  user_id: "demo",
  default_search_engine: "duckduckgo",
  wallpaper_mode: "image",
  wallpaper_query: "nature",
  gradient_from: "220 70% 50%",
  gradient_to: "280 65% 60%",
  weather_lat: 40.7128,
  weather_lon: -74.006,
  news_country: "us",
  news_category: ["technology"],
  tracked_stocks: ["SPY", "AAPL", "MSFT"],
  calendar_ical_url: "https://demo.calendar/basic.ics",
}

export const DEMO_WALLPAPER: WallpaperInfo = {
  url: "/default-wallpaper.jpg",
  artist: "Local Image",
  photoUrl: "",
  isLocked: true,
}

export const DEMO_LINKS: QuickLink[] = [
  {
    id: "1",
    title: "Google",
    url: "https://google.com",
    user_id: "demo",
    sort_order: 0,
  },
  {
    id: "2",
    title: "GitHub",
    url: "https://github.com",
    user_id: "demo",
    sort_order: 1,
  },
  {
    id: "3",
    title: "YouTube",
    url: "https://youtube.com",
    user_id: "demo",
    sort_order: 2,
  },
  {
    id: "4",
    title: "Reddit",
    url: "https://reddit.com",
    user_id: "demo",
    sort_order: 3,
  },
]

export const DEMO_GENERAL_TODOS: GeneralTodo[] = [
  {
    id: "1",
    user_id: "demo",
    task: "Try Stratus Dash",
    link: null,
    is_completed: true,
    sort_order: 0,
    created_at: "",
  },
  {
    id: "2",
    user_id: "demo",
    task: "Sign up for an account",
    link: "/auth/sign-up",
    is_completed: false,
    sort_order: 1,
    created_at: "",
  },
]

export const DEMO_DAILY_TASKS: DailyTaskWithCompletion[] = [
  {
    id: "1",
    user_id: "demo",
    task: "Check emails",
    link: null,
    sort_order: 0,
    created_at: "",
    is_completed_today: true,
  },
  {
    id: "2",
    user_id: "demo",
    task: "Stand up meeting",
    link: null,
    sort_order: 1,
    created_at: "",
    is_completed_today: false,
  },
]

export const DEMO_WEATHER: WeatherData = {
  current: {
    temp: 22,
    min_temp: 18,
    max_temp: 26,
    icon: "02d",
    description: "partly cloudy",
    wind_speed: 5,
    wind_deg: 180,
    pop: 10,
  },
  hourly: [
    { time: "12", temp: 23, icon: "01d", description: "sunny", pop: 0 },
    { time: "13", temp: 24, icon: "02d", description: "few clouds", pop: 0 },
    { time: "14", temp: 24, icon: "02d", description: "few clouds", pop: 10 },
    {
      time: "15",
      temp: 23,
      icon: "03d",
      description: "scattered clouds",
      pop: 20,
    },
    {
      time: "16",
      temp: 21,
      icon: "04d",
      description: "broken clouds",
      pop: 30,
    },
  ],
}

export const DEMO_STOCKS: StockData[] = [
  {
    symbol: "SPY",
    current: 502.2,
    change: 1.25,
    percentChange: 0.25,
    previousClose: 500.95,
    urlSymbol: "SPY:NYSEARCA",
  },
  {
    symbol: "AAPL",
    current: 175.5,
    change: -0.5,
    percentChange: -0.28,
    previousClose: 176.0,
    urlSymbol: "AAPL:NASDAQ",
  },
]

export const DEMO_NEWS: NewsArticle[] = [
  {
    title: "Stratus Dash Launches New Demo Mode",
    description:
      "Users can now try the productivity dashboard without signing up.",
    url: "/",
    sourceName: "Stratus News",
    urlToImage:
      "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1000&auto=format&fit=crop",
    author: "Dev Team",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "Productivity Tips for 2025",
    description:
      "How to manage your daily tasks effectively using modern tools.",
    url: "/demo",
    sourceName: "LifeHacker",
    urlToImage:
      "https://images.unsplash.com/photo-1499750310159-57751c693181?q=80&w=1000&auto=format&fit=crop",
    author: "Editor",
    publishedAt: new Date().toISOString(),
  },
]

export function getDemoCalendarEvents(): ClientVEvent[] {
  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setHours(now.getHours() + 1, 0, 0, 0)
  const todayEnd = new Date(todayStart)
  todayEnd.setHours(todayEnd.getHours() + 1)

  const tomorrowStart = new Date(now)
  tomorrowStart.setDate(tomorrowStart.getDate() + 1)
  tomorrowStart.setHours(10, 0, 0, 0)
  const tomorrowEnd = new Date(tomorrowStart)
  tomorrowEnd.setHours(11, 30, 0, 0)

  return [
    {
      uid: "demo-1",
      summary: "Team Sync",
      description: "Discuss project roadmap",
      location: "Conference Room A",
      start: todayStart.toISOString(),
      end: todayEnd.toISOString(),
      datetype: "datetime",
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    {
      uid: "demo-2",
      summary: "Client Presentation",
      description: "Q3 Review",
      location: "Zoom",
      start: tomorrowStart.toISOString(),
      end: tomorrowEnd.toISOString(),
      datetype: "datetime",
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  ]
}
