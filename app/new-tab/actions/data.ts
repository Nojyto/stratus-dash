"use server"

import { getNews } from "@/lib/external/news"
import { getStockData } from "@/lib/external/stock"
import { getCachedRandomWallpaper } from "@/lib/external/wallpaper"
import { getWeatherForCoords } from "@/lib/external/weather"
import { createClient } from "@/lib/supabase/server"
import type {
  DailyTask,
  DailyTaskWithCompletion,
  GeneralTodo,
  NewTabItems,
  NewsArticle,
  QuickLink,
  UserSettings,
  WallpaperInfo,
  WeatherData,
} from "@/types/new-tab"
import { redirect } from "next/navigation"

function _formatUserSettings(
  dbSettings: {
    user_id: string
    default_search_engine: string | null
    wallpaper_url: string | null
    wallpaper_artist: string | null
    wallpaper_photo_url: string | null
    wallpaper_mode: "image" | "gradient" | null
    wallpaper_query: string | null
    gradient_from: string | null
    gradient_to: string | null
    weather_lat: number | null
    weather_lon: number | null
    news_country: string | null
    news_category: string[] | null
    tracked_stocks: string[] | null
  } | null,
  userId: string
): UserSettings {
  const defaults: UserSettings = {
    user_id: userId,
    default_search_engine: "google",
    wallpaper_mode: "image",
    wallpaper_query: "nature landscape wallpaper",
    gradient_from: "220 70% 50%",
    gradient_to: "280 65% 60%",
    weather_lat: null,
    weather_lon: null,
    news_country: "us",
    news_category: ["general"],
    tracked_stocks: [],
  }

  if (!dbSettings) {
    return defaults
  }

  return {
    user_id: dbSettings.user_id,
    default_search_engine:
      dbSettings.default_search_engine ?? defaults.default_search_engine,
    wallpaper_mode: dbSettings.wallpaper_mode ?? defaults.wallpaper_mode,
    wallpaper_query: dbSettings.wallpaper_query ?? defaults.wallpaper_query,
    gradient_from: dbSettings.gradient_from ?? defaults.gradient_from,
    gradient_to: dbSettings.gradient_to ?? defaults.gradient_to,
    weather_lat: dbSettings.weather_lat,
    weather_lon: dbSettings.weather_lon,
    news_country: dbSettings.news_country ?? defaults.news_country,
    news_category: dbSettings.news_category ?? defaults.news_category,
    tracked_stocks: dbSettings.tracked_stocks ?? defaults.tracked_stocks,
  }
}

async function _getWallpaperInfo(
  formattedSettings: UserSettings,
  dbSettings: {
    wallpaper_url: string | null
    wallpaper_artist: string | null
    wallpaper_photo_url: string | null
  } | null
): Promise<WallpaperInfo> {
  if (
    formattedSettings.wallpaper_mode !== "gradient" &&
    dbSettings?.wallpaper_url &&
    dbSettings?.wallpaper_artist &&
    dbSettings?.wallpaper_photo_url
  ) {
    return {
      url: dbSettings.wallpaper_url,
      artist: dbSettings.wallpaper_artist,
      photoUrl: dbSettings.wallpaper_photo_url,
      isLocked: true,
    }
  }

  if (formattedSettings.wallpaper_mode !== "gradient") {
    const randomPhoto = await getCachedRandomWallpaper(
      formattedSettings.wallpaper_query
    )
    return {
      ...randomPhoto,
      isLocked: false,
    }
  }

  return {
    url: "",
    artist: "",
    photoUrl: "",
    isLocked: false,
  }
}

async function _getWeatherData(
  settings: UserSettings
): Promise<WeatherData | null> {
  if (settings.weather_lat != null && settings.weather_lon != null) {
    return getWeatherForCoords(settings.weather_lat, settings.weather_lon)
  }
  return null
}

async function _getNewsData(
  settings: UserSettings
): Promise<NewsArticle[] | null> {
  return getNews(settings.news_country, settings.news_category, 1)
}

export async function getNewTabItems(): Promise<NewTabItems> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const today = new Date().toISOString().split("T")[0]

  const settingsResult = await supabase
    .from("user_settings")
    .select(
      "user_id, default_search_engine, wallpaper_url, wallpaper_artist, wallpaper_photo_url, wallpaper_mode, wallpaper_query, gradient_from, gradient_to, weather_lat, weather_lon, news_country, news_category, tracked_stocks"
    )
    .eq("user_id", user.id)
    .maybeSingle()

  if (settingsResult.error)
    console.error("Error fetching settings:", settingsResult.error)

  const settings = _formatUserSettings(settingsResult.data, user.id)

  const [
    linksResult,
    generalTodosResult,
    dailyTasksResult,
    wallpaperResult,
    weatherResult,
    newsResult,
    stocksResult,
  ] = await Promise.allSettled([
    supabase
      .from("quick_links")
      .select("id, title, url, user_id, sort_order")
      .eq("user_id", user.id)
      .order("sort_order"),
    supabase
      .from("general_todos")
      .select("*")
      .eq("user_id", user.id)
      .order("sort_order"),
    supabase
      .from("daily_tasks")
      .select("*, daily_task_completions!left(id, completed_date)")
      .eq("user_id", user.id)
      .eq("daily_task_completions.completed_date", today)
      .order("sort_order"),
    _getWallpaperInfo(settings, settingsResult.data),
    _getWeatherData(settings),
    _getNewsData(settings),
    getStockData(settings.tracked_stocks),
  ])

  if (linksResult.status === "rejected")
    console.error("Error fetching links:", linksResult.reason)
  if (generalTodosResult.status === "rejected")
    console.error("Error fetching general todos:", generalTodosResult.reason)
  if (dailyTasksResult.status === "rejected")
    console.error("Error fetching daily tasks:", dailyTasksResult.reason)
  if (wallpaperResult.status === "rejected")
    console.error("Error fetching wallpaper:", wallpaperResult.reason)
  if (weatherResult.status === "rejected")
    console.error("Error fetching weather:", weatherResult.reason)
  if (newsResult.status === "rejected")
    console.error("Error fetching news:", newsResult.reason)
  if (stocksResult.status === "rejected")
    console.error("Error fetching stocks:", stocksResult.reason)

  const links =
    linksResult.status === "fulfilled"
      ? ((linksResult.value.data as QuickLink[]) ?? [])
      : []
  const generalTodos =
    generalTodosResult.status === "fulfilled"
      ? ((generalTodosResult.value.data as GeneralTodo[]) ?? [])
      : []
  const dailyTasksResultData =
    dailyTasksResult.status === "fulfilled" ? dailyTasksResult.value.data : []
  const wallpaper =
    wallpaperResult.status === "fulfilled"
      ? wallpaperResult.value
      : { url: "", artist: "", photoUrl: "", isLocked: false }
  const weather =
    weatherResult.status === "fulfilled" ? weatherResult.value : null
  const news = newsResult.status === "fulfilled" ? newsResult.value : null
  const stocks = stocksResult.status === "fulfilled" ? stocksResult.value : null

  const dailyTasks: DailyTaskWithCompletion[] = (
    dailyTasksResultData || []
  ).map((task: DailyTask & { daily_task_completions: unknown[] }) => ({
    ...task,
    is_completed_today: task.daily_task_completions.length > 0,
  }))

  return {
    links,
    settings,
    wallpaper,
    weather,
    generalTodos,
    dailyTasks,
    news,
    stocks,
  }
}
