"use server"

import { createClient } from "@/lib/supabase/server"
import { unsplash } from "@/lib/unsplash"
import { unstable_cache as cache, revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

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
  settings: UserSettings | null
  wallpaper: WallpaperInfo
  weather: WeatherData | null
}

type OpenWeatherForecastItem = {
  dt: number
  main: {
    temp: number
  }
  weather: {
    icon: string
    description: string
  }[]
  pop: number
}

const FALLBACK_WALLPAPER_URL = "/default-wallpaper.jpg"
const FALLBACK_ARTIST = "Local Image"
const FALLBACK_ARTIST_URL = "#"

const getWeatherForCoords = cache(
  async (lat: number, lon: number): Promise<WeatherData | null> => {
    const apiKey = process.env.OPENWEATHER_API_KEY
    if (!apiKey) {
      console.error("OPENWEATHER_API_KEY is not set.")
      return null
    }

    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`

    try {
      const [currentRes, forecastRes] = await Promise.all([
        fetch(currentWeatherUrl),
        fetch(forecastUrl),
      ])

      if (!currentRes.ok) {
        const errorData = await currentRes.json()
        console.error(
          "Failed to fetch current weather data:",
          errorData.message
        )
        return null
      }
      if (!forecastRes.ok) {
        const errorData = await forecastRes.json()
        console.error("Failed to fetch forecast data:", errorData.message)
        return null
      }

      const currentData = await currentRes.json()
      const forecastData = await forecastRes.json()

      return {
        current: {
          temp: Math.round(currentData.main.temp),
          min_temp: Math.floor(currentData.main.temp_min),
          max_temp: Math.ceil(currentData.main.temp_max),
          icon: currentData.weather[0].icon,
          description: currentData.weather[0].description,
          wind_speed: Math.round(currentData.wind.speed),
          wind_deg: currentData.wind.deg,
          pop: Math.round(forecastData.list[0].pop * 100),
        },
        hourly: forecastData.list
          .slice(0, 5)
          .map((hour: OpenWeatherForecastItem) => ({
            time: new Date(hour.dt * 1000).getHours().toString(),
            temp: Math.round(hour.main.temp),
            icon: hour.weather[0].icon,
            description: hour.weather[0].description,
            pop: Math.round(hour.pop * 100),
          })),
      }
    } catch (e) {
      console.error(
        "Error fetching or parsing weather data:",
        e instanceof Error ? e.message : String(e)
      )
      return null
    }
  },
  ["weather-data"],
  { revalidate: 900 }
)

async function fetchFreshRandomWallpaper(
  query: string
): Promise<Omit<WallpaperInfo, "isLocked">> {
  try {
    const result = await unsplash.photos.getRandom({
      orientation: "landscape",
      query: query || "nature landscape wallpaper",
    })

    if (result.errors || !result.response) {
      console.warn("Unsplash API Error:", result.errors)
      return {
        url: FALLBACK_WALLPAPER_URL,
        artist: FALLBACK_ARTIST,
        photoUrl: FALLBACK_ARTIST_URL,
      }
    }

    const photo = Array.isArray(result.response)
      ? result.response[0]
      : result.response

    return {
      url: photo.urls.regular,
      artist: photo.user.name,
      photoUrl: photo.links.html,
    }
  } catch (e) {
    console.warn(
      "Failed to fetch from Unsplash, returning fallback. Error:",
      e instanceof Error ? e.message : String(e)
    )
    return {
      url: FALLBACK_WALLPAPER_URL,
      artist: FALLBACK_ARTIST,
      photoUrl: FALLBACK_ARTIST_URL,
    }
  }
}

const getCachedRandomWallpaper = cache(
  async (query: string): Promise<Omit<WallpaperInfo, "isLocked">> => {
    return fetchFreshRandomWallpaper(query)
  },
  ["random-wallpaper"],
  { revalidate: 3600 }
)

export async function getNewTabItems(): Promise<NewTabItems> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const [linksResult, settingsResult] = await Promise.all([
    supabase
      .from("quick_links")
      .select("id, title, url, user_id, sort_order")
      .eq("user_id", user.id)
      .order("sort_order"),
    supabase
      .from("user_settings")
      .select(
        "user_id, default_search_engine, wallpaper_url, wallpaper_artist, wallpaper_photo_url, wallpaper_mode, wallpaper_query, gradient_from, gradient_to, weather_lat, weather_lon"
      )
      .eq("user_id", user.id)
      .maybeSingle(),
  ])

  if (linksResult.error)
    console.error("Error fetching links:", linksResult.error)
  if (settingsResult.error)
    console.error("Error fetching settings:", settingsResult.error)

  const settings = settingsResult.data
  let wallpaper: WallpaperInfo
  let weather: WeatherData | null = null

  if (settings?.weather_lat != null && settings?.weather_lon != null) {
    weather = await getWeatherForCoords(
      settings.weather_lat,
      settings.weather_lon
    )
  }

  if (
    settings?.wallpaper_mode !== "gradient" &&
    settings?.wallpaper_url &&
    settings?.wallpaper_artist &&
    settings?.wallpaper_photo_url
  ) {
    wallpaper = {
      url: settings.wallpaper_url,
      artist: settings.wallpaper_artist,
      photoUrl: settings.wallpaper_photo_url,
      isLocked: true,
    }
  } else if (settings?.wallpaper_mode !== "gradient") {
    const randomPhoto = await getCachedRandomWallpaper(
      settings?.wallpaper_query ?? "nature landscape wallpaper"
    )
    wallpaper = {
      ...randomPhoto,
      isLocked: false,
    }
  } else {
    wallpaper = {
      url: "",
      artist: "",
      photoUrl: "",
      isLocked: false,
    }
  }

  const formattedSettings: UserSettings = settings
    ? {
        user_id: settings.user_id,
        default_search_engine: settings.default_search_engine,
        wallpaper_mode: settings.wallpaper_mode ?? "image",
        wallpaper_query:
          settings.wallpaper_query ?? "nature landscape wallpaper",
        gradient_from: settings.gradient_from ?? "220 70% 50%",
        gradient_to: settings.gradient_to ?? "280 65% 60%",
        weather_lat: settings.weather_lat,
        weather_lon: settings.weather_lon,
      }
    : {
        user_id: user.id,
        default_search_engine: "google",
        wallpaper_mode: "image",
        wallpaper_query: "nature landscape wallpaper",
        gradient_from: "220 70% 50%",
        gradient_to: "280 65% 60%",
        weather_lat: null,
        weather_lon: null,
      }

  return {
    links: (linksResult.data as QuickLink[]) ?? [],
    settings: formattedSettings,
    wallpaper,
    weather,
  }
}

export async function getRandomWallpaper(
  query: string
): Promise<Omit<WallpaperInfo, "isLocked">> {
  return fetchFreshRandomWallpaper(query)
}

export async function lockWallpaper(
  url: string,
  artist: string,
  photoUrl: string
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")

  const { error } = await supabase.from("user_settings").upsert(
    {
      user_id: user.id,
      wallpaper_url: url,
      wallpaper_artist: artist,
      wallpaper_photo_url: photoUrl,
      wallpaper_mode: "image",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  )

  if (error) return { success: false, error: error.message }
  revalidatePath("/new-tab")
  return { success: true }
}

export async function unlockWallpaper() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")

  const { error } = await supabase.from("user_settings").upsert(
    {
      user_id: user.id,
      wallpaper_url: null,
      wallpaper_artist: null,
      wallpaper_photo_url: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  )

  if (error) return { success: false, error: error.message }
  revalidatePath("/new-tab")
  return { success: true }
}

export async function updateNewTabSettings(settings: {
  wallpaper_mode?: "image" | "gradient"
  wallpaper_query?: string
  gradient_from?: string | null
  gradient_to?: string | null
  weather_lat?: number | null
  weather_lon?: number | null
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")

  const { error } = await supabase.from("user_settings").upsert(
    {
      user_id: user.id,
      ...settings,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  )

  if (error) return { success: false, error: error.message }
  revalidatePath("/new-tab")
  return { success: true }
}

export async function updateSearchEngine(engine: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")

  const { error } = await supabase.from("user_settings").upsert(
    {
      user_id: user.id,
      default_search_engine: engine,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  )

  if (error) return { success: false, error: error.message }
  revalidatePath("/new-tab")
  return { success: true }
}

async function getNextSortOrder(userId: string): Promise<number> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("quick_links")
    .select("sort_order")
    .eq("user_id", userId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    return 0
  }
  return (data.sort_order ?? 0) + 1
}

export async function createQuickLink(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")

  const title = (formData.get("title") as string) || null
  const url = formData.get("url") as string
  if (!url) throw new Error("URL is required")

  const prefixedUrl =
    url.startsWith("http://") || url.startsWith("https://")
      ? url
      : `https://${url}`

  const sortOrder = await getNextSortOrder(user.id)

  const { error } = await supabase.from("quick_links").insert({
    user_id: user.id,
    title,
    url: prefixedUrl,
    sort_order: sortOrder,
  })

  if (error) return { success: false, error: error.message }
  revalidatePath("/new-tab")
  return { success: true }
}

export async function updateQuickLink(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get("id") as string
  const title = (formData.get("title") as string) || null
  const url = formData.get("url") as string

  if (!id || !url) throw new Error("ID and URL are required")

  const prefixedUrl =
    url.startsWith("http://") || url.startsWith("https://")
      ? url
      : `https://${url}`

  const { error } = await supabase
    .from("quick_links")
    .update({ title, url: prefixedUrl })
    .eq("id", id)

  if (error) return { success: false, error: error.message }
  revalidatePath("/new-tab")
  return { success: true }
}

export async function deleteQuickLink(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("quick_links").delete().eq("id", id)

  if (error) return { success: false, error: error.message }
  revalidatePath("/new-tab")
  return { success: true }
}

export async function updateLinkOrder(
  links: { id: string; sort_order: number }[]
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")

  const updates = links.map((link) =>
    supabase
      .from("quick_links")
      .update({ sort_order: link.sort_order })
      .eq("user_id", user.id)
      .eq("id", link.id)
  )

  const results = await Promise.all(updates)

  const firstError = results.find((res) => res.error)
  if (firstError) {
    console.error("Error updating link order:", firstError.error)
    const errorMessage =
      firstError.error?.message ?? "An unknown database error occurred"
    return { success: false, error: errorMessage }
  }

  revalidatePath("/new-tab")
  return { success: true }
}
